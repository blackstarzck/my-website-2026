/**
 * 실제 스크린샷을 노드 이미지 규격(1200x800 jpg)으로 맞춰 public/assets/<id>.jpg 에 넣는다.
 * 플레이스홀더와 같은 크기·포맷이라 지도에서 섞여도 어색하지 않다.
 *
 *   node tools/place-shot.mjs <원본경로> <노드id> [<원본경로> <노드id> ...]
 */
import { chromium } from '@playwright/test'
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const W = 1600
const H = 1000

const argv = process.argv.slice(2)
if (!argv.length || argv.length % 2 !== 0) {
  console.error('사용법: node tools/place-shot.mjs <원본경로> <노드id> [...]')
  process.exit(1)
}
const pairs = []
for (let i = 0; i < argv.length; i += 2) pairs.push([argv[i], argv[i + 1]])

for (const [src] of pairs) {
  if (!existsSync(src)) {
    console.error(`원본이 없다: ${src}`)
    process.exit(1)
  }
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 })
const tmp = join(ROOT, 'public', 'assets', '__place.html')

for (const [src, id] of pairs) {
  const b64 = readFileSync(src).toString('base64')
  // 상단 정렬로 크롭한다 — 랜딩 페이지는 위쪽에 핵심이 있다.
  writeFileSync(
    tmp,
    `<!doctype html><meta charset="utf-8"><style>
*{margin:0;padding:0}
body{width:${W}px;height:${H}px;overflow:hidden;background:#08080b}
img{width:${W}px;height:${H}px;object-fit:cover;object-position:top center;display:block}
</style><img src="data:image/png;base64,${b64}">`,
    'utf8',
  )
  await page.goto(pathToFileURL(tmp).href)
  await page.waitForTimeout(300)
  await page.screenshot({ path: join(ROOT, 'public', 'assets', `${id}.jpg`), type: 'jpeg', quality: 88 })
  console.log(`  ${id}.jpg  <-  ${src.split(/[\\/]/).pop()}`)
}

unlinkSync(tmp)
await browser.close()
console.log(`\n${pairs.length}장 배치`)
