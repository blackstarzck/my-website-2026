/**
 * 세로로 긴 화면 캡처를 노드 이미지 규격(16:10)으로 합성한다.
 *
 * 모바일 전체 페이지 캡처는 세로가 가로의 몇 배라 그대로 자르면 헤더만 남는다.
 * 기기 프레임에 넣어 화면 아래로 흘려보내면 "스크롤되는 긴 페이지" 라는 사실이
 * 그대로 읽히고, 남는 자리에 노드 정보를 둘 수 있다.
 *
 *   node tools/make-mockup.mjs <원본이미지> <노드id>
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

const [SRC, ID] = process.argv.slice(2)
if (!SRC || !ID) {
  console.error('사용법: node tools/make-mockup.mjs <원본이미지> <노드id>')
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
const b64 = readFileSync(SRC).toString('base64')
const acc = COLOR[n.region]
const [g0, g1] = AGRAD[n.region]
const esc = (s) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

const fontB64 = readFileSync(join(ROOT, 'public', 'fonts', 'PretendardVariable.woff2')).toString('base64')

const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:P;src:url(data:font/woff2;base64,${fontB64}) format("woff2-variations");font-weight:45 920}
*{margin:0;padding:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;background:#08080b;font-family:P,sans-serif;overflow:hidden;position:relative}
.glow{position:absolute;inset:0;background:
  radial-gradient(820px 640px at 72% 40%, ${g0}22, transparent 64%),
  radial-gradient(560px 560px at 12% 78%, ${g1}18, transparent 68%)}
/* 기기 프레임 — 아래로 흘려보내 페이지가 길다는 걸 드러낸다 */
.dev{position:absolute;right:132px;top:104px;width:372px;height:1020px;
  border-radius:42px;padding:11px;background:#141418;
  border:1px solid rgba(255,255,255,.14);
  box-shadow:0 40px 90px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.04) inset}
.scr{width:100%;height:100%;border-radius:32px;overflow:hidden;background:#fff}
.scr img{width:100%;display:block}
/* 아래로 갈수록 어두워져 잘린 느낌을 없앤다 */
.fade{position:absolute;right:132px;bottom:0;width:394px;height:230px;
  background:linear-gradient(to bottom, transparent, #08080b 82%)}
.tx{position:absolute;left:86px;top:50%;transform:translateY(-50%);width:560px}
.reg{font-size:15px;letter-spacing:.24em;text-transform:uppercase;color:${acc};font-weight:600}
.nm{margin-top:20px;font-size:60px;line-height:1.12;font-weight:700;color:#f4f4f6;letter-spacing:-.02em}
.kk{margin-top:20px;font-size:20px;color:#f4f4f6;opacity:.48}
.bar{position:absolute;left:0;bottom:0;height:5px;width:100%;background:linear-gradient(90deg,${g0},${g1})}
</style>
<div class="glow"></div>
<div class="dev"><div class="scr"><img src="data:${mime};base64,${b64}"></div></div>
<div class="fade"></div>
<div class="tx">
  <div class="reg">${esc(RLAB[n.region] ?? n.region)}</div>
  <div class="nm">${esc(n.name)}</div>
  ${n.kicker ? `<div class="kk">${esc(n.kicker)}</div>` : ''}
</div>
<div class="bar"></div>`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 })
const tmp = join(ROOT, 'public', 'assets', '__mockup.html')
writeFileSync(tmp, html, 'utf8')
await page.goto(pathToFileURL(tmp).href)
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(400)
const out = join(ROOT, 'public', 'assets', `${ID}.jpg`)
await page.screenshot({ path: out, type: 'jpeg', quality: 88 })
unlinkSync(tmp)
await browser.close()
console.log(`  ${ID}.jpg  <-  ${SRC.split(/[\\/]/).pop()}  (${W}x${H})`)
