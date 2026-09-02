import { describe, expect, it } from 'vitest'
import { NODES } from '../nodes'
import type { ContactProject } from '../types'

const CONTACT = NODES.find((node) => node.id === 'contact')?.contact
const IDS = new Set(NODES.map((node) => node.id))

/** 타임라인 카드를 "회사 / 카드 제목" 으로 찾는다. */
function card(company: string, title: string): ContactProject {
  const step = CONTACT?.journey.find((entry) => entry.title === company)
  expect(step, `타임라인에 ${company} 없음`).toBeDefined()
  const found = step?.projects?.find((project) => project.title === title)
  expect(found, `${company} 에 "${title}" 카드 없음`).toBeDefined()
  return found as ContactProject
}

describe('contact 타임라인 카드의 연관 노드', () => {
  it('모든 refs 가 지도에 있는 노드를 가리킨다', () => {
    // 없는 id 는 화면에서 칩이 조용히 사라지는 형태로만 드러난다. 여기서 막는다.
    const unknown = (CONTACT?.journey ?? []).flatMap((step) =>
      (step.projects ?? []).flatMap((project) =>
        (project.refs ?? [])
          .filter((ref) => !IDS.has(ref))
          .map((ref) => `${step.title} / ${project.title} → ${ref}`),
      ),
    )

    expect(unknown).toEqual([])
  })

  it.each([
    ['모두가딜러', '반응형 서비스 운영 및 신규 콘텐츠 개발', ['dealer-web']],
    ['모두가딜러', '관리자 페이지 UI 개선', ['dealer-admin']],
    ['모두가딜러', '레거시 코드와 데이터 조회 구조 정리', ['legacy-cleanup']],
    ['팜커넥트', '센서 데이터 3D 시각화 대시보드', ['farm-3d']],
    ['팜커넥트', 'CONNECT BEE 하이브리드 앱', ['connect-bee']],
    ['케듀올', '도토리 TOPIK 학습 서비스', ['topik-user', 'topik-admin', 'verify-loop']],
    ['케듀올', '도서 재고 문서 통합 관리 서비스', ['doc-merge']],
    ['케듀올', '법인별 홈페이지', ['corp-sites']],
    ['케듀올', 'DADOKe 전자책·오디오북 플랫폼', ['dadoke']],
  ])('%s · %s 가 %j 로 이어진다', (company, title, refs) => {
    expect(card(company, title).refs).toEqual(refs)
  })

  it('대응 노드가 없는 카드는 refs 를 두지 않는다', () => {
    // 노드를 만들면 gen-content.py 에서 refs 를 채우고 이 기대값을 바꾼다.
    expect(card('팜커넥트', '스마트팜 관리자 페이지').refs).toBeUndefined()
  })

  it('회사 이력에만 칩이 붙는다', () => {
    const withRefs = (CONTACT?.journey ?? [])
      .filter((step) => (step.projects ?? []).some((project) => project.refs?.length))
      .map((step) => step.title)

    expect(withRefs).toEqual(['모두가딜러', '팜커넥트', '케듀올'])
  })
})
