'use client'

import { Analytics, type BeforeSendEvent } from '@vercel/analytics/next'
import { useEffect } from 'react'
import {
  BLOCKED_AT_BUILD,
  TOGGLE_PARAM,
  applyToggleFromUrl,
  isTrackedHost,
  readOptOut,
} from './analyticsOptOut'

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
