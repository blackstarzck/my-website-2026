// 사용자 행동으로만 변하는 이산 상태. 리액티브 — 컴포넌트가 구독한다.
// React 훅은 여기 두지 않는다 — 훅은 './useUIStore.ts' 참고 (리뷰 Fix 1).
import { createStore } from 'zustand/vanilla'
import { NODES } from '@/data/nodes'
import { PARENTS } from '@/data/regions'
import { ENTRY_ID } from '@/data/site'

export type Mode = 'cold' | 'field' | 'trans' | 'page'
export type GalMode = 'area' | 'node' | null
export type Theme = 'dark' | 'light'

const byId = new Map(NODES.map((node) => [node.id, node]))
const indexOf = new Map(NODES.map((node, i) => [node.id, i]))
const childrenOf = new Map<string, number[]>()
for (const [i, node] of NODES.entries()) {
  const parent = node.region
  if (!childrenOf.has(parent)) childrenOf.set(parent, [])
  if (node.id !== parent) childrenOf.get(parent)!.push(i)
}

export type UIState = {
  mode: Mode
  activeId: string | null
  fieldSel: string
  galMode: GalMode
  galNode: string | null
  regionMode: boolean
  origenOn: boolean
  theme: Theme
  focusSet: ReadonlySet<number>
  hoverId: string | null

  goHome: () => void
  selectNode: (id: string) => void
  openNode: (id: string) => void
  returnField: () => void
  openOrigen: () => void
  closeOrigen: () => void
  toggleTheme: () => void
  setHover: (id: string | null) => void
  setMode: (mode: Mode) => void
}

export type UISnapshot = Omit<
  UIState,
  | 'goHome' | 'selectNode' | 'openNode' | 'returnField'
  | 'openOrigen' | 'closeOrigen' | 'toggleTheme' | 'setHover' | 'setMode'
>

const HOME_FOCUS: ReadonlySet<number> = new Set([indexOf.get(ENTRY_ID)!])

export const uiStore = createStore<UIState>((set, get) => ({
  mode: 'cold',
  activeId: null,
  fieldSel: ENTRY_ID,
  galMode: null,
  galNode: null,
  regionMode: false,
  origenOn: false,
  theme: 'dark',
  focusSet: HOME_FOCUS,
  hoverId: null,

  goHome: () => set({
    fieldSel: ENTRY_ID,
    activeId: null,
    regionMode: false,
    galMode: null,
    galNode: null,
    origenOn: false,
    focusSet: HOME_FOCUS,
    mode: get().mode === 'cold' ? 'cold' : 'field',
  }),

  selectNode: (id) => {
    const node = byId.get(id)
    if (!node) return
    const i = indexOf.get(id)!
    // 원본 setFieldFocus 의 세 분기를 그대로 옮긴다.
    if (id === ENTRY_ID) {
      set({ fieldSel: id, regionMode: false, focusSet: new Set([i]), galMode: 'area', galNode: ENTRY_ID, origenOn: false })
      return
    }
    const isArea = PARENTS.has(node.region) && id === node.region
    if (isArea) {
      set({
        fieldSel: id,
        regionMode: true,
        focusSet: new Set([i, ...(childrenOf.get(id) ?? [])]),
        galMode: 'area',
        galNode: id,
        origenOn: false,
      })
      return
    }
    set({ fieldSel: id, regionMode: false, focusSet: new Set([i]), galMode: 'node', galNode: id, origenOn: false })
  },

  openNode: (id) => {
    if (!byId.has(id)) return
    set({ activeId: id, mode: 'page', origenOn: false })
  },

  returnField: () => set({ mode: 'field', activeId: null }),

  openOrigen: () => set({ origenOn: true }),
  closeOrigen: () => set({ origenOn: false }),

  toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
  setHover: (id) => set({ hoverId: id }),
  setMode: (mode) => set({ mode }),
}))
