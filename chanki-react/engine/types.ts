// 엔진의 공개 계약. 여기 있는 타입만이 React 쪽과 엔진 사이의 접점이다.
// engine/ 은 components/ 를 import 하지 않는다 (단방향 의존).

export type EngineCanvases = {
  field: HTMLCanvasElement
  glass: HTMLCanvasElement
  mini: HTMLCanvasElement
}

/** `seed` 생략 시 엔진 팩토리(createEngine)가 기본값(0xC0FFEE)을 쓴다 — 파티클 배치를
 *  재현 가능하게 만드는 mulberry32 시드. 레이아웃(CX/CY/R/AL)에는 영향이 없다. */
export type EngineDeps = { canvases: EngineCanvases; seed?: number }

/**
 * 프로덕션 코드가 보는 좁은 계약. `components/MapCanvas.tsx` 의 지역 변수는 이
 * 타입으로 선언한다 — 프로덕션 경로에서 아래 테스트 전용 메서드(resetView 등)를
 * 불러 uiStore 와 조용히 어긋나게 만들 방법을 컴파일 타임에 차단한다(리뷰 Fix 2).
 */
export type EngineHandle = {
  start(): void
  stop(): void
  dispose(): void
}

/**
 * 테스트 전용 확장. `components/MapCanvas.tsx` 에서는 `window.__engine` 처럼
 * NODE_ENV !== 'production' 가드 뒤에서만 이 타입으로 넓힌다. 레이아웃 회귀
 * 테스트(Task 7, tools/extract-golden.mjs 와 대응하는 React 쪽 재현)가 rAF 없이
 * 결정적으로 프레임을 진행시키기 위해 필요하다.
 */
export type EngineTestHandle = EngineHandle & {
  /** 테스트용 결정적 스테핑. rAF 없이 한 프레임 진행. */
  step(ts: number): void
  /** 테스트용. lastTs를 0으로 되돌린다. 안 하면 dt가 음수가 되어 폭주한다. */
  resetTime(): void
  /** 테스트용. 전이 진행도를 특정 지점에 고정한다 (playing=false). */
  setTransition(P: number, dir: 1 | -1): void
  /** 테스트용. 인트로 진행도를 특정 지점에 고정한다. */
  setColdProgress(coldP: number): void
  /**
   * 테스트용. 카메라/제스처 상태를 초기값으로 되돌린다
   * (curRot, viewRot, viewTiltX, userZoom, userInteracted, oB, mouseX, mouseY).
   *
   * 브리프의 Step 1 목록에는 없지만 Task 7 에는 반드시 필요하다. 골든 추출기
   * (tools/extract-golden.mjs)의 run() 은 상태마다 이 값들을 리셋하면서 fieldCX 와
   * CX/CY/R/AL 은 **일부러 남겨둔다** — 4-trans 의 fieldCX 는 3-fieldgal 이 남긴
   * 값(0.29717)을 물려받고, 6-origen 은 5-page 가 남긴 배열을 그대로 검사한다.
   * 그래서 "상태마다 새 엔진"으로는 재현할 수 없고(fieldCX 가 0.5 로 초기화된다),
   * "엔진 하나로 순서대로"만으로도 재현할 수 없다(curRot 이 누적된다).
   * 이 메서드가 그 둘을 가른다. 이것으로 6개 상태 792개 값 전부를 실측 재현했다.
   */
  resetView(): void
  /** 테스트용. origen 워드클라우드를 즉시 배치한다 — 미러 골든 하네스의 명시적 oLayout() 과 동일. */
  layoutOrigen(): void
  /** 테스트용. PQ 를 고정한다. Task 10 의 컨트롤러는 핀 상태에서 자동 조절을 중단해야 한다. */
  setQuality(pq: number): void
}
