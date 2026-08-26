import type { Page } from '@playwright/test'

/** 골든 순서. 앞 6개는 layout-golden.json 의 키와 일치해야 한다. */
export const LAYOUT_STATES = [
  '1-cold', '2-field', '3-fieldgal', '4-trans', '5-page', '6-origen',
] as const
/** 픽셀 전용 추가 상태 — origen 워드클라우드를 실제로 배치한다. */
/** 8-field-light 는 2-field 와 같은 뷰를 라이트 테마로 렌더한다 — 라이트 분기 커버리지용. */
export const PIXEL_STATES = [...LAYOUT_STATES, '7-origen-cloud', '8-field-light'] as const
export type DriveState = (typeof PIXEL_STATES)[number]

/**
 * window.__drive(state) 를 설치한다. 상태 구동 로직의 유일한 정의처다 —
 * layout.spec 과 pixel.spec 이 같은 것을 호출해야 픽셀 골든이 레이아웃 골든과
 * 같은 상태를 가리킨다는 보장이 선다.
 *
 * 반드시 page.goto 이전에 호출할 것 (addInitScript 의 계약).
 */
export async function installDriver(page: Page): Promise<void> {
  await page.addInitScript(() => {
    type Eng = {
      step(ts: number): void
      resetTime(): void
      setTransition(P: number, dir: 1 | -1): void
      setColdProgress(coldP: number): void
      resetView(): void
      layoutOrigen(): void
      setQuality(pq: number): void
    }
    type UIActions = {
      goHome(): void
      openOrigen(): void
      closeOrigen(): void
      setHover(id: string | null): void
      setMode(mode: 'cold' | 'field' | 'trans' | 'page'): void
      toggleTheme(): void
      theme: 'dark' | 'light'
    }
    const w = window as unknown as {
      __engine: Eng
      __uiStore: { getState(): UIActions }
      __open(id: string, fromPage?: boolean): void
      __focus(id: string): void
      __drive(state: string): void
    }

    w.__drive = (state: string): void => {
      const eng = w.__engine
      const g = w.__uiStore.getState()
      const DT = 16

      // Task 5 가 실측 검증한 재현 레시피(task-5-report.md 6절). 골든 추출기
      // tools/extract-golden.mjs 의 run() 과 같은 리셋 집합이며, fieldCX 와
      // CX/CY/R/AL 은 의도적으로 건드리지 않는다 — 상태 간 드리프트가 골든
      // 자체에 인코딩돼 있다.
      const drive = (setup: () => void, frames: number): void => {
        eng.resetView()
        eng.resetTime()
        eng.setTransition(0, 1)
        eng.setColdProgress(1)
        g.setHover(null)
        g.closeOrigen()
        document.body.classList.remove('origen', 'origen-in', 'org-zoom')
        setup()
        eng.resetTime()
        for (let i = 0; i < frames; i++) eng.step(i * DT)
      }

      // theme 은 drive() 의 리셋 목록에 없다 — 상태 간에 의도적으로 살아남는다.
      // g 는 __drive() 호출 시점의 스냅샷이라 g.theme 은 g.toggleTheme() 이후에도
      // 갱신되지 않는다 (zustand vanilla: getState() 는 그 순간의 상태 객체 참조를
      // 돌려줄 뿐, 이후 set() 이 다시 읽어주지 않는다) — 매번 getState() 를 새로
      // 불러 실측한다.
      const themeNow = (): 'dark' | 'light' => w.__uiStore.getState().theme

      switch (state) {
        case '1-cold':
          drive(() => { g.setMode('cold'); eng.setColdProgress(0) }, 25); break
        case '2-field':
          drive(() => { g.setMode('field'); g.goHome() }, 20); break
        case '3-fieldgal':
          drive(() => { g.setMode('field'); w.__focus('frontend') }, 20); break
        case '4-trans':
          drive(() => {
            g.setMode('field'); g.goHome(); w.__open('topik-user')
            g.setMode('trans'); eng.setTransition(0.5, 1)
          }, 1); break
        case '5-page':
          drive(() => {
            g.setMode('field'); g.goHome(); w.__open('topik-user')
            g.setMode('page'); eng.setTransition(1, 1)
          }, 20); break
        case '6-origen':
          drive(() => { g.openOrigen() }, 20); break
        case '7-origen-cloud':
          // 6-origen 과 달리 워드클라우드를 실제로 배치한다. 레이아웃 배열은
          // 여전히 5-page 와 같지만(early return), 픽셀은 완전히 달라진다.
          drive(() => { g.openOrigen(); eng.layoutOrigen() }, 20); break
        case '8-field-light':
          // 2-field 와 동일한 뷰 — 차이는 테마뿐이다. setup() 안에서 stepping 전에
          // 라이트로 전환해야 drive() 의 프레임 루프가 라이트로 렌더한다(legacy.ts
          // stepFrame 이 매 step 마다 ui = U() 로 스토어를 다시 읽는다). 이 상태
          // 하나만 theme 을 건드리므로, 끝나면 반드시 dark 로 되돌려 다음(또는 재실행
          // 시 처음부터 다시 도는) 상태들을 오염시키지 않는다 — drive() 의 리셋 목록엔
          // theme 이 없다.
          drive(() => {
            g.setMode('field'); g.goHome()
            if (themeNow() !== 'light') g.toggleTheme()
          }, 20)
          if (themeNow() !== 'dark') g.toggleTheme()
          break
        default:
          throw new Error(`알 수 없는 상태: ${state}`)
      }
    }
  })
}
