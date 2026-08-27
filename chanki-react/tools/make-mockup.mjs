/**
 * 화면 캡처를 노드 이미지 규격(16:10)으로 합성한다.
 *
 * 캡처 비율에 따라 방식이 갈린다. 원본 비율과 슬롯 비율(1:0.625)이 크게 다르면
 * cover 로 넣었을 때 대부분이 잘려 나가기 때문이다.
 *
 *   세로형(세로/가로 >= 1.6)  기기 프레임에 넣고 아래로 흘려보낸다.
 *                             모바일 전체 페이지는 원래 스크롤되는 화면이므로
 *                             잘리는 것이 아니라 "길다" 로 읽힌다.
 *   그 외                      브라우저 프레임에 통째로 담는다(contain).
 *                             대시보드는 잘리면 정보가 사라지므로 줄여서 넣는다.
 *
 *   node tools/make-mockup.mjs <원본이미지> <노드id> [--phone|--window]
 *
 * 카드 슬롯은 16:9 로 다시 잘리므로(위아래 각 5.6%) 글자는 세로 가운데에 둔다.
 */
import { chromium } from '@playwright/test'
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const W = 1600
const H = 1000

const argv = process.argv.slice(2)
const force = argv.find((a) => a === '--phone' || a === '--window')
const [SRC, ID] = argv.filter((a) => !a.startsWith('--'))
if (!SRC || !ID) {
  console.error('사용법: node tools/make-mockup.mjs <원본이미지> <노드id> [--phone|--window]')
  process.exit(1)
}
if (!existsSync(SRC)) {
  console.error('원본이 없다: ' + SRC)
  process.exit(1)
}

/** data/*.ts 는 JSON 형태로 생성된다. 필요한 블록만 뽑는다. */
function extract(src, name) {
  const i = src.indexOf(`export const ${name}`)
  const start = src.indexOf('=', i) + 1
  const from = start + src.slice(start).search(/[[{]/)
  const open = src[from]
  const close = open === '[' ? ']' : '}'
  let depth = 0
  let inStr = false
  for (let k = from; k < src.length; k++) {
    const c = src[k]
    if (inStr) {
      if (c === '\\') k++
      else if (c === '"') inStr = false
      continue
    }
    if (c === '"') inStr = true
    else if (c === open) depth++
    else if (c === close && --depth === 0) return JSON.parse(src.slice(from, k + 1))
  }
  throw new Error(`${name} 블록이 닫히지 않았다`)
}

const NODES = extract(readFileSync(join(ROOT, 'data', 'nodes.ts'), 'utf8'), 'NODES')
const regionsSrc = readFileSync(join(ROOT, 'data', 'regions.ts'), 'utf8')
const COLOR = extract(regionsSrc, 'COLOR')
const AGRAD = extract(regionsSrc, 'AGRAD')
const RLAB = extract(regionsSrc, 'RLAB')

const n = NODES.find((x) => x.id === ID)
if (!n) {
  console.error(`노드를 찾지 못했다: ${ID}`)
  process.exit(1)
}

const mime = extname(SRC).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg'
const dataUri = `data:${mime};base64,${readFileSync(SRC).toString('base64')}`
const acc = COLOR[n.region]
const [g0, g1] = AGRAD[n.region]
const esc = (s) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const fontB64 = readFileSync(join(ROOT, 'public', 'fonts', 'PretendardVariable.woff2')).toString('base64')

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 })

// 원본 비율은 브라우저에 실제로 올려 잰다 — 포맷마다 헤더를 따로 파싱하지 않아도 된다.
await page.setContent(`<img id="m" src="${dataUri}">`)
await page.waitForFunction(() => {
  const i = document.getElementById('m')
  return i && i.complete && i.naturalWidth > 0
})
const { iw, ih } = await page.evaluate(() => {
  const i = document.getElementById('m')
  return { iw: i.naturalWidth, ih: i.naturalHeight }
})
const ratio = ih / iw
const phone = force ? force === '--phone' : ratio >= 1.6

