/**
 * 노드별로 어떤 콘텐츠 필드가 실제 화면에 렌더되는지 측정한다.
 *
 * data/nodes.ts 에 값이 있다고 방문자가 볼 수 있는 것은 아니다. 진입 노드와
 * 리전 노드는 지도에서 눌러도 페이지가 열리지 않고, 프로젝트 상세는 접혀 있다.
 * 검토 문서에 안 보이는 문장이 섞이면 검토 시간이 낭비되므로 실측해 붙인다.
 *
 *   pnpm dev 를 띄운 뒤
 *   node tools/probe-visibility.mjs
 *
 * 결과: tools/.visibility.json  (tools/export-review.py 가 읽는다)
 */
import { chromium } from '@playwright/test'
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000'

const src = readFileSync(join(ROOT, 'data', 'nodes.ts'), 'utf8')
const NODES = JSON.parse(
  src.slice(src.indexOf('NODES: ContentNode[] = [') + 'NODES: ContentNode[] = '.length, src.lastIndexOf(']') + 1),
)

const norm = (s) => String(s ?? '').replace(/\s+/g, ' ').trim()
const probeOf = (v) => norm(v).slice(0, 22)

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(BASE, { waitUntil: 'networkidle' })
await page.waitForFunction(() => '__engine' in window, undefined, { polling: 100 })

/** 모드가 목표값이 될 때까지 기다린다. 전이 애니메이션이 있어 즉시 바뀌지 않는다. */
const waitMode = (m) =>
  page
    .waitForFunction((want) => window.__uiStore.getState().mode === want, m, { timeout: 9000, polling: 120 })
    .then(() => true, () => false)

const goHome = async () => {
  await page.evaluate(() => window.__uiStore.getState().goHome())
  await page.waitForFunction(() => window.__uiStore.getState().mode !== 'page', undefined, { timeout: 9000, polling: 120 }).catch(() => {})
  await page.waitForTimeout(400)
}

const result = {}

for (const n of NODES) {
  // ── 1) 사용자가 지도에서 눌렀을 때 페이지까지 갈 수 있는가 ──────────
  // 엔진은 field 모드에서만 갤러리를 그린다. 실제 사용자도 지도에 먼저
  // 들어간 뒤 노드를 누르므로, 그 순서를 그대로 밟는다.
  await goHome()
  await page.evaluate((r) => window.__focus(r), n.region)
  await page.waitForTimeout(900)
  await page.evaluate((id) => window.__uiStore.getState().selectNode(id), n.id)
  await page.waitForTimeout(1200)

  let reach = 'none'
  if (await waitMode('page')) {
    reach = 'direct' // 노드를 누르자마자 페이지
  } else {
    // 갤러리에 "들어가기" 버튼이 뜨면 그게 페이지로 가는 문이다
    const enterBtn = await page.$(`[data-enter="${n.id}"]`)
    if (enterBtn) {
      await enterBtn.click()
      reach = (await waitMode('page')) ? 'via-gallery' : 'none'
    }
  }
  // 진입 노드는 워드마크가 유일한 문이다
  if (reach === 'none' && n.id === 'chanki') {
    await goHome()
    await page.click('#wordmark')
    if (await waitMode('page')) reach = 'via-wordmark'
  }

  // ── 2) 갤러리에 무엇이 그려지는지 ──────────────────────────────────
  // 갤러리는 body(없으면 sum)를 .gdesc 로 띄운다. 페이지만 보면 이걸 놓친다.
  await goHome()
  await page.evaluate((id) => window.__focus(id), n.id)
  await page.waitForTimeout(1500)
  const galText = norm(
    await page.evaluate(() => {
      const g = document.getElementById('gallery')
      if (!g || g.getBoundingClientRect().height === 0) return ''
      // 갤러리가 이 노드를 보여주고 있을 때만 유효하다
      return g.textContent || ''
    }),
  )
  const galName = await page.evaluate(() => document.querySelector('#gallery .gname')?.textContent?.trim() ?? '')
  const galValid = galName === n.name

  // ── 3) 페이지를 열고 각 필드가 어디에 그려지는지 본다 ───────────────
  await page.evaluate((id) => window.__open(id), n.id)
  await waitMode('page')
  await page.waitForTimeout(500)

  const locate = async (probe) => {
    if (!probe) return null
    const inDoc = await page.evaluate((q) => {
      const doc = document.getElementById('doc')
      if (!doc) return 'none'
      let deepest = null
      for (const el of doc.querySelectorAll('*')) {
        const t = (el.textContent || '').replace(/\s+/g, ' ')
        if (t.includes(q)) deepest = el // 뒤로 갈수록 더 깊은 요소
      }
      if (!deepest) return 'none'
      return deepest.closest('.dive') ? 'dive' : 'page'
    }, probe)
    if (inDoc !== 'none') return inDoc
    // 페이지에 없으면 갤러리를 본다
    if (galValid && galText.includes(probe)) return 'gallery'
    return 'none'
  }

  const pj = n.project || {}
  const f = {}
  for (const k of ['sum', 'body', 'cap', 'kicker']) if (n[k]) f[k] = await locate(probeOf(n[k]))
  for (const k of ['role', 'duration', 'impact', 'scope', 'story']) if (pj[k]) f[k] = await locate(probeOf(pj[k]))
  for (const k of ['objectives', 'impacts']) {
    if (pj[k]?.length) {
      f[k] = []
      for (const v of pj[k]) f[k].push(await locate(probeOf(v)))
    }
  }
  if (pj.skills?.length) {
    f.skills = []
    for (const s of pj.skills) f.skills.push(await locate(probeOf(Array.isArray(s) ? s[0] : s)))
  }
  if (n.links?.length) {
    f.links = []
    for (const l of n.links) f.links.push(await locate(probeOf(Array.isArray(l) ? l[0] : l)))
  }

  result[n.id] = { reach, fields: f }
  console.log(`  ${n.id.padEnd(15)} reach=${reach.padEnd(12)} ${JSON.stringify(f).slice(0, 88)}`)
}

await browser.close()
writeFileSync(join(ROOT, 'tools', '.visibility.json'), JSON.stringify(result, null, 2), 'utf8')
console.log(`\n${Object.keys(result).length}개 노드 측정 → tools/.visibility.json`)
