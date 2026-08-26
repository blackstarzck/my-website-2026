/**
 * 화면에 실제로 렌더되는 텍스트를 전부 뽑아, 한글이 없는 조각만 보고한다.
 *
 * 소스에서 단어 목록으로 스페인어를 찾는 방식은 대소문자·어휘 누락으로 계속 샜다.
 * 이건 사람이 눈으로 보는 것과 같은 것을 본다 — 주요 화면을 실제로 거치며
 * 텍스트 노드를 수집하고, 한글이 한 글자도 없는 것만 남긴다.
 *
 *   node tools/audit-text.mjs
 */
import { chromium } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000'

/** 코드처럼 보이는 조각은 뺀다 — 기술명·기호·숫자는 원래 한글이 없다. */
const IGNORE = [
  /^[\s\d/·—→←↗↦↖↑↓●○+\-.,%()[\]{}|:#'"~]*$/, // 기호·숫자만
  /^(React|TypeScript|Next\.js|Zustand|Canvas|Angular|NestJS|RxJS|MySQL|Vite|Supabase|Ant Design|amCharts|D3\.js|Python|GitHub|Figma|API|RLS|RPC|CMS|UI|UX|AI|3D|2D|FPS|CSS|HTML|JS|DB|LMS|B2C|OFL|Skills|TOPIK|DADOKe|KEDUALL|CONNECT BEE)$/i,
  /^[A-Za-z0-9._-]+@[A-Za-z0-9._-]+$/,          // 이메일
  /^https?:\/\//,                                // URL
]

function suspicious(t) {
  const s = t.trim()
  if (!s || s.length < 2) return false
  if (/[가-힣]/.test(s)) return false          // 한글이 있으면 통과
  if (!/[A-Za-zÀ-ÿ]/.test(s)) return false     // 라틴 문자가 없으면 관심 없음
  return !IGNORE.some((re) => re.test(s))
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))

await page.goto(BASE, { waitUntil: 'networkidle' })
await page.waitForFunction(() => '__engine' in window, undefined, { polling: 100 })

/** 현재 보이는 텍스트 노드를 전부 수집한다. */
const grab = () =>
  page.evaluate(() => {
    const out = []
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      const el = n.parentElement
      if (!el) continue
      const st = getComputedStyle(el)
      if (st.display === 'none' || st.visibility === 'hidden') continue
      const t = (n.textContent || '').trim()
      if (t) out.push(t)
    }
    // ::after 등 의사요소 content 도 본다 (noimg 캡션이 여기 있다)
    for (const el of document.querySelectorAll('*')) {
      for (const pe of ['::before', '::after']) {
        const c = getComputedStyle(el, pe).content
        if (c && c !== 'none' && c !== 'normal') out.push(c.replace(/^"|"$/g, ''))
      }
    }
    return out
  })

const STATES = [
  ['홈', async () => {}],
  ['area 갤러리', async () => { await page.evaluate(() => window.__focus('frontend')) }],
  ['노드 페이지', async () => { await page.evaluate(() => window.__open('topik-user')) }],
  ['홈 복귀', async () => { await page.evaluate(() => window.__uiStore.getState().goHome()) }],
]

const found = new Map()
for (const [label, act] of STATES) {
  await act()
  await page.waitForTimeout(1400)
  for (const t of await grab()) {
    if (suspicious(t) && !found.has(t)) found.set(t, label)
  }
}

await browser.close()

if (errors.length) {
  console.log(`런타임 에러 ${errors.length}건:`)
  errors.slice(0, 3).forEach((e) => console.log('  ' + e))
  console.log('')
}
if (!found.size) {
  console.log('한글 없는 표시 텍스트: 0건')
} else {
  console.log(`한글 없는 표시 텍스트 ${found.size}건 — 확인 필요:`)
  for (const [t, where] of found) {
    console.log(`  [${where}] ${t.length > 90 ? t.slice(0, 90) + '…' : t}`)
  }
}
