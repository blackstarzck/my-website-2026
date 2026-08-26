// React 전용 래퍼 모듈. uiStore.ts 와 분리되어 있다 — zustand의 메인 엔트리('zustand')는
// zustand/react 를 재수출하고 그 첫 줄이 import React from 'react' 이므로, 이 훅과 같은
// 파일에 vanilla 스토어를 두면 React 를 전혀 쓰지 않는 엔진(engine/legacy.ts 등)까지
// 모듈 평가 시점에 React 를 로드하게 된다(리뷰 Fix 1). 컴포넌트는 이 모듈만 쓴다.
import { useStore } from 'zustand'
import { uiStore, type UIState } from './uiStore'

export function useUIStore<U>(selector: (s: UIState) => U): U {
  return useStore(uiStore, selector)
}
