import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import AnalyticsGate from '@/components/AnalyticsGate'
import BodyClassSync from '@/components/BodyClassSync'
import CanvasHost from '@/components/CanvasHost'
import ClarityGate from '@/components/ClarityGate'
import './globals.css'

const title = '김찬기 · 프론트엔드 개발자'
const description =
  '퍼블리싱에서 시작해 프론트엔드를 지나 서버까지. 사용자 경험을 제품 가치로 연결하는 프론트엔드 개발자 김찬기의 작업 지도.'
const metadataBase = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000'),
)

export const metadata: Metadata = {
  metadataBase,
  title,
  description,
  applicationName: '김찬기 포트폴리오',
  authors: [{ name: '김찬기' }],
  creator: '김찬기',
  keywords: [
    '김찬기',
    '프론트엔드 개발자',
    'Frontend Developer',
    'React',
    'Next.js',
    '포트폴리오',
  ],
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: { url: '/assets/favicon.png', type: 'image/png' },
    apple: '/assets/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    siteName: '김찬기 포트폴리오',
    title,
    description,
    images: [
      {
        url: '/frontend.png',
        width: 1122,
        height: 1402,
        alt: '김찬기 프론트엔드 개발자 포트폴리오',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [{ url: '/frontend.png', alt: '김찬기 프론트엔드 개발자 포트폴리오' }],
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: '#100E1A',
  colorScheme: 'dark light',
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
        <ClarityGate />
      </body>
    </html>
  )
}
