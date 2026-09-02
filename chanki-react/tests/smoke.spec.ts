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

test('법인 홈페이지가 사이트 카드와 실제 주소로 연결된다', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.waitForFunction(() => '__engine' in window, undefined, { polling: 100 })

  await page.evaluate(() => {
    ;(window as unknown as { __open(id: string): void }).__open('corp-sites')
  })

  const cards = page.locator('#doc .pc')
  await expect(page.locator('#doc .repolab')).toHaveText('사이트 · 6')
  await expect(cards).toHaveCount(6)
  await expect(page.locator('#doc .pc-n')).toHaveText([
    '케듀올',
    '부클리',
    '위즈덤셀러',
    '북차카',
    '글로윈 비나 (북카페)',
    '비블리아',
  ])
  await expect(page.locator('#doc .pc-code')).toHaveCount(0)
  await expect(page.locator('#doc .pc-go')).toHaveText(Array(6).fill('사이트 열기 ↗'))
  await expect(cards.nth(0).locator('.pc-go')).toHaveAttribute('href', /^https:\/\/keduall\.com\/?$/)
  await expect(cards.nth(5).locator('.pc-go')).toHaveAttribute('href', /^https:\/\/hibiblia\.com\/?$/)

  await cards.nth(1).locator('.pc-hit').click()
  await expect(page.locator('#doc .gview img')).toHaveAttribute('src', '/assets/corp-sites-bookly.jpg')
})

test('카드 선택과 이미지 모달의 이전·다음 이동이 연결된다', async ({ page }) => {
  const errors = collectPageErrors(page)
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.waitForFunction(() => '__engine' in window, undefined, { polling: 100 })

  await page.evaluate(() => {
    ;(window as unknown as { __open(id: string): void }).__open('game-lab')
  })

  const cards = page.locator('#doc .pc')
  await expect(cards).toHaveCount(5)
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

test('포켓몬 도감과 능력치 카드 게임이 실험실의 독립 페이지로 열린다', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.waitForFunction(() => '__engine' in window, undefined, { polling: 100 })

  const projects = [
    {
      id: 'pokemon',
      heading: '이름·번호·특성·타입으로 포켓몬을 찾고',
      demo: 'https://chanki-pokedx.netlify.app/',
      repo: 'https://github.com/blackstarzck/pokemon',
    },
    {
      id: 'game-cards',
      heading: '얼굴 사진으로 능력치 카드를 만들고',
      demo: 'https://simple-gatcha.netlify.app/',
      repo: 'https://github.com/blackstarzck/game-cards',
    },
  ]

  for (const project of projects) {
    await page.evaluate((id) => {
      ;(window as unknown as { __open(id: string): void }).__open(id)
    }, project.id)

    await expect(page.locator('#doc .title')).toContainText(project.heading)
    await expect(page.locator('#doc .cta')).toHaveAttribute('href', project.demo)
    await expect(page.locator('#doc .repos .repo')).toHaveAttribute('href', project.repo)
    await expect(page.locator('#doc .gview img')).toHaveAttribute('src', `/assets/${project.id}.jpg`)
  }
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

test('AI 작업 페이지가 저장소 근거를 사례 연구로 보여준다', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.waitForFunction(() => '__engine' in window, undefined, { polling: 100 })

  await page.evaluate(() => {
    ;(window as unknown as { __open(id: string): void }).__open('video-agent')
  })

  await expect(page.locator('#doc .ai-article')).toBeVisible()
  await expect(page.locator('#doc .ai-stats')).toHaveCount(0)
  await expect(page.locator('#doc .media')).toHaveCount(0)
  await expect(page.locator('#doc .ai-workflow li')).toHaveCount(6)
  await expect(page.locator('#doc .ai-table-figure tbody tr')).toHaveCount(5)
  await expect(page.locator('#doc .ai-source').first()).toHaveAttribute('href', /topik-quest-prompt-sot-drift-root-cause/)

  const articleWidth = await page.locator('#doc .ai-article').evaluate((el) => el.getBoundingClientRect().width)
  const docWidth = await page.locator('#doc').evaluate((el) => el.getBoundingClientRect().width)
  expect(articleWidth).toBeLessThanOrEqual(docWidth)
})

test('문서 통합 페이지가 프론트와 서버의 업무 흐름을 사례 연구로 보여준다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.waitForFunction(() => '__engine' in window, undefined, { polling: 100 })

  await page.evaluate(() => {
    ;(window as unknown as { __open(id: string): void }).__open('doc-merge')
  })

  await expect(page.locator('#doc .media')).toBeVisible()
  await expect(page.locator('#doc .ai-article')).toBeVisible()
  await expect(page.locator('#doc .repos .repo')).toHaveCount(2)
  await expect(page.locator('#doc .ai-workflow li')).toHaveCount(8)
  await expect(page.locator('#doc .ai-table-figure')).toHaveCount(2)
  await expect(page.locator('#doc .ai-table-figure').first().locator('tbody tr')).toHaveCount(6)
  await expect(page.locator('#doc .ai-source').last()).toHaveAttribute('href', /transaction\.interceptor\.ts/)

  const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth)
  expect(pageWidth).toBeLessThanOrEqual(390)
})

