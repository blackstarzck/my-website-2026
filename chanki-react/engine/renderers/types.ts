// 렌더러 공통 계약 — 스펙(docs/superpowers/specs/2026-08-24-react-conversion-design.md) §8.
// RenderCtx 는 모든 렌더러(2D 필드·미니맵·글래스·origen)가 공유하는 최소 계약이고,
// FieldRenderCtx 는 프레임마다 다시 유도되는 값(engine/layout.ts 의 LayoutFrame 에서 옴)을
// 추가로 받는 2D 필드 렌더러 전용 확장이다.
import type { EngineState } from '@/stores/engineStore'
import type { UISnapshot } from '@/stores/uiStore'

export type RenderCtx = {
  ctx: CanvasRenderingContext2D
  W: number
  H: number
  t: number
  dt: number
  ui: UISnapshot
  eng: EngineState
}
export type Renderer = (rc: RenderCtx) => void

/** 필드 렌더러가 추가로 받는 프레임 파생값. */
export type FieldRenderCtx = RenderCtx & { eViz: number; selIdx: number; aIdx: number }
export type FieldRenderer = (rc: FieldRenderCtx) => void

// Task 7 구현 메모 (경계 결정): 이 파일이 정의하는 FieldRenderer 모양(rc 하나만 받는
// 프레임당 1회 호출)에 실제로 맞는 것은 stars/haze 뿐이다 — 원본 frame() 안에서 그 둘은
// 자기 데이터(stars[]/haze[])를 스스로 순회하는 완결된 루프였다. links(curveDots)·
// rings(drawAreaRing)·bubble(drawBubble)·clusters(drawCluster+drawMicroNodes)는 원본에서
// frame() 이 서로 다른 시점에 여러 번(엣지마다·영역마다·노드마다) 호출하는 프리미티브였고,
// 그 호출 사이사이에 다른 렌더링이 끼어 있다(합성 순서 보존, Fact #1). 이 넷을 FieldRenderer
// 모양에 억지로 맞추면 frame() 의 호출 순서를 바꾸거나(허용되지 않음) FieldRenderCtx 에
// 원본엔 없던 필드를 여럿 얹어야 했다 — 특히 bubble 은 그리기 결과를 bubbleShape 라는
// 부수효과로 내보내 나중에 renderGlass 가 소비하므로 void 반환 시그니처와 근본적으로
// 안 맞는다. 그래서 이 넷은 create<Name>(deps) 가 원본 함수를 (약간의 식별자 배선과 함께)
// 그대로 반환하고, frame() 의 호출부는 그대로 둔 채 참조만 새 모듈로 바꿨다. 각 파일
// 상단에 개별 근거를 남겼다.
