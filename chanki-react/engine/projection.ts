// proj/nodeFieldScreen/heroPos — 3D 카메라 투영과 화면좌표 변환, 그리고
// 그것들이 쓰는 NODES 경계 상수(cx0/cy0/orgR/BX). 팩토리다 — 클래스도 싱글턴도 아니라서
// 엔진 인스턴스마다 자기 sim 으로 새로 만든다(값 자체는 정적 데이터에서 유도돼 인스턴스
// 사이에 항상 같다).
import { NODES } from '@/data/nodes'
import { ZMAP } from '@/data/zmap'
import type { Sim } from './sim'

export type Projection = {
  proj(wx: number, wy: number, wz?: number): [number, number, number]
  nodeFieldScreen(i: number): [number, number, number]
  heroPos(): [number, number]
  cx0: number
  cy0: number
  orgR: number
  BX: { mnx: number; mxx: number; mny: number; mxy: number }
}

export function createProjection(sim: Sim): Projection {
  // NODES 경계에서 유도 — x/y/r 만 쓰므로 legacy.ts 의 N(=NODES + z/cl 부가)이 아니라
  // 원본 NODES 로 계산해도 값이 같다.
  const cx0 = NODES.reduce((s, n) => s + n.x, 0) / NODES.length
  const cy0 = NODES.reduce((s, n) => s + n.y, 0) / NODES.length
  let orgR = 0
  NODES.forEach((n) => { orgR = Math.max(orgR, Math.hypot(n.x - cx0, n.y - cy0) + n.r) })
  const BX = {
    mnx: Math.min(...NODES.map((n) => n.x)), mxx: Math.max(...NODES.map((n) => n.x)),
    mny: Math.min(...NODES.map((n) => n.y)), mxy: Math.max(...NODES.map((n) => n.y)),
  }

  function proj(wx: number, wy: number, wz?: number): [number, number, number] {
    const x = wx - cx0, y = wy - cy0, z = (wz || 0) * 1.3
    const sp = sim.curRot, cs = Math.cos(sp), sn = Math.sin(sp)
    const px = x * cs - y * sn, py = x * sn + y * cs
    const ay = sim.viewRot, cay = Math.cos(ay), say = Math.sin(ay)
    let x1 = px * cay - z * say
    const z1 = px * say + z * cay
    const ax = sim.viewTiltX, cax = Math.cos(ax), sax = Math.sin(ax)
    let y1 = py * cax - z1 * sax
    const z2 = py * sax + z1 * cax
    x1 *= sim.curBr; y1 *= sim.curBr
    const persp = 5.5 / (5.5 - z2 * 0.5), Z = sim.camZoom * sim.userZoom * persp
    return [sim.W * sim.fieldCX + x1 * sim.SC * Z, sim.H / 2 - y1 * sim.SC * Z, persp]
  }
  function nodeFieldScreen(i: number): [number, number, number] {
    const n = NODES[i]
    // Depth formula: ZMAP[n.id] || 0. Must stay in sync with the same formula in
    // engine/legacy.ts (line ~125, where the decorated node array is built).
    return proj(n.x, n.y, ZMAP[n.id] || 0)
  }
  function heroPos(): [number, number] { return [sim.W * 0.5, sim.H * 0.215] }

  return { proj, nodeFieldScreen, heroPos, cx0, cy0, orgR, BX }
}
