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

test('저장소가 하나인 작업도 프로젝트 카드로 보인다', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.waitForFunction(() => '__engine' in window, undefined, { polling: 100 })

  await page.evaluate(() => {
    ;(window as unknown as { __open(id: string): void }).__open('space-3d')
  })

  await expect(page.locator('#doc .pcards .pc')).toHaveCount(1)
  await expect(page.locator('#doc .pc-n')).toHaveText('my-space')
  await expect(page.locator('#doc .pc-go')).toHaveAttribute('href', 'https://blackstarzck.github.io/my-space/')

  await page.setViewportSize({ width: 375, height: 812 })
  const cardWidth = await page.locator('#doc .pc').evaluate((el) => el.getBoundingClientRect().width)
  const gridWidth = await page.locator('#doc .pcards').evaluate((el) => el.getBoundingClientRect().width)
  expect(cardWidth).toBeLessThanOrEqual(gridWidth)
})

test('카드 선택과 이미지 모달의 이전·다음 이동이 연결된다', async ({ page }) => {
  const errors = collectPageErrors(page)
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.waitForFunction(() => '__engine' in window, undefined, { polling: 100 })

  await page.evaluate(() => {
    ;(window as unknown as { __open(id: string): void }).__open('game-lab')
  })

  const cards = page.locator('#doc .pc')
  await expect(cards).toHaveCount(6)
  await cards.nth(1).locator('.pc-hit').click()
  await expect(cards.nth(1)).toHaveClass(/is-selected/)
  await expect(page.locator('#doc .gview img')).toHaveAttribute('src', '/assets/game-lab-2.jpg')

  await page.locator('#doc .mediaframe').click()
  await expect(page.locator('#lightbox')).toBeVisible()
  await expect(page.locator('#lbtitle')).toHaveText('game-cabinet')
  await expect(page.locator('#lbthumbs .lbthumb')).toHaveCount(1)
  await expect(page.locator('#lbactions .lb-code')).toHaveAttribute('href', 'https://github.com/blackstarzck/game-cabinet')
  await expect(page.locator('#lbactions .lb-demo')).toHaveAttribute('href', /^https:\/\/game-cabinet\.vercel\.app\/?$/)
  const modalPresentation = await page.locator('#lbpanel').evaluate((panel) => {
    const main = panel.querySelector<HTMLElement>('#lbmain')!
    const head = panel.querySelector<HTMLElement>('#lbhead')!
    const related = panel.querySelector<HTMLElement>('#lbrelated')!
    const action = panel.querySelector<HTMLElement>('.lb-action')!
    const image = panel.querySelector<HTMLImageElement>('#lbimg')!
    const panelRect = panel.getBoundingClientRect()
    const mainRect = main.getBoundingClientRect()
    const actionStyle = getComputedStyle(action)
    return {
      widthDifference: Math.abs(panelRect.width - mainRect.width),
      heightDifference: Math.abs(panelRect.height - mainRect.height),
      headPosition: getComputedStyle(head).position,
      relatedPosition: getComputedStyle(related).position,
      headHeight: head.getBoundingClientRect().height,
      relatedHeight: related.getBoundingClientRect().height,
      headBackground: getComputedStyle(head).backgroundImage,
      relatedBackground: getComputedStyle(related).backgroundImage,
      imageFit: getComputedStyle(image).objectFit,
      actionBackground: actionStyle.backgroundColor,
      actionBorder: actionStyle.borderTopWidth,
      actionDecoration: actionStyle.textDecorationLine,
    }
  })
  expect(modalPresentation.widthDifference).toBeLessThanOrEqual(2)
  expect(modalPresentation.heightDifference).toBeLessThanOrEqual(2)
  expect(modalPresentation.headPosition).toBe('absolute')
  expect(modalPresentation.relatedPosition).toBe('absolute')
  expect(modalPresentation.headHeight).toBeLessThanOrEqual(116)
  expect(modalPresentation.relatedHeight).toBeLessThanOrEqual(116)
  expect(modalPresentation.headBackground).toContain('linear-gradient')
  expect(modalPresentation.relatedBackground).toContain('linear-gradient')
  expect(modalPresentation.imageFit).toBe('cover')
  expect(modalPresentation.actionBackground).toBe('rgba(0, 0, 0, 0)')
  expect(modalPresentation.actionBorder).toBe('0px')
  expect(modalPresentation.actionDecoration).toContain('underline')

  await page.locator('#lbnext').click()
  await expect(page.locator('#lbtitle')).toHaveText('bridge')
  await expect(page.locator('#lbactions .lb-code')).toHaveAttribute('href', 'https://github.com/blackstarzck/bridge')
  await expect(page.locator('#lbactions .lb-demo')).toHaveAttribute('href', 'https://blackstarzck.github.io/bridge/')
  await expect(page.locator('#doc .gview img')).toHaveAttribute('src', '/assets/game-lab-3.jpg')
  await page.keyboard.press('ArrowLeft')
  await expect(page.locator('#lbtitle')).toHaveText('game-cabinet')

  await page.locator('#lbthumbs .lbthumb').click()
  await expect(page.locator('#lbimg')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('#lightbox')).toBeHidden()
  await expect(page.locator('#doc .pcwrap')).toBeVisible()
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
