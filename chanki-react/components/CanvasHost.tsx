'use client'

import dynamic from 'next/dynamic'

// 엔진은 window/canvas를 만지므로 프리렌더를 배제한다.
// ssr:false 는 Client Component 안에서만 유효하다 (Next 16 에서 Server Component 는 에러).
const MapCanvas = dynamic(() => import('./MapCanvas'), { ssr: false })

export default function CanvasHost() {
  return <MapCanvas />
}
