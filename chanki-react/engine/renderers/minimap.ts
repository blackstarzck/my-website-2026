// createMinimap — drawMini/mpos/rootIdx/inFocusMini(원본 index.html L649 부근)를 그대로
// 옮긴 것.
//
// rootIdx()의 U() 라이브 읽기는 건드리지 않는다(태스크 지시, Fact #5) — frame()이 캐시해
// 넘기는 ui 스냅샷과는 별개로, mini 캔버스의 pointermove 핸들러(legacy.ts에 남는 상호작용
// 코드, 그리기가 아니라 이동 대상이 아니다)도 rootIdx()를 직접 부른다. 그 핸들러는 frame()
// 밖(DOM 이벤트)에서 실행되므로 캐시된 스냅샷이 아니라 최신 스토어 상태를 읽어야 한다 —
// 그래서 rootIdx()는 draw()가 받는 ui 파라미터가 아니라 별도로 주입받는 uiLive()를 부른다.
// 의미를 바꾸지 않는다 — Task 10이 이 라이브 읽기의 파라미터화를 단독으로 처리한다.
//
// 브리프의 반환 타입은 { draw(ui,t) } 하나뿐이지만, rootIdx와 mpos 둘 다 legacy.ts의 다른
// 곳(각각 mini의 pointermove 핸들러, miniNearest())에서 drawMini() 밖에서도 호출된다 —
// 그 두 호출부는 이동 대상이 아니므로(브리프가 "drawMini/mpos/rootIdx/inFocusMini"만
// 이동 대상으로 못박았다), legacy.ts에 남기고 이 핸들이 그 둘을 추가로 노출한다
// (Ambiguity #2). inFocusMini는 drawMini() 안에서만 쓰여 노출하지 않는다.
//
// idIndex/adj는 legacy.ts의 것과 같은 유도를 반복한다 — engine/projection.ts의 cx0/cy0/BX,
// engine/particles.ts·layout.ts·renderers/clusters.ts의 idIndex와 같은 패턴(정적
// 데이터에서 매번 다시 구한다. 값은 인스턴스 사이에 항상 같다). 원본은 N(NODES를 z로
// 감싼 legacy.ts 지역 배열)을 순회했지만 drawMini는 .x/.y/.region/.r/.name만 읽으므로
// NODES로 충분하다(z는 안 쓴다).
import { EDGES } from '@/data/edges'
import { NODES } from '@/data/nodes'
import { AREAS, COLOR } from '@/data/regions'
import type { UISnapshot } from '@/stores/uiStore'
import type { Projection } from '../projection'
import type { Sim } from '../sim'
import { REG_TABS } from '@/data/site'

const E = EDGES
const idIndex: Record<string, number> = Object.fromEntries(
  NODES.map((n, i) => [n.id, i] as [string, number]),
)
const adj: Set<number>[] = NODES.map(() => new Set<number>())
E.forEach(([a, b]) => { adj[idIndex[a]].add(idIndex[b]); adj[idIndex[b]].add(idIndex[a]) })

export function createMinimap(deps: {
  sim: Sim; projection: Projection; canvas: HTMLCanvasElement
  uiLive: () => UISnapshot
}): {
  draw(ui: UISnapshot, t: number): void
  rootIdx(): number
  mpos(n: { x: number; y: number }): [number, number]
} {
  const { sim, projection, canvas, uiLive } = deps
  const mctx = canvas.getContext('2d') as CanvasRenderingContext2D
  const MPAD = 18
  const { BX } = projection

  function mpos(n: { x: number; y: number }): [number, number] {
    return [
      MPAD + (n.x - BX.mnx) / (BX.mxx - BX.mnx) * (sim.MW - 2 * MPAD),
      MPAD + (BX.mxy - n.y) / (BX.mxy - BX.mny) * (sim.MH - 2 * MPAD),
    ]
  }

  function rootIdx(): number {
    const s = uiLive(); return s.activeId ? idIndex[s.activeId] : idIndex[s.fieldSel]
  }

  function draw(ui: UISnapshot, t: number): void {
    // 브리프가 준 시그니처를 그대로 유지하기 위해 받되, 원본 drawMini()도 t를 쓰지
    // 않았다 — engine/layout.ts의 compute(ui,t)와 같은 이유로 미사용임을 명시한다.
    void t
    function inFocusMini(i: number): boolean {
      const r = rootIdx(); return i === r || ui.focusSet.has(i) || adj[r].has(i)
    }
    const LT = (ui.theme === 'light')
    mctx.globalCompositeOperation = 'source-over'
    mctx.fillStyle = LT ? 'rgba(239,231,212,0.4)' : 'rgba(12,14,22,0.42)'
    mctx.fillRect(0, 0, sim.MW, sim.MH)
    const r = rootIdx()
    for (const [a, b] of E) {
      const ia = idIndex[a], ib = idIndex[b]
      const [x1, y1] = mpos(NODES[ia]), [x2, y2] = mpos(NODES[ib])
      const act = inFocusMini(ia) && inFocusMini(ib)
      mctx.strokeStyle = act
        ? (LT ? 'rgba(0,0,0,.42)' : 'rgba(255,255,255,.3)')
        : (LT ? 'rgba(0,0,0,.16)' : 'rgba(255,255,255,.07)')
      mctx.lineWidth = act ? 1.4 : 1
      mctx.beginPath(); mctx.moveTo(x1, y1); mctx.lineTo(x2, y2); mctx.stroke()
    }
    for (let i = 0; i < NODES.length; i++) {
      const n = NODES[i]; const [x, y] = mpos(n); const foc = inFocusMini(i), root = i === r
      mctx.globalAlpha = root ? 1 : (foc ? 0.92 : (LT ? 0.5 : 0.26))
      mctx.fillStyle = COLOR[n.region]
      const rad = (root ? 8 : foc ? 6 : 4) + (n.r > 1.3 ? 3 : 0)
      mctx.beginPath(); mctx.arc(x, y, rad, 0, 6.283); mctx.fill()
      if (root) {
        mctx.globalAlpha = 0.95; mctx.strokeStyle = LT ? '#222' : '#fff'; mctx.lineWidth = 1.6
        mctx.beginPath(); mctx.arc(x, y, rad + 5, 0, 6.283); mctx.stroke()
      }
    }
    const ASHORT: Record<string, string> = {
      ...Object.fromEntries(REG_TABS),
    }
    mctx.font = '600 14px ui-monospace,Menlo,monospace'; mctx.textBaseline = 'middle'
    for (const aid of AREAS) {
      const i = idIndex[aid]; const n = NODES[i]; const [x, y] = mpos(n)
      mctx.fillStyle = COLOR[n.region]
      mctx.globalAlpha = inFocusMini(i) ? 0.95 : (LT ? 0.78 : 0.55)
      mctx.fillText(ASHORT[aid] || n.name, x + 11, y)
    }
    mctx.globalAlpha = 1
  }

  return { draw, rootIdx, mpos }
}
