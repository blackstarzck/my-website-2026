'use client'

import Script from 'next/script'
import { useSyncExternalStore } from 'react'
import {
  BLOCKED_AT_BUILD,
  isExcluded,
  isLocalHost,
  isTrackedHost,
} from './analyticsOptOut'

// 비밀값이 아니다 — 태그 URL 에 그대로 실려 페이지 소스에서 보인다. 환경변수로
// 빼봐야 Vercel 설정 누락으로 수집이 조용히 꺼질 위험만 생겨서 상수로 둔다.
const PROJECT_ID = 'ybwbqvy82v'

// next dev 는 물론 LAN IP 로 접속한 모바일 테스트까지 한 번에 막는다.
const IS_DEV_BUILD = process.env.NODE_ENV !== 'production'

// localStorage 와 hostname 은 서버에서 알 수 없다. useSyncExternalStore 로 읽으면
// 하이드레이션 때는 서버 스냅샷(false)을 쓰고 그 직후 클라이언트 값으로 다시
// 렌더된다 — effect 에서 setState 하는 것과 같은 결과를 불필요한 렌더 없이 얻는다.
const subscribe = () => () => {}
const getSnapshot = () => !isExcluded() && !isLocalHost() && isTrackedHost()
const getServerSnapshot = () => false

export default function ClarityGate() {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  // Vercel Analytics 의 beforeSend 와 달리 Clarity 태그는 한 번 실리면 되돌릴 수
  // 없다. 판정이 끝나기 전에는 렌더링하지 않는 쪽으로 기운다.
  if (BLOCKED_AT_BUILD || IS_DEV_BUILD || !enabled) return null

  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${PROJECT_ID}");`}
    </Script>
  )
}
