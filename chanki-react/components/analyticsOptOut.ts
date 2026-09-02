// Vercel Analytics 와 Microsoft Clarity 가 공유하는 수집 제외 장치.
// 저장 키를 하나로 두면 ?va-disable=1 링크 한 번으로 두 도구가 같이 꺼진다.

export const STORAGE_KEY = 'va-disable'
export const TOGGLE_PARAM = 'va-disable'

// 이 프로젝트의 프로덕션 별칭 두 개. 커스텀 도메인(kchanchan.com 등)은 .vercel.app
// 이 아니라 아래 판별에서 자동으로 통과된다.
const PRODUCTION_HOSTS = new Set([
  'chanki-react.vercel.app',
  'chanki-react-bucheongosok-gmailcoms-projects.vercel.app',
])

// Preview·개발 배포에서는 스크립트를 아예 싣지 않는다. 다만 시스템 환경변수는
// 프로젝트 설정에서 켜야만 노출되므로, 값이 비어 있으면 여기서 막지 않고
// 호스트네임 판별에 맡긴다 — 값이 없다는 이유로 프로덕션 집계가 조용히 꺼지는
// 쪽이 preview 가 조금 새는 쪽보다 나쁘다.
const BUILD_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV
export const BLOCKED_AT_BUILD = BUILD_ENV === 'preview' || BUILD_ENV === 'development'

// 사파리 프라이빗 모드 등에서는 localStorage 접근 자체가 throw 한다.
export function readOptOut(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function writeOptOut(on: boolean) {
  try {
    if (on) localStorage.setItem(STORAGE_KEY, '1')
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // 저장에 실패하면 이번 세션에만 적용된다. 집계를 막는 쪽이라 그냥 넘어간다.
  }
}

// ?va-disable=1 이면 이 기기를 제외 등록, =0 이면 해제한다.
// 처리 후 주소창에서 파라미터를 지워 링크가 그대로 공유·북마크되지 않게 한다.
// 두 게이트가 각자 호출해도 되도록 멱등하게 두었다 — 먼저 도는 쪽이 파라미터를
// 지우면 나중 호출은 그냥 빠져나간다.
export function applyToggleFromUrl() {
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
export function isTrackedHost(): boolean {
  const host = window.location.hostname
  return !host.endsWith('.vercel.app') || PRODUCTION_HOSTS.has(host)
}

// next start 로 프로덕션 빌드를 로컬에서 띄웠을 때를 위한 판별.
// Vercel Analytics 는 개발 환경을 스스로 구분하지만 Clarity 태그는 그러지 않는다.
export function isLocalHost(): boolean {
  const host = window.location.hostname
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '[::1]' ||
    host.endsWith('.local')
  )
}

// 렌더 중에 호출해도 안전한 순수 판별. applyToggleFromUrl 이 아직 안 돌아
// 파라미터가 URL 에 남아 있으면 그 값을, 이미 지워졌으면 localStorage 를 본다 —
// 어느 쪽이 먼저 실행되든 같은 답이 나온다.
export function isExcluded(): boolean {
  const raw = new URLSearchParams(window.location.search).get(TOGGLE_PARAM)
  if (raw !== null) return raw !== '0' && raw !== 'false'
  return readOptOut()
}
