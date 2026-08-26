// createBubble — drawBubble(원본 index.html L581 부근)을 그대로 옮긴 것.
//
// FieldRenderer 모양이 아니다(engine/renderers/types.ts 상단 메모 참고): frame() 은 이
// 함수를 호출한 직후, 같은 인자로 만든 `{cx, cy, r, a}` 도형을 지역 변수 bubbleShape 에
// 저장해뒀다가 프레임 끝의 renderGlass(WebGL 굴절) 호출에 넘긴다 — 그리기 자체와는 별개인
// 부수효과가 호출부(frame()) 쪽에 있다. FieldRenderer 는 void 를 반환해야 하므로 그
// 부수효과를 렌더러 안으로 접으면 시그니처가 깨지거나 FieldRenderCtx 에 출력 채널을
// 새로 만들어야 한다 — 원본에 없던 확장이라 하지 않았다. drawOrigen()(Task 8 까지
// legacy.ts 잔류)도 이 함수를 한 번 더 부른다(코어 버블, bubbleShape 없이) — 그 호출부도
// 이 모듈을 참조하도록 rewiring 했다.
//
// ui.theme 은 매 호출 명시적 인자로 받는다(engine/renderers/links.ts 와 같은 이유).
//
// 원본(index.html) signature 의 마지막 인자 t 는 본문에서 쓰이지 않아 legacy.ts 이식 때
// 이미 제거돼 있었다(dead param) — Task 7 은 그 상태를 그대로 옮겼을 뿐 새로 바꾸지 않았다.
import type { UISnapshot } from '@/stores/uiStore'

export function createBubble(deps: { ctx: CanvasRenderingContext2D }): {
  drawBubble(ui: UISnapshot, cx: number, cy: number, R: number, alpha: number): void
} {
  const { ctx } = deps

  function drawBubble(ui: UISnapshot, cx: number, cy: number, R: number, alpha: number): void {
    if (alpha <= 0.01) return
    const lit = (ui.theme !== 'light'); const K = lit ? '255,255,255' : '18,122,104'
    ctx.globalCompositeOperation = lit ? 'lighter' : 'source-over'
    const g = ctx.createRadialGradient(cx, cy, R * 0.55, cx, cy, R)
    g.addColorStop(0, `rgba(${K},0)`)
    g.addColorStop(0.82, `rgba(${K},${0.02 * alpha})`)
    g.addColorStop(0.93, `rgba(${K},${(lit ? 0.10 : 0.14) * alpha})`)
    g.addColorStop(0.975, `rgba(${K},${(lit ? 0.55 : 0.5) * alpha})`)
    g.addColorStop(1, `rgba(${K},0)`)
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.283); ctx.fill()
    ctx.strokeStyle = `rgba(${K},${0.72 * alpha})`; ctx.lineWidth = 2.2; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.965, -2.45, -1.7); ctx.stroke()
    ctx.strokeStyle = `rgba(${K},${0.2 * alpha})`; ctx.lineWidth = 1.3
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.95, 0.55, 1.05); ctx.stroke()
  }

  return { drawBubble }
}
