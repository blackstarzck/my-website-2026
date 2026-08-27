/**
 * 여러 장의 캡처를 한 노드의 썸네일과 모달용 원본으로 묶는다.
 *
 * 스토어 스크린샷처럼 세로형 여러 장이 있을 때 쓴다.
 *
 *   썸네일  가로로 나란히 놓아 16:10 에 맞춘다. 한 장씩 잘리지 않는다.
 *   원본    세로로 쌓는다. 모달은 세로로 스크롤되므로 이쪽이 보기 편하다.
 *
 *   node tools/make-strip.mjs <노드id> <이미지1> <이미지2> ...
 */
import { chromium } from '@playwright/test'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const ASSETS = join(ROOT, 'public', 'assets')
const W = 1600
const H = 1000
const GAP = 22 // 장 사이 간격 — 붙여 놓으면 어디서 끊기는지 안 보인다
const FULL_W = 900 // 모달용 한 장의 폭

const [ID, ...SRCS] = process.argv.slice(2)
if (!ID || SRCS.length < 2) {
  console.error('사용법: node tools/make-strip.mjs <노드id> <이미지1> <이미지2> ...')
  process.exit(1)
}
for (const s of SRCS) {
  if (!existsSync(s)) {
    console.error('원본이 없다: ' + s)
    process.exit(1)
  }
}

const uris = SRCS.map((s) => {
  const mime = extname(s).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg'
  return `data:${mime};base64,${readFileSync(s).toString('base64')}`
})

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 100, height: 100 } })

const r = await page.evaluate(
  async ({ uris, W, H, GAP, FULL_W }) => {
    const imgs = await Promise.all(
      uris.map(async (u) => {
        const im = new Image()
        im.src = u
        await im.decode()
        return im
      }),
    )
    const n = imgs.length

    // ── 썸네일: 가로 나열 ────────────────────────────────────────────
    const cv = document.createElement('canvas')
    cv.width = W * 2
    cv.height = H * 2
    const cx = cv.getContext('2d')
    cx.imageSmoothingQuality = 'high'
    const g = GAP * 2
    const colW = (cv.width - g * (n - 1)) / n
    // 가장 세로가 긴 장을 기준으로 배율을 정해 모두 같은 높이로 맞춘다
    const maxRatio = Math.max(...imgs.map((i) => i.naturalHeight / i.naturalWidth))
    let dh = colW * maxRatio
    let scale = 1
    if (dh > cv.height) {
      scale = cv.height / dh
      dh = cv.height
    }
    const dw = colW * scale
    const totalW = dw * n + g * (n - 1) * scale
    const offX = (cv.width - totalW) / 2
    const offY = (cv.height - dh) / 2
    imgs.forEach((im, i) => {
      const w = dw
      const h = (w * im.naturalHeight) / im.naturalWidth
      cx.drawImage(im, offX + (dw + g * scale) * i, offY + (dh - h) / 2, w, h)
    })
    const thumb = cv.toDataURL('image/jpeg', 0.9)

    // ── 원본: 세로로 쌓기 ────────────────────────────────────────────
    const heights = imgs.map((im) => (FULL_W * im.naturalHeight) / im.naturalWidth)
    const fv = document.createElement('canvas')
    fv.width = FULL_W
    fv.height = Math.round(heights.reduce((a, b) => a + b, 0) + GAP * (n - 1))
    const fx = fv.getContext('2d')
    fx.imageSmoothingQuality = 'high'
    fx.fillStyle = '#0b0b0f'
    fx.fillRect(0, 0, fv.width, fv.height)
    let y = 0
    imgs.forEach((im, i) => {
      fx.drawImage(im, 0, y, FULL_W, heights[i])
      y += heights[i] + GAP
    })
    const full = fv.toDataURL('image/jpeg', 0.86)

    return { n, sizes: imgs.map((i) => `${i.naturalWidth}x${i.naturalHeight}`), thumb, full, fw: fv.width, fh: fv.height }
  },
  { uris, W, H, GAP, FULL_W },
)

const b64 = (u) => Buffer.from(u.split(',')[1], 'base64')
writeFileSync(join(ASSETS, `${ID}.jpg`), b64(r.thumb))
writeFileSync(join(ASSETS, `${ID}-full.jpg`), b64(r.full))
await browser.close()

const kb = (p) => (readFileSync(p).length / 1024).toFixed(0)
console.log(`  ${ID}.jpg       ${r.n}장 가로 나열  ${kb(join(ASSETS, `${ID}.jpg`))} KB  (${r.sizes.join(', ')})`)
console.log(`  ${ID}-full.jpg  ${r.n}장 세로 쌓기  ${r.fw}x${r.fh}  ${kb(join(ASSETS, `${ID}-full.jpg`))} KB`)
