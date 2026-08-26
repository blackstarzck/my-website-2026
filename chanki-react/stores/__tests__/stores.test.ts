import { beforeEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { uiStore } from '../uiStore'
import { engineStore } from '../engineStore'
import * as engineStoreModule from '../engineStore'
import { NODES } from '@/data/nodes'

describe('uiStore', () => {
  beforeEach(() => uiStore.getState().goHome())

  // Helper: get focusSet contents as sorted array for comparison
  const focusSetToSortedArray = (s: ReadonlySet<number>): number[] =>
    [...s].sort((a, b) => a - b)

  it('goHome은 진입 노드를 선택하고 갤러리를 닫는다', () => {
    uiStore.getState().goHome()
    const s = uiStore.getState()
    expect(s.fieldSel).toBe('chanki')
    expect(s.galMode).toBeNull()
    expect(s.regionMode).toBe(false)
    expect(s.activeId).toBeNull()
  })

  it('진입 노드를 직접 선택하면 area 갤러리가 열리고 그 노드만 포커스된다', () => {
    uiStore.getState().selectNode('chanki')
    const s = uiStore.getState()
    const entryIdx = NODES.findIndex((n) => n.id === 'chanki')
    expect(s.fieldSel).toBe('chanki')
    expect(s.regionMode).toBe(false)
    expect(s.galMode).toBe('area')
    expect(s.galNode).toBe('chanki')
    expect(focusSetToSortedArray(s.focusSet)).toEqual([entryIdx])
  })

  it('리전 노드를 선택하면 regionMode가 켜지고 area 갤러리가 열린다', () => {
    uiStore.getState().selectNode('frontend')
    const s = uiStore.getState()
    const areaIdx = NODES.findIndex((n) => n.id === 'frontend')
    const areaChildren = NODES.reduce((acc, node, i) => {
      if (node.region === 'frontend' && node.id !== 'frontend') {
        acc.push(i)
      }
      return acc
    }, [] as number[])
    expect(s.fieldSel).toBe('frontend')
    expect(s.regionMode).toBe(true)
    expect(s.galMode).toBe('area')
    expect(s.galNode).toBe('frontend')
    expect(focusSetToSortedArray(s.focusSet)).toEqual(
      focusSetToSortedArray(new Set([areaIdx, ...areaChildren]))
    )
  })

  it('일반 노드를 선택하면 node 갤러리가 열리고 regionMode는 꺼진다', () => {
    uiStore.getState().selectNode('topik-user')
    const s = uiStore.getState()
    const leafIdx = NODES.findIndex((n) => n.id === 'topik-user')
    expect(s.regionMode).toBe(false)
    expect(s.galMode).toBe('node')
    expect(s.galNode).toBe('topik-user')
    expect(focusSetToSortedArray(s.focusSet)).toEqual([leafIdx])
  })

  it('openNode는 activeId를 세우고 page 모드로 간다', () => {
    uiStore.getState().openNode('frontend')
    const s = uiStore.getState()
    expect(s.activeId).toBe('frontend')
    expect(s.mode).toBe('page')
  })

  it('openOrigen/closeOrigen이 origenOn을 토글한다', () => {
    uiStore.getState().openOrigen()
    expect(uiStore.getState().origenOn).toBe(true)
    uiStore.getState().closeOrigen()
    expect(uiStore.getState().origenOn).toBe(false)
  })

  it('toggleTheme이 dark/light를 왕복한다', () => {
    const before = uiStore.getState().theme
    uiStore.getState().toggleTheme()
    expect(uiStore.getState().theme).not.toBe(before)
    uiStore.getState().toggleTheme()
    expect(uiStore.getState().theme).toBe(before)
  })

  it('존재하지 않는 id는 상태를 바꾸지 않는다', () => {
    uiStore.getState().goHome()
    const before = uiStore.getState()
    uiStore.getState().selectNode('does-not-exist')
    expect(uiStore.getState().fieldSel).toBe(before.fieldSel)
  })

  it('openNode 는 미지 id 에 상태를 바꾸지 않는다', () => {
    uiStore.getState().goHome()
    uiStore.getState().openNode('does-not-exist')
    expect(uiStore.getState().activeId).toBeNull()
    expect(uiStore.getState().mode).not.toBe('page')
  })

  it('returnField 는 page 에서 field 로 되돌리고 activeId 를 비운다', () => {
    uiStore.getState().openNode('frontend')
    uiStore.getState().returnField()
    expect(uiStore.getState().mode).toBe('field')
    expect(uiStore.getState().activeId).toBeNull()
  })

  it('goHome 은 field 계열 모드를 보존한다 (cold 가 아니면 field)', () => {
    uiStore.getState().openNode('frontend')   // mode: 'page'
    uiStore.getState().goHome()
    expect(uiStore.getState().mode).toBe('field')
  })

  it('setHover / setMode 단순 세터', () => {
    uiStore.getState().setHover('topik-user')
    expect(uiStore.getState().hoverId).toBe('topik-user')
    uiStore.getState().setHover(null)
    expect(uiStore.getState().hoverId).toBeNull()
    uiStore.getState().setMode('trans')
    expect(uiStore.getState().mode).toBe('trans')
    uiStore.getState().setMode('field')
  })
})

describe('engineStore', () => {
  it('노드 수 길이의 Float64Array를 갖는다', () => {
    const s = engineStore.getState()
    expect(s.CX).toBeInstanceOf(Float64Array)
    expect(s.CX.length).toBe(NODES.length)
    expect(s.AL.length).toBe(NODES.length)
  })

  it('프레임 값을 setState로 쓸 수 있다', () => {
    engineStore.setState({ P: 0.5, coldP: 1 })
    expect(engineStore.getState().P).toBe(0.5)
    engineStore.setState({ P: 0, coldP: 0 })
  })

  it('React 훅을 export하지 않는다 — 성능 경계의 구조적 보증', () => {
    const exported = Object.keys(engineStoreModule)
    const hooks = exported.filter((k) => /^use[A-Z]/.test(k))
    expect(hooks, `훅이 발견됨: ${hooks.join(', ')}`).toEqual([])
  })

  it('소스에 useStore/create( 사용이 없다', () => {
    const src = readFileSync(resolve(import.meta.dirname, '../engineStore.ts'), 'utf8')
    expect(src).not.toMatch(/from\s+['"]zustand['"]/)
    expect(src).toMatch(/zustand\/vanilla/)
  })
})
