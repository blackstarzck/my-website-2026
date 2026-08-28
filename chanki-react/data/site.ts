// 사이트 정체성과 UI 문구. 엔진에 하드코딩돼 있던 값을 전부 여기로 모았다.
// 콘텐츠를 바꾸려면 data/ 안에서만 손대면 된다 — engine/ 은 이 파일을 읽기만 한다.
import type { Region } from './types'

/** 지도의 중심 노드. 홈으로 돌아갈 때 포커스되는 대상. */
export const ENTRY_ID = 'chanki'

/**
 * 연락처 노드. 진입 갤러리(프로필) 본문 아래의 버튼과 페이지 푸터가 이곳으로 보낸다.
 * 이 노드의 페이지는 맥락 대신 CONTACT_EMAIL 을 메타 행에 띄우고, 값이 겹치는
 * '작업' 행은 두지 않는다.
 */
export const CONTACT_ID = 'contact'

/** 상단 탭에 노출할 리전과 라벨. 순서가 곧 탭 순서다. */
export const REG_TABS: [Region, string][] = [
  ['entry', '김찬기'],
  ['frontend', 'FRONTEND'],
  ['backend', 'SERVER'],
  ['ai', 'AI'],
  ['product', 'PRODUCT'],
  ['lab', 'LAB'],
]

/** 탭에 마우스를 올렸을 때 보이는 한 줄 설명. */
export const TAB_DESC: Record<Region, string> = {
  entry: '지도의 중심 — 김찬기',
  frontend: '퍼블리싱에서 Next.js까지, 5년 9개월의 중심 축',
  backend: 'NestJS · TypeORM · PostgreSQL — 화면 뒤의 흐름',
  ai: '멀티 에이전트 · 게이트 하네스 · 검증 루프',
  product: '기획 · 디자인 · 협업 — 코드 바깥의 절반',
  lab: '캔버스 · 3D · 게임, 업무 밖에서 만든 것들',
}

/** 홈 갤러리에 카드로 띄울 노드. 비우면 area 노드가 순서대로 들어간다. */
export const HOME_ITEMS: string[] = ['frontend', 'backend', 'ai', 'product', 'lab']

/**
 * origen(매니페스토) 화면을 여는 노드 id. null 이면 그 화면이 비활성화된다.
 * 켜려면 해당 id 의 노드를 data/nodes.ts 에 추가하고 여기에 적으면 된다.
 */
export const MANIFESTO_ID: string | null = null

/** 갤러리 헤더에 매니페스토 버튼을 띄울 노드들. MANIFESTO_ID 가 null 이면 무시된다. */
export const MANIFESTO_ENTRY_IDS: string[] = []

/** 화면에 그대로 노출되는 문구. */
export const UI_TEXT = {
  backToMap: '↖ 지도로 돌아가기',
  homeCrumb: '지도의 중심',
  manifesto: 'π · 소개',
  siteMapLabel: '사이트 지도 · 현재 위치',
} as const

/**
 * origen 화면의 문장 배치. MANIFESTO_ID 가 null 인 동안은 그려지지 않는다.
 * c = 색을 가져올 리전, w = 글자 크기, o = 중심 기준 오프셋, lines = 단어 단위 배열.
 */
export const MANIFESTO_LAYOUT: {
  c: Region
  w: number
  o: [number, number]
  lines: string[][]
}[] = []

/** 프로젝트 카드·페이지에 쓰이는 고정 문구. 엔진은 이 값만 읽는다. */
export const PAGE_TEXT = {
  projectsSuffix: '개 프로젝트',
  areaOpen: '영역 · 클릭해서 열기 →',
  areaExplore: '영역 · 클릭해서 살펴보기',
  embedHint: '여기서 바로 만져볼 수 있습니다',
  embedFull: '전체 화면으로 보기 ↗',
  openArea: '영역 보기 →',
  open: '열기 →',
  openFallback: '열기',
  openProject: '프로젝트 열기',
  openExternal: '열기 ↗',
  detailToggle: '프로젝트 자세히 보기',
  tabsLead: '지도의 영역',
  areaWord: '영역',
  projectWord: '프로젝트',
  moreOf: '더 보기 →',
  followThread: '이어서 보기 →',
  relatedNote: '같은 영역의 다른 프로젝트들 — 모두 이어져 있습니다.',
  enterPage: '↦ 프로젝트 페이지로 들어가기',
  enterProject: '프로젝트 들어가기 →',
  launch: '실행 ↗',
  youAreHere: '● 현재 위치 · ',
  imageLabel: '이미지',
  pending: '준비 중',
  projectEnter: '프로젝트 · 클릭해서 들어가기 →',
  metaContact: '연락처',
  contactBtn: '연락하기 →',
  metaOnMap: '지도에서',
  metaContext: '맥락',
  metaPiece: '작업',
  // 노드가 다루는 GitHub 저장소 칩 묶음의 라벨. 본문 문장 속 이름만으로는
  // 찾을 수 없어서(링크도 지도 라벨도 없다) 칩으로 따로 깐다.
  reposLabel: '저장소',
  // 프로젝트 카드의 두 버튼.
  cardCode: '코드 ↗',
  cardDemo: '데모 열기 ↗',
  relatedNoteAll: '이 작업과 이어지는 지도의 다른 노드들입니다.',
  treeFull: '~/ 전체 지도',
  tree: '~/ 지도',
  crumbInit: '작업 지도',
  themeLight: '밝게',
  themeDark: '어둡게',
  themeToggleLabel: '밝게·어둡게 전환',
  explore: '살펴보기 →',
  glance: { role: '역할', duration: '기간', impact: '성과' },
  section: { scope: '범위', objectives: '목표', impacts: '성과 상세', story: '배경' },
} as const

/**
 * 스킬 숙련도 뱃지. [뱃지 라벨, 툴팁] 순서다.
 * 키는 data/nodes.ts 의 skills 두 번째 원소와 맞춰야 한다.
 */
export const SKILL_LEVEL: Record<string, [string, string]> = {
  core: ['능숙', '자신 있게 다뤘습니다'],
  grew: ['성장', '이 프로젝트에서 더 깊어졌습니다'],
  first: ['첫 도입', '이 프로젝트에서 처음 썼습니다'],
}
