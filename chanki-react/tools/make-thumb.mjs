/**
 * 화면 캡처를 노드 썸네일(16:10)과 모달용 원본으로 만든다.
 *
 * 썸네일에는 장식을 넣지 않는다 — 캡처 자체만 보인다. 다만 슬롯이 16:10 인데
 * 캡처는 그 비율이 아니므로 두 갈래로 나눈다.
 *
 *   세로로 긴 것(세로/가로 >= 2)   몇 등분해 가로로 나란히 놓는다. 모바일 전체
 *                                  페이지를 잘라 붙이면 넓은 화면 안에 전체가
 *                                  들어오고, 잘려나가는 부분이 없다.
 *   그 외                          16:10 으로 잘라 채운다. 잘려나간 부분은
 *                                  모달에서 원본으로 볼 수 있다.
 *
 * 모달용 원본은 <id>-full.jpg 로 함께 만든다. 원본 PNG 를 그대로 올리면
 * 배포가 무거워지므로 폭 상한을 두고 JPEG 로 줄인다.
 *
 *   node tools/make-thumb.mjs <원본이미지> <노드id> [--crop-top <px>] [--slices <n>]
 */
import { chromium } from '@playwright/test'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const ASSETS = join(ROOT, 'public', 'assets')
const W = 1600 // 썸네일 폭 (16:10)
const H = 1000
const FULL_MAX_W = 1400 // 모달용 원본의 폭 상한
const TALL = 2.0 // 이 비율부터 잘라서 나란히 놓는다

const argv = process.argv.slice(2)
const numOpt = (flag) => {
  const i = argv.indexOf(flag)
  return i >= 0 ? Number(argv[i + 1]) || 0 : 0
}
const CROP = numOpt('--crop-top')
const FORCE_SLICES = numOpt('--slices')
const skip = new Set()
for (const f of ['--crop-top', '--slices']) {
  const i = argv.indexOf(f)
  if (i >= 0) skip.add(i + 1)
}
const [SRC, ID] = argv.filter((a, i) => !a.startsWith('--') && !skip.has(i))

if (!SRC || !ID) {
  console.error('사용법: node tools/make-thumb.mjs <원본이미지> <노드id> [--crop-top <px>] [--slices <n>]')
  process.exit(1)
}
if (!existsSync(SRC)) {
  console.error('원본이 없다: ' + SRC)
  process.exit(1)
}

const mime = extname(SRC).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg'
const dataUri = `data:${mime};base64,${readFileSync(SRC).toString('base64')}`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 100, height: 100 } })

const r = await page.evaluate(
  async ({ uri, W, H, CROP, TALL, FORCE, FULL_MAX_W }) => {
    const img = new Image()
    img.src = uri
    await img.decode()
    const iw = img.naturalWidth
    const ch = img.naturalHeight - CROP // 잘라낸 뒤 높이
    const ratio = ch / iw

    // ── 썸네일 ─────────────────────────────────────────────────────────
    const cv = document.createElement('canvas')
    cv.width = W * 2 // 2배로 그려 축소 저장한다 (선명도)
    cv.height = H * 2
    const cx = cv.getContext('2d')
    cx.imageSmoothingQuality = 'high'

    let slices = 0
    if (ratio >= TALL) {
      // 몇 등분해야 가로세로가 16:10 에 가까워지는지: (iw*N)/(ch/N) = W/H
      slices = FORCE || Math.max(2, Math.round(Math.sqrt((W / H) * ratio)))
      const segH = ch / slices // 원본에서 한 조각의 높이
      const colW = cv.width / slices // 캔버스에서 한 조각의 폭
      const colH = (colW * segH) / iw // 비율 유지 시 높이
      const scale = colH > cv.height ? cv.height / colH : 1 // 넘치면 줄인다
      const dw = colW * scale
      const dh = colH * scale
      const offX = (cv.width - dw * slices) / 2
      const offY = (cv.height - dh) / 2
      for (let i = 0; i < slices; i++) {
        cx.drawImage(img, 0, CROP + segH * i, iw, segH, offX + dw * i, offY, dw, dh)
      }
    } else {
      // 16:10 으로 채운다(cover). 페이지 캡처는 위쪽이 중요하므로 위를 기준으로.
      const target = cv.width / cv.height
      let sw = iw
      let sh = ch
      if (ratio > 1 / target) sh = iw / target // 세로가 남으면 위에서 자른다
      else sw = ch * target // 가로가 남으면 가운데를 쓴다
      const sx = (iw - sw) / 2
      const sy = CROP
      cx.drawImage(img, sx, sy, sw, sh, 0, 0, cv.width, cv.height)
    }
    const thumb = cv.toDataURL('image/jpeg', 0.9)

    // ── 모달용 원본 (크롭만 반영, 잘라내기 없음) ────────────────────────
    const fw = Math.min(iw, FULL_MAX_W)
    const fs = fw / iw
    const fv = document.createElement('canvas')
    fv.width = Math.round(fw)
    fv.height = Math.round(ch * fs)
    const fx = fv.getContext('2d')
    fx.imageSmoothingQuality = 'high'
    fx.drawImage(img, 0, CROP, iw, ch, 0, 0, fv.width, fv.height)
    const full = fv.toDataURL('image/jpeg', 0.86)

    return { iw, ih: img.naturalHeight, ch, ratio, slices, thumb, full, fw: fv.width, fh: fv.height }
  },
  { uri: dataUri, W, H, CROP, TALL, FORCE: FORCE_SLICES, FULL_MAX_W },
)

const b64 = (u) => Buffer.from(u.split(',')[1], 'base64')
writeFileSync(join(ASSETS, `${ID}.jpg`), b64(r.thumb))
writeFileSync(join(ASSETS, `${ID}-full.jpg`), b64(r.full))
await browser.close()

const kb = (p) => (readFileSync(p).length / 1024).toFixed(0)
console.log(
  `  ${ID}.jpg       ${r.iw}x${r.ih}${CROP ? ` (상단 ${CROP} 잘라 ${r.ch})` : ''} → ` +
    `${r.slices ? `${r.slices}등분 가로 나열` : '16:10 채움'}  ${kb(join(ASSETS, `${ID}.jpg`))} KB`,
)
console.log(`  ${ID}-full.jpg  ${r.fw}x${r.fh}  ${kb(join(ASSETS, `${ID}-full.jpg`))} KB`)
