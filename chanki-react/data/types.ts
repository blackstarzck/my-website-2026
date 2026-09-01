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
  /** 배포된 화면 주소. 없으면 코드 링크만 보인다. */
  demo?: string
  /** /assets/<shot>.jpg 를 카드 썸네일로 쓴다. */
  shot?: string
  /** 같은 작업물의 추가 이미지. 파일명에서 .jpg 를 뺀 값을 넣는다. */
  images?: string[]
  /** 화면이 없는 이유 같은 단서. */
  note?: string
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
  /** 저장소별 프로젝트 카드. */
  cards?: ProjectCard[]
  project?: ProjectFields
}
