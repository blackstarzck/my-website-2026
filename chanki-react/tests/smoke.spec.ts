import { expect, test } from '@playwright/test'

/**
 * 런타임 에러 스모크 테스트.
 *
 * 골든(레이아웃 792값·픽셀 24장)은 원본 사이트 기준이라 콘텐츠 교체와 함께 폐기했다.
 * 그 자리를 메우는 최소한의 그물이다 — 주요 화면을 실제로 거치며 pageerror 가
 * 한 건도 나지 않는지만 본다. 픽셀을 보지 않으므로 시각 회귀는 못 잡지만,
 * "열면 터진다" 부류는 확실히 잡는다.
 */

/** 콘솔 404 는 무시한다 — 노드 이미지가 아직 없는 것은 의도된 상태다. */
function collectPageErrors(page: import('@playwright/test').Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  return errors
}

test.describe.configure({ mode: 'serial' })

test('홈 로드에서 런타임 에러가 없다', async ({ page }) => {
  const errors = collectPageErrors(page)
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.waitForFunction(() => '__engine' in window, undefined, { polling: 100 })
  expect(errors, errors.join(' / ')).toEqual([])
})

test('노드 페이지를 열어도 런타임 에러가 없다', async ({ page }) => {
  const errors = collectPageErrors(page)
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.waitForFunction(() => '__engine' in window, undefined, { polling: 100 })

  // 이미지가 없는 노드를 연다. 이미지 onerror 경로가 여기서 발동한다.
  await page.evaluate(() => {
    ;(window as unknown as { __open(id: string): void }).__open('topik-user')
  })
  await page.waitForTimeout(1200)
  expect(errors, errors.join(' / ')).toEqual([])
})

test('area 노드와 홈 복귀에서 런타임 에러가 없다', async ({ page }) => {
  const errors = collectPageErrors(page)
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.waitForFunction(() => '__engine' in window, undefined, { polling: 100 })

  await page.evaluate(() => {
    const w = window as unknown as {
      __focus(id: string): void
      __uiStore: { getState(): { goHome(): void } }
    }
    w.__focus('frontend')
    w.__uiStore.getState().goHome()
  })
  await page.waitForTimeout(1200)
  expect(errors, errors.join(' / ')).toEqual([])
})
