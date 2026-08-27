/**
 * 노드 플레이스홀더 이미지 생성기.
 *
 * 실제 스크린샷이 없는 노드를 위해 public/assets/<id>.jpg 를 만든다.
 * 지도의 시각 언어(어두운 바탕 + 리전 색 링 + 방사형 글로우)를 그대로 써서
 * "이미지가 없다"가 아니라 "이 영역의 노드다"로 읽히게 한다.
 *
 * 실제 이미지가 생기면 같은 파일명으로 덮어쓰면 된다.
 *
 *   node tools/gen-placeholders.mjs            # 이미지 없는 노드만
 *   node tools/gen-placeholders.mjs --all      # 전부 다시 생성
 *   node tools/gen-placeholders.mjs --only a,b # 지정한 id 만
 */
import { chromium } from '@playwright/test'
import { readFileSync, existsSync, writeFileSync, unlinkSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const ASSETS = join(ROOT, 'public', 'assets')
// 슬롯 비율은 16:10 이다 (.mediaframe / .ghero). 다른 비율로 만들면 cover 로
// 잘려서 아래쪽 글자가 먼저 사라진다.
const W = 1600
const H = 1000

/** `export const NAME... = <JSON>` 블록을 뽑는다. data/*.ts 는 JSON 형태로 생성된다. */
function extract(src, name) {
  const i = src.indexOf(`export const ${name}`)
  if (i < 0) throw new Error(`${name} 을 찾지 못했다`)
  const start = src.indexOf('=', i) + 1
  const open = src.slice(start).search(/[[{]/)
  const from = start + open
  const openCh = src[from]
  const closeCh = openCh === '[' ? ']' : '}'
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
    else if (c === openCh) depth++
    else if (c === closeCh && --depth === 0) return JSON.parse(src.slice(from, k + 1))
  }
  throw new Error(`${name} 블록이 닫히지 않았다`)
}

const nodesSrc = readFileSync(join(ROOT, 'data', 'nodes.ts'), 'utf8')
const regionsSrc = readFileSync(join(ROOT, 'data', 'regions.ts'), 'utf8')
const NODES = extract(nodesSrc, 'NODES')
const COLOR = extract(regionsSrc, 'COLOR')
const AGRAD = extract(regionsSrc, 'AGRAD')
const RLAB = extract(regionsSrc, 'RLAB')

const argv = process.argv.slice(2)
const all = argv.includes('--all')
const onlyArg = argv.indexOf('--only')
const only = onlyArg >= 0 ? new Set((argv[onlyArg + 1] || '').split(',').filter(Boolean)) : null

const targets = NODES.filter((n) => {
  if (only) return only.has(n.id)
  if (all) return true
  return !existsSync(join(ASSETS, `${n.id}.jpg`))
})

if (!targets.length) {
  console.log('생성할 노드가 없다.')
  process.exit(0)
}

const fontB64 = readFileSync(join(ROOT, 'public', 'fonts', 'PretendardVariable.woff2')).toString('base64')

/** 한 노드의 아트보드 HTML. 폰트는 data URI 로 인라인해 외부 요청을 없앤다. */
function page(n) {
  const [g0, g1] = AGRAD[n.region] ?? AGRAD.entry
  const acc = COLOR[n.region] ?? COLOR.entry
  const esc = (s) =>
    String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
  // 링 반지름은 노드 id 로 결정해 노드마다 조금씩 다르게 — 30장이 전부 같아 보이지 않게 한다.
  const seed = [...n.id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
  const r1 = 210 + (seed % 60)
  const r2 = r1 + 90 + ((seed >> 3) % 70)
  const rot = seed % 360
  return `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:P;src:url(data:font/woff2;base64,${fontB64}) format("woff2-variations");font-weight:45 920}
*{margin:0;padding:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;background:#08080b;font-family:P,sans-serif;overflow:hidden;position:relative}
.glow{position:absolute;inset:0;background:
  radial-gradient(760px 560px at 74% 28%, ${g0}26, transparent 62%),
  radial-gradient(620px 620px at 22% 82%, ${g1}1f, transparent 66%)}
.rings{position:absolute;left:74%;top:34%;transform:translate(-50%,-50%) rotate(${rot}deg)}
.rings i{position:absolute;border-radius:50%;border:1px solid ${acc};display:block;
  left:50%;top:50%;transform:translate(-50%,-50%)}
.r1{width:${r1 * 2}px;height:${r1 * 2}px;opacity:.30}
.r2{width:${r2 * 2}px;height:${r2 * 2}px;opacity:.14;border-style:dashed}
.dot{position:absolute;left:74%;top:34%;width:15px;height:15px;border-radius:50%;
  transform:translate(-50%,-50%);background:${acc};box-shadow:0 0 34px 10px ${acc}66}
/* 카드 슬롯은 16:9 로 다시 잘린다(위아래 각 5.6%). 글자를 아래에 두면
   카드에서 먼저 잘리므로 세로 가운데에 둔다. */
.tx{position:absolute;left:86px;top:50%;transform:translateY(-50%);right:340px}
.reg{font-size:15px;letter-spacing:.24em;text-transform:uppercase;color:${acc};opacity:.92;font-weight:600}
/* 한글은 기본이 글자 단위 줄바꿈이라 어절이 쪼개진다. */
.nm{margin-top:20px;font-size:60px;line-height:1.12;font-weight:700;color:#f4f4f6;letter-spacing:-.02em;word-break:keep-all;text-wrap:balance}
.kk{margin-top:22px;font-size:21px;color:#f4f4f6;opacity:.46;font-weight:400}
.bar{position:absolute;left:0;bottom:0;height:5px;width:100%;background:linear-gradient(90deg,${g0},${g1})}
</style>
<div class="glow"></div>
<div class="rings"><i class="r1"></i><i class="r2"></i></div>
<div class="dot"></div>
<div class="tx">
  <div class="reg">${esc(RLAB[n.region] ?? n.region)}</div>
  <div class="nm">${esc(n.name)}</div>
  ${n.kicker ? `<div class="kk">${esc(n.kicker)}</div>` : ''}
</div>
<div class="bar"></div>`
}

const browser = await chromium.launch()
const p = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 })
const tmp = join(ASSETS, '__ph.html')
for (const n of targets) {
  writeFileSync(tmp, page(n), 'utf8')
  await p.goto('file://' + tmp.replace(/\\/g, '/'))
  await p.evaluate(() => document.fonts.ready)
  await p.screenshot({ path: join(ASSETS, `${n.id}.jpg`), type: 'jpeg', quality: 88 })
  console.log(`  ${n.id}.jpg  (${n.region})`)
}
unlinkSync(tmp)
await browser.close()
console.log(`\n${targets.length}장 생성`)
