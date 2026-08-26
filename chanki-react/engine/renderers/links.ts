// createLinks — curveDots(원본 index.html L594 부근)를 그대로 옮긴 것.
//
// FieldRenderer 모양을 억지로 맞추지 않았다(engine/renderers/types.ts 상단 메모 참고):
// frame() 안에서 curveDots 는 서로 다른 시점에 두 곳에서 호출된다 — (1) 엣지 루프
// (매 프레임, E 전체를 순회), (2) 훨씬 뒤의 갤러리 gdot 루프(갤러리가 열려 있을 때만,
// DOM getBoundingClientRect 로 얻은 좌표로). 이 둘 사이에 클러스터·마이크로노드·영역링·
// 버블·라벨 렌더링이 끼어 있다 — 합성 순서가 곧 픽셀이므로(Fact #1), 하나의 rc 콜로
// 합치면 이 순서를 바꾸게 된다. 그래서 frame() 의 두 호출부는 그대로 두고(이번 태스크는
// 이동이지 재구조화가 아니다), curveDots 함수 자체만 옮겨 두 호출부가 이 모듈을 참조하게
// 했다. drawOrigen()(Task 8 까지 legacy.ts 잔류)도 이 함수를 두 곳에서 더 부른다 — 그
// 호출부도 이 모듈을 참조하도록 rewiring 했다(본문은 손대지 않았다).
//
// ui.theme 은 프레임마다 값이 바뀔 수 있는 스냅샷이라(레퍼런스가 아니라 값), 클로저로
// 한 번만 캡처하면 안 된다 — engine/layout.ts 의 compute(ui, t) 와 같은 방식으로 매
// 호출마다 명시적 인자로 받는다.
import type { UISnapshot } from '@/stores/uiStore'

/** '#RRGGBB' → [r,g,b]. engine/legacy.ts 의 rgb() 와 같은 정의 — 렌더러 간 중복은
 *  의도적이다(태스크 지시: 색상 계산 스니펫은 합치지 않는다, 합치면 동작 변경 위험이
 *  있는 리팩터가 된다). */
const rgb = (hex: string): number[] => (hex.match(/\w\w/g) ?? []).map((h) => parseInt(h, 16))

export function createLinks(deps: { ctx: CanvasRenderingContext2D }): {
  curveDots(
    ui: UISnapshot, x1: number, y1: number, x2: number, y2: number, al: number,
    nd: number, sz: number, t: number, spd: number, col?: string | null,
  ): void
} {
  const { ctx } = deps

  function curveDots(
    ui: UISnapshot, x1: number, y1: number, x2: number, y2: number, al: number,
    nd: number, sz: number, t: number, spd: number, col?: string | null,
  ): void {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - Math.hypot(x2 - x1, y2 - y1) * 0.12
    ctx.strokeStyle = (ui.theme === 'light') ? `rgba(36,40,54,${al * 0.62})` : `rgba(220,228,245,${al * 0.5})`
    ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(mx, my, x2, y2); ctx.stroke()
    const A = col ? rgb(col) : ((ui.theme === 'light') ? [36, 40, 54] : [255, 255, 255])
    for (let i = 0; i < nd; i++) {
      const u = ((t * spd + i / nd) % 1)
      const ix = (1 - u) * (1 - u) * x1 + 2 * (1 - u) * u * mx + u * u * x2
      const iy = (1 - u) * (1 - u) * y1 + 2 * (1 - u) * u * my + u * u * y2
      ctx.fillStyle = `rgba(${A[0]},${A[1]},${A[2]},${al})`
      ctx.beginPath(); ctx.arc(ix, iy, sz, 0, 6.283); ctx.fill()
    }
  }

  return { curveDots }
}
