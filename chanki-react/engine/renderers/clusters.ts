// createClusters — drawCluster(원본 index.html L563 부근) + drawMicroNodes(L552 부근)를
// 옮긴 것. 서로 인접해 호출되고 같은 "클러스터" 개념을 공유해 한 파일에 묶었다(태스크
// 지시, Ambiguity #4).
//
// FieldRenderer 모양이 아니다(engine/renderers/types.ts 상단 메모 참고): 둘 다 frame() 의
// 노드 루프 안에서 노드마다 호출되는 프리미티브다(drawCluster 는 AL>0.01 인 모든 노드,
// drawMicroNodes 는 fieldLike 이고 자식이 있는 노드만) — links/rings/bubble 과 같은 이유로
// 그대로 뒀다. drawOrigen()(Task 8 까지 legacy.ts 잔류)도 drawCluster 를 한 번 더 부른다
// (origen 허브, h.region/h.cl 로) — 그 호출부도 이 모듈을 참조하도록 rewiring 했다.
//
// childrenIdx/idIndex 는 legacy.ts 의 것과 같은 유도를 반복한다 — engine/projection.ts 의
// cx0/cy0/BX, engine/particles.ts·layout.ts 의 idIndex 와 같은 패턴(정적 데이터에서 매번
// 다시 구한다. 값은 인스턴스 사이에 항상 같다). legacy.ts 의 childrenIdx 는 setCrumb 등
// 그리기와 무관한 다른 함수에서도 쓰여 그쪽엔 그대로 남는다 — 이 모듈이 자기 것을
// 따로 갖는 것이지 legacy.ts 것을 대체하는 게 아니다.
import { NODES } from '@/data/nodes'
import { COLOR, PARENTS } from '@/data/regions'
import type { Region } from '@/data/types'
import type { UISnapshot } from '@/stores/uiStore'
import type { CloudPt } from '../particles'

/** '#RRGGBB' → [r,g,b]. engine/legacy.ts 의 rgb() 와 같은 정의 — 렌더러 간 중복은 의도적
 *  (engine/renderers/links.ts 상단 메모 참고). */
const rgb = (hex: string): number[] => (hex.match(/\w\w/g) ?? []).map((h) => parseInt(h, 16))

const idIndex: Record<string, number> = Object.fromEntries(
  NODES.map((n, i) => [n.id, i] as [string, number]),
)
/** 부모 영역 인덱스 → 자식 노드 인덱스 배열. legacy.ts L138-143 과 동일한 유도. */
const childrenIdx: Record<number, number[]> = {}
NODES.forEach((n, i) => {
  if (PARENTS.has(n.region) && n.id !== n.region) {
    const r = idIndex[n.region];(childrenIdx[r] = childrenIdx[r] || []).push(i)
  }
})

export function createClusters(deps: { ctx: CanvasRenderingContext2D }): {
  drawCluster(
    ui: UISnapshot, region: Region, cl: CloudPt[], cx: number, cy: number,
    R: number, alpha: number, dof: number, t: number,
  ): void
  drawMicroNodes(ui: UISnapshot, i: number, cx: number, cy: number, R: number, alpha: number, t: number): void
} {
  const { ctx } = deps

  function drawCluster(
    ui: UISnapshot, region: Region, cl: CloudPt[], cx: number, cy: number,
    R: number, alpha: number, dof: number, t: number,
  ): void {
    if (alpha <= 0.01) return
    const A = rgb(COLOR[region])
    const lit = (ui.theme !== 'light')
    ctx.globalCompositeOperation = lit ? 'lighter' : 'source-over'
    for (const p of cl) {
      const rad = p.rr * R
      const x = cx + Math.cos(p.a) * rad
      const y = cy + Math.sin(p.a) * rad * 0.92
      const d = Math.min(1, dof + Math.abs(p.jz) * dof * 1.4)
      const tw = 0.62 + 0.38 * Math.sin(t * p.sp + p.ph)
      let a = (0.05 + p.b * 0.55) * tw * alpha
      let sz = p.sz * (0.9 + p.b * 0.5)
      sz *= (1 + d * 2.8); a *= (1 - d * 0.5); a /= (1 + d * 2.1)
      if (a <= 0.004) continue
      let r: number, g: number, bb: number, aa = a
      if (lit) {
        const mix = 0.64 + p.b * 0.36
        r = Math.round(A[0] + (255 - A[0]) * mix); g = Math.round(A[1] + (255 - A[1]) * mix)
        bb = Math.round(A[2] + (255 - A[2]) * mix); aa = Math.min(0.99, a * 1.95)
      } else {
        const heat = Math.max(0, Math.min(1, 0.1 + p.b * 1.05 - d * 0.3))
        let f: number
        const cold = [34, 9, 70], hot = [255, Math.round(168 + A[1] * 0.32), 44]
        if (heat < 0.5) {
          f = heat / 0.5
          r = Math.round(cold[0] + (A[0] - cold[0]) * f); g = Math.round(cold[1] + (A[1] - cold[1]) * f)
          bb = Math.round(cold[2] + (A[2] - cold[2]) * f)
        } else {
          f = (heat - 0.5) / 0.5
          r = Math.round(A[0] + (hot[0] - A[0]) * f); g = Math.round(A[1] + (hot[1] - A[1]) * f)
          bb = Math.round(A[2] + (hot[2] - A[2]) * f)
        }
        aa = Math.min(0.93, a * 2.7)
      }
      ctx.fillStyle = `rgba(${r},${g},${bb},${aa})`
      ctx.beginPath(); ctx.arc(x, y, sz, 0, 6.283); ctx.fill()
    }
  }

  function drawMicroNodes(
    ui: UISnapshot, i: number, cx: number, cy: number, R: number, alpha: number, t: number,
  ): void {
    const kids = childrenIdx[i]; if (!kids || !kids.length) return
    const lit = (ui.theme !== 'light'); const A = rgb(COLOR[NODES[i].region])
    ctx.globalCompositeOperation = lit ? 'lighter' : 'source-over'
    for (let k = 0; k < kids.length; k++) {
      const ph = k * 2.3999 + i * 0.7
      const orbR = R * (0.5 + 0.34 * Math.sin(t * 0.32 + ph * 1.6))
      const ang = ph + t * 0.16 + 0.45 * Math.sin(t * 0.5 + ph)
      const x = cx + Math.cos(ang) * orbR, y = cy + Math.sin(ang) * orbR * 0.9
      const sz = 2.0 + 0.9 * Math.sin(t * 1.4 + ph * 3)
      let a = (0.4 + 0.35 * Math.sin(t * 1.1 + ph)) * alpha
      a = Math.max(0.12, Math.min(0.95, a))
      let r: number, g: number, b: number
      if (lit) {
        r = Math.round(A[0] * 0.55 + 102); g = Math.round(A[1] * 0.55 + 102); b = Math.round(A[2] * 0.55 + 102)
      } else {
        r = Math.round(A[0] * 0.92); g = Math.round(A[1] * 0.92); b = Math.round(A[2] * 0.92)
        a = Math.min(0.96, a * 1.4)
      }
      ctx.fillStyle = `rgba(${r},${g},${b},${a})`
      ctx.beginPath(); ctx.arc(x, y, Math.max(0.5, sz), 0, 6.283); ctx.fill()
    }
  }

  return { drawCluster, drawMicroNodes }
}
