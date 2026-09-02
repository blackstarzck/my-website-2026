import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import AnalyticsGate from '@/components/AnalyticsGate'
import BodyClassSync from '@/components/BodyClassSync'
import CanvasHost from '@/components/CanvasHost'
import './globals.css'

export const metadata: Metadata = {
  title: '김찬기 · 프론트엔드 개발자',
  description: '퍼블리싱에서 시작해 프론트엔드를 지나 서버까지. 사용자 경험을 제품 가치로 연결하는 프론트엔드 개발자 김찬기의 작업 지도.',
  icons: {
    icon: { url: '/assets/favicon.png', type: 'image/png' },
    apple: '/assets/apple-touch-icon.png',
  },
}

// 캔버스와 골격은 레이아웃에 둔다. App Router 에서 형제 라우트 간 이동 시
// 리마운트되지 않으므로 엔진(파티클·전이 상태)이 계속 살아 있다.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <BodyClassSync />
        <CanvasHost />
        {children}
        <AnalyticsGate />
      </body>
    </html>
  )
}
