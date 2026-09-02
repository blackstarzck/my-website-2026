'use client'

import { Analytics, type BeforeSendEvent } from '@vercel/analytics/next'
import { useEffect } from 'react'

const STORAGE_KEY = 'va-disable'
const TOGGLE_PARAM = 'va-disable'
// 이 프로젝트의 프로덕션 별칭 두 개. 커스텀 도메인(kchanchan.com 등)은 .vercel.app
// 이 아니라 아래 판별에서 자동으로 통과된다.
const PRODUCTION_HOSTS = new Set([
  'chanki-react.vercel.app',
  'chanki-react-bucheongosok-gmailcoms-projects.vercel.app',
])

// Preview·개발 배포에서는 스크립트를 아예 싣지 않는다. 다만 시스템 환경변수는
// 프로젝트 설정에서 켜야만 노출되므로, 값이 비어 있으면 여기서 막지 않고
// beforeSend 의 호스트네임 판별에 맡긴다 — 값이 없다는 이유로 프로덕션 집계가
// 조용히 꺼지는 쪽이 preview 가 조금 새는 쪽보다 나쁘다.
const BUILD_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV
const BLOCKED_AT_BUILD = BUILD_ENV === 'preview' || BUILD_ENV === 'development'

// 사파리 프라이빗 모드 등에서는 localStorage 접근 자체가 throw 한다.
function readOptOut(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function writeOptOut(on: boolean) {
  try {
    if (on) localStorage.setItem(STORAGE_KEY, '1')
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // 저장에 실패하면 이번 세션에만 적용된다. 집계를 막는 쪽이라 그냥 넘어간다.
  }
}

// ?va-disable=1 이면 이 기기를 제외 등록, =0 이면 해제한다.
// 처리 후 주소창에서 파라미터를 지워 링크가 그대로 공유·북마크되지 않게 한다.
function applyToggleFromUrl() {
  const params = new URLSearchParams(window.location.search)
  const raw = params.get(TOGGLE_PARAM)
  if (raw === null) return

  writeOptOut(raw !== '0' && raw !== 'false')

  params.delete(TOGGLE_PARAM)
  const query = params.toString()
  window.history.replaceState(
    null,
    '',
    window.location.pathname + (query ? `?${query}` : '') + window.location.hash,
  )
}

// 환경변수가 없을 때의 대비책. 커스텀 도메인은 .vercel.app 이 아니라 통과된다.
function isTrackedHost(): boolean {
  const host = window.location.hostname
  return !host.endsWith('.vercel.app') || PRODUCTION_HOSTS.has(host)
}

function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  if (readOptOut() || !isTrackedHost()) return null

  // 토글 파라미터가 붙은 첫 방문은 이벤트 URL 에도 남아 있다. 집계에서 지운다.
  const url = new URL(event.url)
  if (!url.searchParams.has(TOGGLE_PARAM)) return event

  url.searchParams.delete(TOGGLE_PARAM)
  return { ...event, url: url.toString() }
}

export default function AnalyticsGate() {
  // 자식(Analytics)의 effect 가 먼저 도는 탓에 첫 pageview 는 이미 큐에 들어가
  // 있지만, 큐는 스크립트 로드 후에야 beforeSend 를 거쳐 처리되므로 늦지 않다.
  useEffect(() => {
    applyToggleFromUrl()
  }, [])

  if (BLOCKED_AT_BUILD) return null

  return <Analytics beforeSend={beforeSend} />
}