const COMMON = `
@font-face{font-family:P;src:url(data:font/woff2;base64,${fontB64}) format("woff2-variations");font-weight:45 920}
*{margin:0;padding:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;background:#08080b;font-family:P,sans-serif;overflow:hidden;position:relative}
.glow{position:absolute;inset:0;background:
  radial-gradient(820px 640px at 72% 40%, ${g0}22, transparent 64%),
  radial-gradient(560px 560px at 12% 78%, ${g1}18, transparent 68%)}
.tx{position:absolute;left:86px;top:50%;transform:translateY(-50%);width:${phone ? 560 : 470}px}
.reg{font-size:15px;letter-spacing:.24em;text-transform:uppercase;color:${acc};font-weight:600}
/* 한글은 기본이 글자 단위 줄바꿈이라 "시각화" 가 "시각/화" 로 쪼개진다.
   keep-all 로 어절을 지키고, balance 로 마지막 줄에 한 글자만 남는 것을 막는다. */
.nm{margin-top:20px;font-size:${phone ? 60 : 50}px;line-height:1.12;font-weight:700;color:#f4f4f6;letter-spacing:-.02em;word-break:keep-all;text-wrap:balance}
.kk{margin-top:20px;font-size:20px;color:#f4f4f6;opacity:.48}
.bar{position:absolute;left:0;bottom:0;height:5px;width:100%;background:linear-gradient(90deg,${g0},${g1})}`

const PHONE = `
.dev{position:absolute;right:132px;top:104px;width:372px;height:1020px;
  border-radius:42px;padding:11px;background:#141418;
  border:1px solid rgba(255,255,255,.14);
  box-shadow:0 40px 90px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.04) inset}
.scr{width:100%;height:100%;border-radius:32px;overflow:hidden;background:#fff}
.scr img{width:100%;display:block}
.fade{position:absolute;right:132px;bottom:0;width:394px;height:230px;
  background:linear-gradient(to bottom, transparent, #08080b 82%)}`

const WINDOW = `
.win{position:absolute;right:74px;top:50%;transform:translateY(-50%);
  width:912px;height:868px;border-radius:14px;overflow:hidden;background:#16161a;
  border:1px solid rgba(255,255,255,.14);
  box-shadow:0 40px 90px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.04) inset}
.tb{height:38px;display:flex;align-items:center;gap:8px;padding:0 15px;
  background:#1d1d22;border-bottom:1px solid rgba(255,255,255,.08)}
.tb i{width:11px;height:11px;border-radius:50%;background:rgba(255,255,255,.18)}
.win img{width:100%;height:calc(100% - 38px);object-fit:contain;display:block;background:#fff}`

const body = phone
  ? `<div class="dev"><div class="scr"><img src="${dataUri}"></div></div><div class="fade"></div>`
  : `<div class="win"><div class="tb"><i></i><i></i><i></i></div><img src="${dataUri}"></div>`

writeFileSync(
  join(ROOT, 'public', 'assets', '__mockup.html'),
  `<!doctype html><meta charset="utf-8"><style>${COMMON}${phone ? PHONE : WINDOW}</style>
<div class="glow"></div>${body}
<div class="tx">
  <div class="reg">${esc(RLAB[n.region] ?? n.region)}</div>
  <div class="nm">${esc(n.name)}</div>
  ${n.kicker ? `<div class="kk">${esc(n.kicker)}</div>` : ''}
</div>
<div class="bar"></div>`,
  'utf8',
)

const tmp = join(ROOT, 'public', 'assets', '__mockup.html')
await page.goto(pathToFileURL(tmp).href)
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(400)
await page.screenshot({ path: join(ROOT, 'public', 'assets', `${ID}.jpg`), type: 'jpeg', quality: 88 })
unlinkSync(tmp)
await browser.close()
console.log(`  ${ID}.jpg  <-  ${SRC.split(/[\\/]/).pop()}  ${iw}x${ih} (1:${ratio.toFixed(2)}) -> ${phone ? '기기' : '브라우저'} 프레임`)
