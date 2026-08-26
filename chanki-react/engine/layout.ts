// createLayoutPass — 원본 frame() 안에서 매 프레임 sim.CX/CY/R/AL/DF 를 채우던 per-node
// 블록과, 그 값을 만드는 데 필요한 selIdx/aIdx/eViz/fieldLike 유도를 옮긴 것이다.
//
// 카메라 값의 시간 진행(camZoom/fieldCX 등의 lerp)은 옮기지 않는다 — 그건 frame() 이
// 여전히 담당하는 "시간 진행"이고, 여기는 그 진행된 카메라로 이번 프레임의 화면좌표를
// 뽑는 "계산"만 한다.
import { EDGES } from '@/data/edges'
import { NODES } from '@/data/nodes'
import { ZMAP } from '@/data/zmap'
import type { UISnapshot } from '@/stores/uiStore'
import type { Projection } from './projection'
import type { Sim } from './sim'

export type LayoutFrame = { selIdx: number; aIdx: number; eViz: number; fieldLike: boolean }

const ease = (p: number): number => p * p * (3 - 2 * p)
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

export function createLayoutPass(deps: {
  sim: Sim
  projection: Projection
  /**
   * 브리프의 deps 목록(`{ sim, projection }`)에는 없다 — 이관 중 발견해 추가했다.
   * `frame()`의 원래 코드에서 `else if (i in nbRank)` 분기가 읽던 바로 그 테이블이다.
   *
   * nbRank 는 legacy.ts 의 openPage() 가 페이지를 열 때만 채워진다. uiStore.openNode()
   * 를 직접 불러 activeId 만 바꾼 경우에는 비어 있는 채로 남는다 — legacy.ts 의
   * win.__open 관련 주석과 Task 7 골든 하네스(tests/drive.ts)가 4-trans/5-page 상태에서
   * 일부러 g.setMode 대신 w.__open('growth') 를 거치는 이유가 이것이다. 즉 nbRank 는
   * ui.activeId 의 순수 함수가 아니라 "이 세션에서 마지막으로 openPage 가 호출됐는가"에
   * 의존하는 진짜 엔진-지역 상호작용 상태라, UISnapshot 으로도 Sim 으로도 대체할 수
   * 없었다(UISnapshot 엔 없고, Sim 은 스칼라만 다루는 계약이다).
   *
   * legacy.ts 의 openPage() 는 nbRank 를 통째로 재대입한다(`nbRank = {}`) — 그 재대입된
   * 새 객체를 매번 다시 읽도록 getter 로 받는다. 값을 한 번 구조분해해서 들고 있으면
   * 재대입 이후 stale 참조가 된다.
   */
  getNbRank(): Record<number, number>
}): { compute(ui: UISnapshot, t: number): LayoutFrame } {
  const { sim, projection, getNbRank } = deps

  // idIndex/Z/adj 는 legacy.ts 의 것과 같은 유도를 반복한다 — engine/projection.ts 의
  // cx0/cy0/BX, engine/particles.ts 의 idIndex 와 같은 패턴(정적 데이터에서 매번 다시
  // 구한다. 값은 인스턴스 사이에 항상 같다).
  const idIndex: Record<string, number> = Object.fromEntries(
    NODES.map((n, i) => [n.id, i] as [string, number]),
  )
  const Z: number[] = NODES.map((n) => ZMAP[n.id] || 0)
  const adj: Set<number>[] = NODES.map(() => new Set<number>())
  EDGES.forEach(([a, b]) => { adj[idIndex[a]].add(idIndex[b]); adj[idIndex[b]].add(idIndex[a]) })

  function compute(ui: UISnapshot, t: number): LayoutFrame {
    // 이 계산 구간(원본 frame() 의 per-node 블록)은 t 를 쓰지 않는다 — 브리프가 준
    // 시그니처를 그대로 유지하기 위해 받되, 미사용임을 명시한다.
    void t
    const fieldLike = (ui.mode === 'field' || ui.mode === 'cold')
    const eViz = fieldLike ? 0 : ease(sim.P)
    const LITE = (ui.theme === 'light')
    const nbRank = getNbRank()
    const selIdx = idIndex[ui.fieldSel]
    const aIdx = ui.activeId ? idIndex[ui.activeId] : -1
    const focalZ = (ui.mode === 'field') ? Z[selIdx] : (aIdx >= 0 ? Z[aIdx] : 0)
    const pgA = (aIdx >= 0) ? projection.nodeFieldScreen(aIdx) : null
    const pgH = projection.heroPos()
    const PGZ = 1.9
    for (let i = 0; i < NODES.length; i++) {
      const n = NODES[i]
      const fp = projection.nodeFieldScreen(i), fx = fp[0], fy = fp[1], persp = fp[2] || 1
      let cx = fx, cy = fy
      let r = n.r * sim.SC * sim.camZoom * sim.userZoom * persp
      let al: number, df: number
      if (fieldLike) {
        if (ui.focusSet.has(i)) { al = 1; df = 0 } else if (adj[selIdx].has(i)) { al = 0.6; df = 0.35 } else {
          al = 0.22; df = Math.min(1, 0.55 + Math.abs(Z[i] - focalZ) * 0.5)
        }
        if (ui.hoverId === n.id) { al = Math.max(al, 0.92); df = Math.min(df, 0.15) }
        if (LITE) al = Math.min(1, 0.54 + al * 0.52)
      } else {
        const zx = pgA ? pgH[0] + (fx - pgA[0]) * PGZ : fx
        const zy = pgA ? pgH[1] + (fy - pgA[1]) * PGZ : fy
        cx = lerp(fx, zx, eViz); cy = lerp(fy, zy, eViz); r *= lerp(1, 1.42, eViz)
        if (i === aIdx) { al = 1; df = 0 } else if (i in nbRank) {
          al = lerp(0.85, 0.8, eViz); df = eViz * 0.25
        } else { al = lerp(0.85, 0.26, eViz); df = eViz * 0.55 + 0.1 }
        if (ui.hoverId === n.id && i !== aIdx) { al = Math.max(al, 0.95); df = Math.min(df, 0.12) }
      }
      sim.CX[i] = cx; sim.CY[i] = cy; sim.R[i] = r; sim.AL[i] = al; sim.DF[i] = df
    }
    return { selIdx, aIdx, eViz, fieldLike }
  }

  return { compute }
}
