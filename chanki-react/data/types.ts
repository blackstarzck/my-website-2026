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
  project?: ProjectFields
}
