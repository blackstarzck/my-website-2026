/**
 * 파비콘 생성기.
 *
 * 지도의 핵심 모티프 — 빛나는 중심 노드와 그것을 감싸는 링 — 을 그대로 쓴다.
 * 탭에서는 16px 까지 줄어드므로 형태를 그 이상 넣지 않는다. 위성 점은 링 위에
 * 두 개만 두어 "연결된 지도" 라는 것만 남긴다.
 *
 * 색은 data/regions.ts 에서 읽는다 — 사이트 색이 바뀌면 아이콘도 따라온다.
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
const CORE = COLOR.entry // 지도 중심(진입 노드)의 색
const S1 = COLOR.frontend
const S2 = COLOR.lab

/** 한 변이 S 인 정사각 아이콘. 좌표는 전부 비율로 잡아 크기와 무관하게 같은 그림이 나온다. */
const svg = (S) => {
  const c = S / 2
  const ring = S * 0.335 // 링 반지름
  const dot = S * 0.115 // 중심 점 반지름
  const sat = S * 0.062 // 위성 점 반지름
  const sw = Math.max(1, S * 0.028) // 링 두께 — 16px 로 줄어도 사라지지 않게 하한을 둔다
  const at = (deg, r) => [c + r * Math.cos((deg * Math.PI) / 180), c + r * Math.sin((deg * Math.PI) / 180)]
  const [x1, y1] = at(-38, ring)
  const [x2, y2] = at(148, ring)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs>
    <radialGradient id="g" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${CORE}" stop-opacity=".34"/>
      <stop offset="100%" stop-color="${CORE}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${S}" height="${S}" fill="#08080b"/>
  <circle cx="${c}" cy="${c}" r="${S * 0.46}" fill="url(#g)"/>
  <circle cx="${c}" cy="${c}" r="${ring}" fill="none" stroke="${CORE}" stroke-opacity=".5" stroke-width="${sw}"/>
  <circle cx="${x1}" cy="${y1}" r="${sat}" fill="${S1}"/>
  <circle cx="${x2}" cy="${y2}" r="${sat}" fill="${S2}"/>
  <circle cx="${c}" cy="${c}" r="${dot}" fill="${CORE}"/>
</svg>`
}

const OUT = [
  ['favicon.png', 64],
  ['apple-touch-icon.png', 180],
]

const browser = await chromium.launch()
for (const [name, size] of OUT) {
  const tmp = join(ASSETS, '__icon.html')
  writeFileSync(
    tmp,
    `<!doctype html><style>*{margin:0;padding:0}body{width:${size}px;height:${size}px;overflow:hidden}</style>${svg(size)}`,
    'utf8',
  )
  const page = await browser.newPage({ viewport: { width: size, height: size } })
  await page.goto(pathToFileURL(tmp).href)
  await page.waitForTimeout(150)
  await page.screenshot({ path: join(ASSETS, name), type: 'png' })
  await page.close()
  unlinkSync(tmp)
  console.log(`  ${name}  ${size}x${size}`)
}
await browser.close()
