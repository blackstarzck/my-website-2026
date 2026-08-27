'use client'

import { useEffect, useRef } from 'react'
import { createEngine } from '@/engine/legacy'
import type { EngineHandle, EngineTestHandle } from '@/engine/types'
import { engineStore } from '@/stores/engineStore'
import { uiStore } from '@/stores/uiStore'

// 테스트 훅. 프로덕션 번들에는 들어가지 않는다.
const TEST_KEYS = ['__engine', '__engineStore', '__uiStore'] as const

export default function MapCanvas() {
  const field = useRef<HTMLCanvasElement>(null)
  const glass = useRef<HTMLCanvasElement>(null)
  const mini = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!field.current || !glass.current || !mini.current) return
    // 리뷰 Fix 2: 지역 변수는 좁은 EngineHandle 로 선언한다 — 프로덕션 코드가 보는 타입이
    // 이것이므로, step/resetView 같은 테스트 전용 메서드를 실수로 불러 uiStore 와 엔진을
    // 조용히 어긋나게 만드는 경로를 컴파일 타임에 막는다. createEngine() 은 실제로는
    // EngineTestHandle(더 넓은 타입)을 반환하고, 아래 window.__engine 대입 한 곳에서만
    // 그 전체 표면으로 명시적으로 넓힌다.
    const engine: EngineHandle = createEngine({
      canvases: { field: field.current, glass: glass.current, mini: mini.current },
    })
    engine.start()

    if (process.env.NODE_ENV !== 'production') {
      const w = window as unknown as Record<string, unknown>
      w.__engine = engine as EngineTestHandle
      w.__engineStore = engineStore
      w.__uiStore = uiStore
    }

    return () => {
      engine.dispose()
      if (process.env.NODE_ENV !== 'production') {
        const w = window as unknown as Record<string, unknown>
        for (const k of TEST_KEYS) delete w[k]
      }
    }
  }, [])

  // 원본 ../nicoborja-clone/index.html L383–402 의 DOM 골격. 태그/id/class/중첩/텍스트를
  // 보존하고 JSX 규칙만 맞췄다. 계획 3에서 실제 React 컴포넌트로 교체될 자리표시자다.
  // 제외: #origenc, #origenmark (원본 CSS L362 에서 display:none!important), Awwwards 배지.
  return (
    <>
      <canvas id="c" ref={field}></canvas><div id="vig"></div>
      <canvas id="glass" ref={glass}></canvas>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <filter id="glassfx" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.011 0.014" numOctaves="2" seed="7" result="n" />
          <feGaussianBlur in="n" stdDeviation="0.6" result="ns" />
          <feDisplacementMap in="SourceGraphic" in2="ns" scale="22" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation="2.2" />
        </filter>
      </svg>
      {/* 소개 페이지로 가는 진입점. 클릭 처리는 engine/legacy.ts 에서 붙인다. */}
      <div id="wordmark" role="button" tabIndex={0} aria-label="김찬기 소개 보기">CHANKI KIM</div>
      <button id="themebtn" aria-label="밝게·어둡게 전환"><span className="ti">☀</span><span className="tl">밝게</span></button>
      <div id="tabs"></div>
      <div id="minilbl">사이트 지도 · 현재 위치</div><canvas id="mini" ref={mini}></canvas>
      <div id="mtip"><div className="nm"></div><div className="mr"></div></div>
      <aside id="gallery"></aside>
      <div id="origenback">‹ 지도로 돌아가기</div><div id="origenpi"><span className="pi">π</span> 소개</div>
      <div id="crumb"><b id="cpath">~/</b><span className="n" id="cnum">작업 지도</span></div>
      <div id="tip"><div className="nm"></div><div className="kc"></div><div className="go"></div></div>
      <div id="pagetop"><span className="num" id="chnum"></span><span className="back" id="back">↖ 지도로 돌아가기</span></div>
      <div id="page"><div className="spacer" id="spacer"><span className="ret">↖ 여기를 눌러 지도로 돌아가기</span></div><div className="doc" id="doc"></div></div>
      <div id="hint">고리가 있는 <b>영역</b>을 누르면 살펴보기 · <b>프로젝트</b>를 누르면 미리보기</div>
      {/* 개인정보 처리방침 링크는 해당 페이지를 만든 뒤 되살린다.
          원본에서 온 링크였는데 이 앱에는 /privacy 라우트가 없어 404 였다. */}
      <div id="coldtitle">CHANKI KIM</div>
      <div id="caminos"></div>
    </>
  )
}
