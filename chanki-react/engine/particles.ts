// createParticles — 노드 클라우드·haze·별의 유일한 생성원. 원본(index.html)의 파티클
// 배치 코드를 그대로 옮긴 것이다 — 그리기(ctx 호출)는 여기 없다, legacy.ts(향후
// renderers)의 소관이다.
//
// rng 소비 순서는 원본과 동일해야 한다: 노드 클라우드(NODES 순서) → haze(1500) → 별(560).
// 이 순서를 바꾸면 시드가 같아도 이후 모든 소비자가 다른 수열을 받아 배치가 달라진다.
//
// 원본은 n.cl = [...] 로 import 된 노드 객체에 파티클을 직접 붙였다(변이). 여기서는
// clouds[i] (노드 인덱스 배열, i 는 NODES/legacy.ts 의 N 과 같은 순서)로 저장 위치만
// 옮긴다 — 값·순서는 동일하다. 소비처(engine/legacy.ts 의 drawCluster 호출부)가
// n.cl 대신 clouds[i] 를 읽도록 그쪽에서 rewiring 한다.
import { EDGES } from '@/data/edges'
import { NODES } from '@/data/nodes'
import { ZMAP } from '@/data/zmap'
import type { Rng } from './random'

/** 노드/허브 파티클 한 알. */
export type CloudPt = {
  a: number; rr: number; b: number; ph: number; sp: number; jz: number; sz: number
}
export type HazePt = {
  x: number; y: number; z: number; b: number; ph: number; sp: number; sz: number
}
export type Star = { x: number; y: number; b: number; tw: number }
export type Particles = { clouds: CloudPt[][]; haze: HazePt[]; stars: Star[] }

export function createParticles(rng: Rng, gauss: () => number): Particles {
  // clouds[i] 는 NODES[i] (=legacy.ts 의 N[i]) 에 대응한다 — map 이 NODES 의 순서와
  // 길이를 그대로 보존하므로 인덱스 하나로 양쪽을 잇는다.
  const clouds: CloudPt[][] = NODES.map((n) => {
    const cnt = Math.round(70 + n.r * 120)
    return Array.from({ length: cnt }, () => {
      const a = rng() * 6.283, rr = Math.pow(rng(), 0.5)
      return {
        a, rr, b: Math.pow(rng(), 1.7), ph: rng() * 6.283,
        sp: 0.2 + rng() * 0.6, jz: gauss() * 0.22,
        sz: 0.5 + Math.pow(rng(), 2) * 1.4,
      }
    })
  })

  // idIndex 는 legacy.ts 의 것과 같은 유도를 반복한다 — engine/projection.ts 의
  // cx0/cy0/BX 와 같은 패턴(정적 데이터에서 매번 다시 구한다. 값은 항상 같다).
  const idIndex: Record<string, number> = Object.fromEntries(
    NODES.map((n, i) => [n.id, i] as [string, number]),
  )
  const haze: HazePt[] = []
  for (let i = 0; i < 1500; i++) {
    const e = EDGES[(rng() * EDGES.length) | 0]
    const a = idIndex[e[0]], b = idIndex[e[1]]
    const na = NODES[a], nb = NODES[b]
    // 원본은 na.z/nb.z(런타임에 노드에 붙인 ZMAP 값)를 읽었다. 여기선 노드를 변이하지
    // 않으므로 같은 값을 ZMAP 에서 직접 구한다 — rng 를 소비하지 않는 순수 조회라
    // 아래 rng() 호출 순서에는 영향이 없다.
    const az = ZMAP[na.id] || 0, bz = ZMAP[nb.id] || 0
    const u = rng()
    haze.push({
      x: na.x + (nb.x - na.x) * u + gauss() * 0.5,
      y: na.y + (nb.y - na.y) * u + gauss() * 0.5,
      z: az + (bz - az) * u,
      b: Math.pow(rng(), 2.4) * 0.6, ph: rng() * 6.283,
      sp: 0.2 + rng() * 0.5, sz: 0.5 + rng() * 1.1,
    })
  }

  const stars: Star[] = Array.from({ length: 560 }, () => ({
    x: rng(), y: rng(), b: Math.pow(rng(), 1.9), tw: rng() * 6.28,
  }))

  return { clouds, haze, stars }
}
