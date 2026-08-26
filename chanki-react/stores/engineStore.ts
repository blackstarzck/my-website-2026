// 프레임당 갱신되는 연속 값. 초당 60회 변하므로 React가 절대 구독해서는 안 된다.
// 그래서 이 모듈은 훅을 export하지 않는다 — 실수로 구독하는 것이 구조적으로 불가능하다.
import { createStore } from 'zustand/vanilla'
import { NODES } from '@/data/nodes'

export type EngineState = {
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
  CX: Float64Array
  CY: Float64Array
  R: Float64Array
  AL: Float64Array
  DF: Float64Array
}

const n = NODES.length

export const engineStore = createStore<EngineState>(() => ({
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
  PQ: 1,
  CX: new Float64Array(n),
  CY: new Float64Array(n),
  R: new Float64Array(n),
  AL: new Float64Array(n),
  DF: new Float64Array(n),
}))