test('밀리 관리자 대시보드가 개인 프로젝트와 실제 화면으로 등록된다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.waitForFunction(() => '__engine' in window, undefined, { polling: 100 })

  await page.evaluate(() => {
    ;(window as unknown as { __open(id: string): void }).__open('millie-admin-dashboard')
  })

  await expect(page.locator('#doc .kicker')).toHaveText('개인 프로젝트 · 2025')
  await expect(page.locator('#doc .cta')).toHaveAttribute('href', 'https://millie-admin-dashboard.vercel.app/#/dashboard')
  await expect(page.locator('#doc .repos .repo')).toHaveAttribute('href', 'https://github.com/blackstarzck/millie-admin-dashboard')
  await expect(page.locator('#doc .media')).toBeVisible()
  await expect(page.locator('#doc .imgstrip .it')).toHaveCount(2)
  await expect(page.locator('#doc .ai-article')).toBeVisible()
  await expect(page.locator('#doc .ai-workflow li')).toHaveCount(6)
  await expect(page.locator('#doc .ai-table-figure')).toHaveCount(2)
  await expect(page.locator('#doc .ai-caveat')).toContainText('공식 프로젝트가 아닌 개인')

  const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth)
  expect(pageWidth).toBeLessThanOrEqual(390)
})

test('연락 페이지가 경력 근거와 협업 방식을 채용 담당자에게 보여준다', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          ;(window as typeof window & { __copiedEmail?: string }).__copiedEmail = text
        },
      },
    })
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.waitForFunction(() => '__engine' in window, undefined, { polling: 100 })

  await page.evaluate(() => {
    ;(window as unknown as { __open(id: string): void }).__open('contact')
  })

  await expect(page.locator('#doc .title')).toContainText('사용자의 불편')
  await expect(page.locator('#doc .meta .v').nth(1)).toHaveText('blackstarzck@naver.com')
  const timelineItems = page.locator('#doc [data-contact-timeline-item]')
  await expect(timelineItems).toHaveCount(8)
  await expect(page.locator('#doc .contact-timeline-project')).toHaveCount(10)
  await expect(page.locator('#doc .contact-timeline-item', { hasText: '코로나19' })).toContainText('웹 개발을 새로운 커리어로 결정했습니다.')
  // 본문 없는 이력은 제목만 남는다. toHaveCount(1) 이 없으면 항목을 못 찾아도 통과한다.
  for (const brief of ['가자하와이', 'G-Bridge']) {
    const briefItem = page.locator('#doc .contact-timeline-item', { hasText: brief })
    await expect(briefItem).toHaveCount(1)
    await expect(briefItem.locator('p')).toHaveCount(0)
  }
  // 카드에서 이어지는 노드 칩. 스마트팜 관리자 페이지만 대응 노드가 없어 칩이 빠진다.
  await expect(page.locator('#doc .contact-timeline-link')).toHaveCount(11)
  await expect(page.locator('#doc .contact-collab-item')).toHaveCount(4)
  await expect(page.locator('#doc .contact-fit li')).toHaveCount(4)
  const revealSections = page.locator('#doc .contact-reveal')
  await expect(revealSections).toHaveCount(4)
  await expect(revealSections.last()).not.toHaveClass(/is-visible/)
  expect(await revealSections.first().evaluate((element) => parseFloat(getComputedStyle(element).marginBottom))).toBeGreaterThanOrEqual(96)
  for (let index = 0; index < 4; index++) {
    await revealSections.nth(index).scrollIntoViewIfNeeded()
    await expect(revealSections.nth(index)).toHaveClass(/is-visible/)
  }
  for (let index = 0; index < 8; index++) {
    await timelineItems.nth(index).scrollIntoViewIfNeeded()
    await expect(timelineItems.nth(index)).toHaveClass(/is-visible/)
  }
  await expect(page.locator('#doc .contact-close>p')).toHaveText('사용자의 불편을 발견해 더 나은 경험과 제품 가치로 연결하는 프론트엔드 개발자 김찬기입니다.')
  await expect(page.locator('#doc .contact-mail')).toHaveAttribute('href', 'mailto:blackstarzck@naver.com')
  await expect(page.locator('#doc .contact-mail')).toHaveText('blackstarzck@naver.com')
  const resumeDownload = page.locator('#doc .resume-download')
  await expect(resumeDownload).toHaveText('2024 소개, 이력서')
  await expect(resumeDownload).toHaveAttribute('href', '/chanki-resume.pdf')
  await expect(resumeDownload).toHaveAttribute('download', 'chanki-resume.pdf')
  const downloadPromise = page.waitForEvent('download')
  await resumeDownload.click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('chanki-resume.pdf')
  const copyEmailButton = page.locator('#doc .contact-copy')
  await expect(copyEmailButton).toHaveAttribute('aria-label', '이메일 주소를 클립보드에 복사')
  await copyEmailButton.click()
  await expect.poll(() => page.evaluate(() => (window as typeof window & { __copiedEmail?: string }).__copiedEmail)).toBe('blackstarzck@naver.com')
  await expect(page.locator('.message')).toContainText('이메일 주소가 클립보드에 복사되었습니다.')
  await expect(page.locator('.message')).toHaveClass(/is-visible/)
  await page.waitForTimeout(3300)
  await expect(page.locator('.message')).toHaveCount(0)
  await expect(page.locator('#doc .media')).toHaveCount(0)

  const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth)
  expect(pageWidth).toBeLessThanOrEqual(390)
})

