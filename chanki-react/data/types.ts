export type Region = 'entry' | 'frontend' | 'backend' | 'ai' | 'product' | 'lab'

export type SkillLevel = 'core' | 'grew' | 'first'

export type ProjectFields = {
  role?: string
  duration?: string
  impact?: string
  scope?: string
  objectives?: string[]
  impacts?: string[]
  skills?: [string, SkillLevel][]
  story?: string
}

export type ProjectCard = {
  repo: string
  desc: string
  skills: string[]
  /** false 이면 코드 버튼을 숨기고, 문자열이면 해당 코드 주소를 쓴다. */
  code?: string | false
  /** 배포된 화면 주소. 없으면 코드 링크만 보인다. */
  demo?: string
  /** 데모 버튼에 표시할 문구. */
  demoLabel?: string
  /** /assets/<shot>.jpg 를 카드 썸네일로 쓴다. */
  shot?: string
  /** 같은 작업물의 추가 이미지. 파일명에서 .jpg 를 뺀 값을 넣는다. */
  images?: string[]
  /** 화면이 없는 이유 같은 단서. */
  note?: string
}

export type ContactItem = {
  title: string
  body: string
}

/**
 * 타임라인 카드. refs 는 이 작업과 이어지는 노드 id 다.
 * 지도에 없는 id 는 칩으로 그려지지 않는다 — engine/legacy.ts contactProfile().
 */
export type ContactProject = ContactItem & {
  refs?: string[]
}

export type ContactJourney = {
  year: string
  title: string
  body?: string
  projects?: ContactProject[]
}

export type ContactFields = {
  journeyHeading: string
  journeyLead: string
  journey: ContactJourney[]
  collaborationHeading: string
  collaboration: ContactItem[]
  fitHeading: string
  fit: string[]
  closingTitle: string
  closingBody: string
}

export type ContentNode = {
  id: string
  name: string
  region: Region
  x: number
  y: number
  r: number
  kicker: string
  sum?: string
  body: string
  cap: string
  url?: string
  urlLabel?: string
  links?: [string, string][]
  /** 이 노드가 다루는 GitHub 저장소 이름. 페이지에 칩으로 그려진다. */
  repos?: string[]
  /** 저장소가 여럿인 노드의 프로젝트 카드. 있으면 links/repos/스트립을 대신한다. */
  cards?: ProjectCard[]
  project?: ProjectFields
  contact?: ContactFields
}
