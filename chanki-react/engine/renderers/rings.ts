// createRings — drawAreaRing(원본 index.html L590 부근)을 그대로 옮긴 것.
//
// FieldRenderer 모양이 아니다(engine/renderers/types.ts 상단 메모 참고): frame() 이 AREAS
// 를 순회하며 영역마다 이 함수를 직접 호출한다. 같은 반복 안에서 링 바로 다음에 라벨
// fillText 가 오지만, 그 라벨은 이 함수의 책임이 아니라 frame() 쪽 코드라 같이 옮기지
// 않았다 — drawAreaRing 자체가 갖는 책임(링 하나 그리기)만 이동 대상이다.
//
// ui 를 전혀 안 읽는다 — 원본 함수도 그랬다(테마 분기가 없다, 색은 호출자가 col 로 넘긴다).
export function createRings(deps: { ctx: CanvasRenderingContext2D }): {
  drawAreaRing(cx: number, cy: number, R: number, col: string, alpha: number): void
} {
  const { ctx } = deps
  const rgb = (hex: string): number[] => (hex.match(/\w\w/g) ?? []).map((h) => parseInt(h, 16))

  function drawAreaRing(cx: number, cy: number, R: number, col: string, alpha: number): void {
    if (alpha <= 0.01) return
    ctx.globalCompositeOperation = 'source-over'
    const A = rgb(col)
    ctx.strokeStyle = `rgba(${A[0]},${A[1]},${A[2]},${0.55 * alpha})`
    ctx.lineWidth = 1.3; ctx.setLineDash([2, 5])
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.42, 0, 6.283); ctx.stroke(); ctx.setLineDash([])
  }

  return { drawAreaRing }
}
