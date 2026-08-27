/**
 * 파비콘 생성기 — 이니셜 CK, 배경 투명.
 *
 * 배경을 비우면 탭이 밝든 어둡든 글자만 얹힌다. 다만 진입 리전 색(연보라)
 * 하나로는 밝은 탭에서 대비가 모자라 외곽에 옅은 테두리를 둔다.
 *
 * 글자는 Pretendard 를 data URI 로 심어 렌더한다. 시스템 폰트에 맡기면
 * 실행 환경마다 자소 모양이 달라진다.
 *
 *   node tools/gen-favicon.mjs
 */
import { chromium } from '@playwright/test'
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const ASSETS = join(ROOT, 'public', 'assets')

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

const COLOR = extract(readFileSync(join(ROOT, 'data', 'regions.ts'), 'utf8'), 'COLOR')
const MARK = COLOR.entry // 지도 중심(진입 노드)의 색
const fontB64 = readFileSync(join(ROOT, 'public', 'fonts', 'PretendardVariable.woff2')).toString('base64')

const OUT = [
  ['favicon.png', 64],
  ['apple-touch-icon.png', 180],
]

const browser = await chromium.launch()
for (const [name, S] of OUT) {
  const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:P;src:url(data:font/woff2;base64,${fontB64}) format("woff2-variations");font-weight:45 920}
*{margin:0;padding:0}
html,body{width:${S}px;height:${S}px;background:transparent}
.m{width:${S}px;height:${S}px;display:grid;place-items:center;
  font-family:P,sans-serif;font-weight:800;color:${MARK};
  font-size:${Math.round(S * 0.5)}px;letter-spacing:${-S * 0.012}px;
  /* 밝은 탭에서도 형태가 남도록 아주 옅은 외곽선을 준다 */
  -webkit-text-stroke:${S * 0.012}px rgba(0,0,0,.30)}
</style><div class="m">CK</div>`
  const tmp = join(ASSETS, '__icon.html')
  writeFileSync(tmp, html, 'utf8')
  const page = await browser.newPage({ viewport: { width: S, height: S } })
  await page.goto(pathToFileURL(tmp).href)
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(150)
  await page.screenshot({ path: join(ASSETS, name), type: 'png', omitBackground: true })
  await page.close()
  unlinkSync(tmp)
  console.log(`  ${name}  ${S}x${S}  (배경 투명)`)
}
await browser.close()