test('연락 타임라인 카드의 칩이 연관 프로젝트 페이지로 이동한다', async ({ page }) => {
  // 움직임 줄이기로 두면 타임라인 항목이 gsap 없이 바로 보여서 클릭이 안정적이다.
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.waitForFunction(() => '__engine' in window, undefined, { polling: 100 })

  await page.evaluate(() => {
    ;(window as unknown as { __open(id: string): void }).__open('contact')
  })

  const topikChips = page
    .locator('#doc .contact-timeline-project', { hasText: '도토리 TOPIK 학습 서비스' })
    .locator('.contact-timeline-link')
  await expect(topikChips).toHaveCount(3)
  await expect(topikChips).toHaveText([
    '도토리 토픽 · 사용자단→',
    '도토리 토픽 · 관리자단→',
    'TOPIK AI 검증 하네스→',
  ])
  await expect(topikChips.first()).toHaveAttribute('href', '#/topik-user')
  await expect(topikChips.first()).toHaveAttribute('data-go', 'topik-user')
  // 칩 색은 대상 노드의 region 색을 따른다 — frontend #4FC3F7, ai #CFFF04.
  await expect(topikChips.nth(0)).toHaveCSS('color', 'rgb(79, 195, 247)')
  await expect(topikChips.nth(2)).toHaveCSS('color', 'rgb(207, 255, 4)')

  // 대응 노드가 없는 카드에는 칩이 붙지 않는다.
  await expect(
    page.locator('#doc .contact-timeline-project', { hasText: '스마트팜 관리자 페이지' })
      .locator('.contact-timeline-link'),
  ).toHaveCount(0)

  const dealerChip = page
    .locator('#doc .contact-timeline-project', { hasText: '관리자 페이지 UI 개선' })
    .locator('.contact-timeline-link')
  await dealerChip.scrollIntoViewIfNeeded()
  await dealerChip.click()

  await expect.poll(() => page.evaluate(() => location.hash)).toBe('#/dealer-admin')
  await expect(page.locator('#doc .title')).toContainText('반복 입력이 많던 관리자 화면')
})

test('움직임 줄이기 설정에서는 연락 섹션을 즉시 보여준다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/', { waitUntil: 'networkidle' })
  await page.waitForFunction(() => '__engine' in window, undefined, { polling: 100 })

  await page.evaluate(() => {
    ;(window as unknown as { __open(id: string): void }).__open('contact')
  })

  const revealSections = page.locator('#doc .contact-reveal')
  await expect(revealSections).toHaveCount(4)
  for (let index = 0; index < 4; index++) {
    await expect(revealSections.nth(index)).toHaveClass(/is-visible/)
    await expect(revealSections.nth(index)).toHaveCSS('opacity', '1')
  }
  const timelineItems = page.locator('#doc [data-contact-timeline-item]')
  await expect(timelineItems).toHaveCount(8)
  for (let index = 0; index < 8; index++) {
    await expect(timelineItems.nth(index)).toHaveClass(/is-visible/)
    await expect(timelineItems.nth(index)).toHaveCSS('opacity', '1')
  }
})
