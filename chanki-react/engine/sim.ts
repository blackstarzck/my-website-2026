// Sim — 모듈 간 공유되는 가변 시뮬레이션 스칼라의 유일한 집. engine/viewport.ts 와
// engine/projection.ts 가 이 컨텍스트 하나를 받아 동작하고, engine/legacy.ts(프레임
// 루프)도 자신의 지역 변수 대신 이 필드들을 읽고 쓴다.
//
// CX/CY/R/AL/DF 는 engineStore 의 Float64Array 를 그대로 별칭한다 — 복사하면 매 프레임
// 할당이 늘어날 뿐 아니라 engineStore.getState()가 라이브 뷰라는 계약이 깨진다(e2e 레이아웃
// 회귀 테스트가 그 라이브 뷰를 읽는다).
import type { EngineState } from '@/stores/engineStore'

export type Sim = {
  P: number
  coldP: number
  transDir: 1 | -1
  playing: boolean
  curRot: number
  curBr: number
  camZoom: number
  userZoom: number
  viewRot: number
  viewTiltX: number
  fieldCX: number
  PQ: number
  lastTs: number
  W: number
  H: number
  SC: number
  LBL: number
  MW: number
  MH: number
  /**
   * 브리프의 필드 목록에는 없다 — 이관 중 발견해 추가했다(태스크 지시의 ambiguity #1).
   * NODES 경계에서 유도되는 상수로, 계산 자체는 engine/projection.ts 의 createProjection()
   * 이 맡는다(cx0/cy0/BX 와 함께). 하지만 engine/viewport.ts 의 resize()가 SC 를 구하는 데
   * 이 값이 필요하고, createViewport(sim, canvases)는 고정된 2개 인자 시그니처라 sim 을
   * 거치는 것 말고는 그 값을 받을 방법이 없다. legacy.ts 가 createProjection() 직후
   * `sim.orgR = orgR` 로 채운다. 초기값 0 은 원본의 `let orgR = 0` 그대로다.
   */
  orgR: number
  readonly CX: Float64Array
  readonly CY: Float64Array
  readonly R: Float64Array
  readonly AL: Float64Array
  readonly DF: Float64Array
}

export function createSim(es: EngineState): Sim {
  return {
    P: 0,
    coldP: 0,
    transDir: 1,
    playing: false,
    curRot: 0,
    curBr: 1,
    camZoom: 1,
    userZoom: 1,
    viewRot: 0,
    viewTiltX: 0,
    fieldCX: 0.5,
    // PQ 컨트롤러는 원본(index.html)에 없다 — 기본값을 그대로 미러링만 한다. es.PQ 를
    // 물려받아야 프레임마다 도는 미러링(engine/legacy.ts 의 stepFrame)이 외부 setState({PQ})
    // 를 덮어쓰는 그릇 노릇을 계속한다. 나중 계획(적응형 파티클 품질, Task 10)이 엔진
    // 안에서 이 값을 조정할 필드가 필요하다는 이유로 원본이 PQ 를 mutable 로 유지했다.
    PQ: es.PQ,
    lastTs: 0,
    W: 0,
    H: 0,
    SC: 0,
    LBL: 1,
    MW: 408,
    MH: 276,
    orgR: 0,
    CX: es.CX,
    CY: es.CY,
    R: es.R,
    AL: es.AL,
    DF: es.DF,
  }
}
