export type ArticleSource = {
  label: string
  url: string
}

type WorkflowStep = {
  label: string
  title: string
  detail?: string
  tone?: 'gate' | 'work' | 'check' | 'loop'
}

type ArticleTable = {
  caption: string
  headers: string[]
  rows: string[][]
  source?: ArticleSource
}

type ArticleSection = {
  eyebrow?: string
  title: string
  paragraphs: string[]
  bullets?: string[]
  quote?: string
  workflow?: {
    caption: string
    steps: WorkflowStep[]
    source?: ArticleSource
  }
  table?: ArticleTable
}

export type AIArticle = {
  deck: string
  sections: ArticleSection[]
  caveat?: string
  sources: ArticleSource[]
}

const harnessSource = {
  label: 'Requirement-Gated Python Harness README',
  url: 'https://github.com/blackstarzck/requirement-gated-python-harness',
}

const harnessFlowSource = {
  label: 'Harness Execution Flow',
  url: 'https://github.com/blackstarzck/requirement-gated-python-harness/blob/main/requirement-gated-python-harness/docs/harness/execution-flow.md',
}

const topikPipelineSource = {
  label: 'AI 개발·운영 승격 파이프라인 v3.1',
  url: 'https://github.com/blackstarzck/topik-project-v13/blob/main/docs/operations/ai-development-pipeline.md',
}

const topikPipelineReport = {
  label: '파이프라인 v3.1 구현 보고서',
  url: 'https://github.com/blackstarzck/topik-project-v13/blob/main/docs/qa/reports/2026-07-23-ai-development-pipeline-v3-1-implementation.md',
}

const topikHarnessSource = {
  label: 'TOPIK AI Admin Harness',
  url: 'https://github.com/blackstarzck/topik-ai/blob/main/docs/harness/index.md',
}

const promptDriftSource = {
  label: 'TOPIK Quest Prompt SOT Drift Root Cause',
  url: 'https://github.com/blackstarzck/sample-03/blob/main/docs/generation/topik-quest-prompt-sot-drift-root-cause-v001.md',
}

const storyboardSkillSource = {
  label: 'create-storybook SKILL',
  url: 'https://github.com/blackstarzck/sample-03/blob/main/.codex/skills/create-storybook/SKILL.md',
}

const themeSkillSource = {
  label: 'theme-clarification-fast-path SKILL',
  url: 'https://github.com/blackstarzck/v12/blob/main/.codex/skills/theme-clarification-fast-path/SKILL.md',
}

const aiSquadsSource = {
  label: 'AI-Sync OpenDev README',
  url: 'https://github.com/blackstarzck/ai-squads',
}

const profitpalPromptSource = {
  label: 'ProfitPal 에이전트 프롬프트 설계서',
  url: 'https://github.com/blackstarzck/profitpal/blob/main/docs/agent-prompt-design.md',
}

const profitpalArchitectureSource = {
  label: 'ProfitPal 시스템 아키텍처',
  url: 'https://github.com/blackstarzck/profitpal/blob/main/docs/system-architecture.md',
}

const designPolicySource = {
  label: 'Design Rule Canonicalization Policy',
  url: 'https://github.com/blackstarzck/madia-design-rule/blob/main/rulebook/canonicalization-policy.md',
}

const designPromptSource = {
  label: 'AI Prompt Rules',
  url: 'https://github.com/blackstarzck/madia-design-rule/blob/main/rulebook/ai-prompt-rules.md',
}

export const AI_ARTICLES: Record<string, AIArticle> = {
  'gate-harness': {
    deck: '긴 AI 작업에서 중요한 것은 한 번의 성공보다, 실패해도 기록을 잃지 않고 다시 이어갈 수 있는 구조라고 보았습니다. README의 실행 흐름을 포트폴리오 관점에서 다시 풀었습니다.',
    sections: [
      {
        eyebrow: '문제',
        title: 'AI가 규칙을 읽었다는 사실을 어떻게 확인할까',
        paragraphs: [
          '긴 작업에서는 에이전트가 요구사항을 건너뛰거나, 도구 실행이 실패한 뒤 어디까지 진행했는지 알 수 없는 일이 생깁니다. 단순한 안내문만으로는 이런 이탈을 막기 어렵습니다.',
          '그래서 요구사항 분석과 필수 문서 확인을 실제 실행 앞에 놓았습니다. 확인 기록이 없으면 파일 변경과 샌드박스 실행을 차단하고, 모든 도구 호출에는 추적 가능한 기록을 붙였습니다.',
        ],
        quote: '에이전트·도구·샌드박스는 교체할 수 있지만, 작업 장부는 사라지지 않아야 한다.',
      },
      {
        eyebrow: '워크플로우',
        title: '문서 확인부터 검증과 재시도까지',
        paragraphs: [
          '아래 흐름은 저장소 README의 Mermaid 다이어그램을 읽기 쉬운 단계로 재구성한 것입니다. 핵심은 실행 전 게이트와 실패 후 복구 경로가 모두 있다는 점입니다.',
        ],
        workflow: {
          caption: '요구사항 게이트 하네스의 대표 실행 흐름',
          source: harnessFlowSource,
          steps: [
            { label: '01', title: '요청과 요구사항 분석', detail: '한 작업을 식별하고 필요한 규칙을 먼저 찾습니다.', tone: 'work' },
            { label: '02', title: '필수 문서 확인', detail: '확인 기록이 없으면 변경 도구와 실행 환경을 차단합니다.', tone: 'gate' },
            { label: '03', title: '역할 실행', detail: '기획·구현·검토·수정 역할마다 별도 실행 기록을 남깁니다.', tone: 'work' },
            { label: '04', title: '도구와 변경 감사', detail: '호출·성공·실패·변경 파일을 같은 식별자로 연결합니다.', tone: 'check' },
            { label: '05', title: '검증과 품질 리뷰', detail: '브라우저 검증과 품질 판단을 완료 근거로 남깁니다.', tone: 'check' },
            { label: '06', title: '재시도 또는 완료', detail: '실패하면 새 실행으로 이어가고, 통과하면 같은 일을 반복하지 않습니다.', tone: 'loop' },
          ],
        },
      },
      {
        eyebrow: '판정 기준',
        title: '완료를 말하기 전에 확인하는 것',
        paragraphs: [
          '완료 여부는 에이전트의 문장이 아니라 사건의 순서로 판단합니다. 시작되지 않은 도구가 성공할 수 없고, 열린 도구 호출이 남아 있으면 작업을 닫을 수 없으며, 품질 검토보다 완료 기록이 먼저 나올 수도 없습니다.',
        ],
        table: {
          caption: '실행 계약에서 가져온 핵심 검사 규칙',
          headers: ['검사 대상', '통과 조건', '실패했을 때'],
          rows: [
            ['필수 문서', '현재 작업에서 확인 기록이 존재', '변경·실행 차단'],
            ['도구 호출', '시작과 성공 또는 실패가 한 쌍', '작업 완료 차단'],
            ['파일 변경', '책임 도구와 연결된 기록 존재', '감사 누락으로 판정'],
            ['검증', '브라우저·테스트 결과가 작업 기록과 연결', '수정 역할 또는 운영자 확인'],
            ['완료', '품질 검토가 먼저 끝남', '세션을 열린 상태로 유지'],
          ],
          source: harnessFlowSource,
        },
      },
    ],
    caveat: '이 저장소는 실험적 기반입니다. 로컬 프로세스 샌드박스는 보안용 가상 머신이 아니며, 감싼 도구 밖에서 실행되는 작업까지 강제하지는 못합니다.',
    sources: [harnessSource, harnessFlowSource],
  },

  'multi-agent': {
    deck: 'Codex와 Claude가 바뀌어도 같은 작업의 맥락과 검증 근거를 이어받도록 만든 개발 파이프라인입니다. “AI를 몇 개 썼는가”보다 “누가 어디에서 무엇을 이어받는가”를 설계했습니다.',
    sections: [
      {
        eyebrow: '분류',
        title: '모든 요청에 새 작업 공간이 필요한 것은 아니다',
        paragraphs: [
          '질문이나 코드 리뷰에는 별도 작업 공간을 만들지 않습니다. 작은 순차 작업은 하나의 공유 공간을 사용하고, 병렬·장기·위험 작업만 사용자 선택 후 격리합니다. 작업의 위험도에 비례해 비용을 쓰는 구조입니다.',
        ],
        table: {
          caption: '요청 종류에 따른 작업 공간 선택',
          headers: ['요청 종류', '사용 공간', '보호 규칙'],
          rows: [
            ['질문·조사·리뷰', '현재 작업 공간', '브랜치나 별도 폴더를 만들지 않음'],
            ['작은 순차 코드 작업', '공유 개발 공간', '한 번에 하나의 작업만 점유'],
            ['병렬·장기·고위험 작업', '격리된 작업 공간', '사용자 선택 뒤 생성'],
            ['이미 열려 있는 작업', '기존 공간을 이어서 사용', '폴더와 작업 이력을 임의 삭제하지 않음'],
          ],
          source: topikPipelineSource,
        },
      },
      {
        eyebrow: '워크플로우',
        title: '개발 작업과 운영 반영을 분리해 추적한다',
        paragraphs: [
          '저장소의 Mermaid 흐름은 개발 작업과 실제 운영 반영을 서로 다른 기록으로 관리합니다. 코드가 기본 브랜치에 들어갔다고 운영 배포가 자동으로 시작되지 않으며, 명시적인 승격 요청과 별도의 증거가 필요합니다.',
        ],
        workflow: {
          caption: 'AI 개발 파이프라인 v3.1의 축약 흐름',
          source: topikPipelineSource,
          steps: [
            { label: '01', title: '요청 분류', detail: '읽기·작은 코드·병렬 또는 위험 작업으로 나눕니다.', tone: 'work' },
            { label: '02', title: '공간 선택과 점유', detail: '공유 또는 격리 공간을 정하고 동시 수정을 막습니다.', tone: 'gate' },
            { label: '03', title: 'AI 간 인수인계', detail: '목표·결정·남은 일·검증·차단 요인을 같은 기록으로 넘깁니다.', tone: 'work' },
            { label: '04', title: '정확한 코드 검증', detail: '코드와 규칙이 같은 상태일 때만 성공 증거를 재사용합니다.', tone: 'check' },
            { label: '05', title: '병합 뒤 안전 정리', detail: '소유권이 불명확하거나 변경이 남으면 삭제하지 않습니다.', tone: 'check' },
            { label: '06', title: '별도 운영 승격', detail: '명시적인 요청과 외부 증거가 있을 때만 운영으로 이동합니다.', tone: 'gate' },
          ],
        },
      },
      {
        eyebrow: '핵심 설계',
        title: '도구가 아니라 작업이 주인이다',
        paragraphs: [
          '브랜치 이름과 작업 기록에 특정 AI 도구의 소유권을 넣지 않았습니다. Codex가 시작한 일을 Claude가 이어받더라도 작업의 목표와 현재 코드 상태가 같으면 같은 작업으로 취급합니다.',
          '검증 결과도 단순히 “전에 통과했다”로 재사용하지 않습니다. 현재 코드, 기준 코드, 검증 규칙이 모두 같은 경우에만 이전 성공을 근거로 인정합니다.',
        ],
      },
    ],
    caveat: '실제 GitHub 병합, 데이터베이스 증거 수집, Vercel 운영 배포를 수행하는 신뢰 실행기는 구현 보고서 시점에 미완성이었습니다. 통합 검증도 10분 예산을 넘겨 당시에는 병합 준비 완료로 판정하지 않았습니다.',
    sources: [topikPipelineSource, topikPipelineReport],
  },

  'verify-loop': {
    deck: 'TOPIK 관리자 서비스에서는 문서를 읽으라는 안내만 두지 않고, 문서·라우트·데이터 경계·화면 흐름이 실제로 맞는지를 반복 검사하는 하네스로 옮겼습니다.',
    sections: [
      {
        eyebrow: '적용',
        title: 'README가 아니라 저장소 전체를 작업 환경으로 본다',
        paragraphs: [
          '짧은 작업 지침은 진입점만 담당하고, 상세 기준은 프로젝트 문서가 맡습니다. 문서 링크가 실제로 존재하는지, 새 화면에 설명 문서가 있는지, 데이터 경계가 무너지지 않았는지는 별도 검사로 확인합니다.',
        ],
        workflow: {
          caption: 'TOPIK AI Admin 하네스의 반복 검증 흐름',
          source: topikHarnessSource,
          steps: [
            { label: '01', title: '문서에서 기준 확인', detail: '구조·데이터·페이지 정책의 단일 기준을 먼저 읽습니다.', tone: 'work' },
            { label: '02', title: '변경 종류 분류', detail: '문서·앱·DB 조합을 분류하고 알 수 없는 변경은 차단합니다.', tone: 'gate' },
            { label: '03', title: '구조와 코드 검사', detail: '문서 연결, 화면 경로, 데이터 경계, 중복, 타입을 확인합니다.', tone: 'check' },
            { label: '04', title: '대표 화면 흐름 확인', detail: '목록→상세→조치→감사 기록 같은 운영 패턴을 재현합니다.', tone: 'check' },
            { label: '05', title: '문서와 기준 보강', detail: '실패가 반복되면 코드뿐 아니라 하네스 규칙도 함께 고칩니다.', tone: 'loop' },
          ],
        },
      },
      {
        eyebrow: '검증표',
        title: '변경 위험에 따라 확인 범위를 달리한다',
        paragraphs: [
          '작은 문서 수정과 데이터베이스 변경에 같은 검증 비용을 쓰지 않습니다. 영향 범위가 커질수록 빌드, 대표 화면 확인, 별도 데이터베이스 계약 검사를 추가합니다.',
        ],
        table: {
          caption: '저장소 문서를 바탕으로 정리한 변경별 검증 범위',
          headers: ['변경 범위', '기본 검사', '추가 확인'],
          rows: [
            ['문서 중심', '문서 연결·인덱스·가벼운 품질 검사', '관련 정책 문서 동시 갱신'],
            ['앱 화면', '정적 검사·타입·중복·빌드', '대표 운영 흐름 화면 검사'],
            ['데이터베이스', '앱 검사와 마이그레이션 계약', '분리된 테스트 DB에서 권한·호출 확인'],
            ['앱과 DB 동시 변경', '전체 품질·빌드·데이터 계약', '전체 대표 흐름과 경계 검사'],
            ['알 수 없는 경로', '분류 실패', '안전하게 차단하고 정책 보강'],
          ],
          source: topikHarnessSource,
        },
      },
      {
        eyebrow: '배운 점',
        title: '실패를 코드 문제로만 보지 않는다',
        paragraphs: [
          '같은 종류의 문제가 반복되면 해당 작업을 설명하는 문서, 검사 규칙, 대표 화면 시나리오 중 무엇이 비어 있는지 함께 확인합니다. 이 루프가 쌓일수록 다음 에이전트는 더 좁고 정확한 범위에서 일할 수 있습니다.',
        ],
      },
    ],
    caveat: '하네스는 이미 정의된 규칙의 이탈을 잘 찾지만, 아직 문서화하지 못한 사용자 문제까지 자동으로 발견해 주지는 않습니다. 새로운 실패를 규칙으로 다시 환원하는 작업은 계속 필요합니다.',
    sources: [topikHarnessSource],
  },

  'my-skills': {
    deck: 'SKILL은 긴 프롬프트 모음이 아니라, 특정 요청이 들어왔을 때 무엇을 먼저 확인하고 어디까지 읽고 어떻게 검증할지를 묶은 재사용 절차입니다.',
    sections: [
      {
        eyebrow: '사례',
        title: '테마 변경 요청을 바로 구현하지 않는 빠른 절차',
        paragraphs: [
          '“테마를 바꿔 달라”는 요청은 전체 화면인지 한 컴포넌트인지, 밝은 화면과 어두운 화면 중 어디인지에 따라 결과가 크게 달라집니다. 이 SKILL은 넓게 파일을 읽기 전에 다섯 가지 질문으로 변경 경계를 먼저 확정합니다.',
        ],
        table: {
          caption: 'SKILL이 먼저 확정하는 작업 경계',
          headers: ['확인 항목', '확인하는 이유'],
          rows: [
            ['범위', '전체 앱인지 특정 화면인지 결정'],
            ['대상', '어떤 컴포넌트와 상태를 바꾸는지 결정'],
            ['표현 모드', '밝은 화면·어두운 화면·둘 다인지 결정'],
            ['적용 위치', '전역 규칙·컴포넌트 규칙·지역 예외 중 선택'],
            ['보호선', '바뀌면 안 되는 주변 화면을 명시'],
          ],
          source: themeSkillSource,
        },
      },
      {
        eyebrow: '워크플로우',
        title: '발동 조건부터 검증까지 하나의 도구로 묶는다',
        paragraphs: [
          '좋은 SKILL은 언제 써야 하는지부터 끝났다고 판단하는 방법까지 포함합니다. 읽을 자료를 일부러 좁혀, 에이전트가 관련 없는 파일을 탐색하며 맥락을 낭비하지 않게 합니다.',
        ],
        workflow: {
          caption: 'theme-clarification-fast-path의 실행 구조',
          source: themeSkillSource,
          steps: [
            { label: '01', title: '발동 조건 감지', detail: '테마·토큰·외형 변경 요청인지 확인합니다.', tone: 'work' },
            { label: '02', title: '작업 경계 질문', detail: '다섯 항목으로 변경 범위와 보호선을 고정합니다.', tone: 'gate' },
            { label: '03', title: '최소 자료만 읽기', detail: '첫 단계에서는 지정된 문서와 설정만 확인합니다.', tone: 'work' },
            { label: '04', title: '필요할 때만 확장', detail: '지역 예외나 검증 실패가 있을 때 화면 코드까지 넓힙니다.', tone: 'loop' },
            { label: '05', title: '범위 누출 검증', detail: '요청한 곳만 바뀌고 주변에 번지지 않았는지 확인합니다.', tone: 'check' },
          ],
        },
      },
      {
        eyebrow: '포트폴리오 관점',
        title: '반복되는 판단을 개인의 기억에서 꺼낸다',
        paragraphs: [
          '한 번 잘한 작업보다 같은 품질로 다시 수행할 수 있는 절차를 만드는 데 의미가 있습니다. 영상 스토리보드 작업에서도 화면 비율, 샷 수, 카메라 각도, 오디오 정책을 별도 SKILL로 묶어 반복 사용했습니다.',
        ],
      },
    ],
    caveat: '저장소 안의 모든 SKILL을 직접 만든 것으로 표현하지 않습니다. 여기서는 직접 작성한 테마 변경 절차와 스토리보드 절차를 대표 사례로 다룹니다.',
    sources: [themeSkillSource, storyboardSkillSource],
  },

  'ai-squads': {
    deck: '멀티 에이전트를 두 방향으로 실험했습니다. 하나는 비개발자가 역할별 에이전트의 진행을 보는 비주얼 IDE이고, 다른 하나는 여러 전문가의 이견을 보존하는 의사결정 위원회입니다.',
    sections: [
      {
        eyebrow: '프로토타입',
        title: '비개발자가 작업 흐름을 볼 수 있는 에이전트 IDE',
        paragraphs: [
          'AI-Sync OpenDev는 사용자의 자연어 요청을 PM이 분해하고, 설계·개발·QA 역할로 전달하는 흐름을 화면에 보여주는 초기 프로토타입입니다. QA가 실패를 돌려보내면 개발 단계로 되돌아가는 구조를 목표로 했습니다.',
        ],
        workflow: {
          caption: 'README 역할표를 기반으로 재구성한 개발 흐름',
          source: aiSquadsSource,
          steps: [
            { label: 'PM', title: '요구사항 분석', detail: '작업을 나누고 다음 역할에 전달합니다.', tone: 'work' },
            { label: 'ARCH', title: '구조 설계', detail: '서비스의 노드와 의존 관계를 정리합니다.', tone: 'work' },
            { label: 'CODE', title: '구현', detail: '설계를 실제 변경으로 옮깁니다.', tone: 'work' },
            { label: 'QA', title: '검증', detail: '통과하면 완료하고 실패하면 구현으로 되돌립니다.', tone: 'loop' },
          ],
        },
      },
      {
        eyebrow: '다른 실험',
        title: '의견이 갈릴 때 다시 묻는 AI 위원회',
        paragraphs: [
          'ProfitPal에서는 차트·뉴스·수급 분석을 동시에 실행하고, 의견이 갈리면 서로의 근거를 본 뒤 한 번 더 판단하게 했습니다. 최종 역할은 다수 의견만 남기지 않고 채택되지 않은 의견도 함께 기록합니다.',
        ],
        workflow: {
          caption: 'ProfitPal 프롬프트 설계서의 토론 순서',
          source: profitpalPromptSource,
          steps: [
            { label: '01', title: '공통 상황 전달', detail: '세 분석가가 같은 입력 자료를 받습니다.', tone: 'work' },
            { label: '02', title: '병렬 분석', detail: '차트·뉴스·수급을 서로 독립적으로 판단합니다.', tone: 'work' },
            { label: '03', title: '이견 감지', detail: '의견이 갈리면 다른 근거를 보고 재평가합니다.', tone: 'loop' },
            { label: '04', title: '의장 종합', detail: '최종안과 소수 의견을 구조화된 결과로 남깁니다.', tone: 'check' },
            { label: '05', title: '안전한 실패 처리', detail: '호출이 실패하면 확신도 0과 관망으로 처리합니다.', tone: 'gate' },
          ],
        },
        table: {
          caption: '멀티 에이전트 역할과 산출물',
          headers: ['역할', '독립적으로 보는 것', '남기는 결과'],
          rows: [
            ['차트 분석', '가격·거래량·기술 지표', '행동·확신도·핵심 근거'],
            ['뉴스 분석', '뉴스의 방향·영향·신뢰도', '행동·확신도·핵심 근거'],
            ['수급 분석', '대규모 자금 이동과 거래소 흐름', '행동·확신도·핵심 근거'],
            ['의장', '모든 의견과 반대 근거', '최종안·위험 범위·소수 의견'],
          ],
          source: profitpalPromptSource,
        },
      },
      {
        eyebrow: '핵심',
        title: '에이전트 수보다 독립성과 합의 규칙이 중요하다',
        paragraphs: [
          '같은 프롬프트를 여러 번 실행하는 것은 멀티 에이전트 구조가 아닙니다. 각 역할이 다른 질문을 받고, 결과 형식이 정해져 있으며, 충돌을 발견하고 종합하는 별도 단계가 있어야 합니다.',
        ],
      },
    ],
    caveat: 'AI-Sync OpenDev는 초기 프로토타입이며 현재 일부 분기는 단순한 규칙에 의존합니다. ProfitPal 역시 투자 성과를 보장하는 제품이 아니라 역할 분리와 토론 구조를 검증한 실험입니다.',
    sources: [aiSquadsSource, profitpalPromptSource, profitpalArchitectureSource],
  },

  'video-agent': {
    deck: 'AI 영상 제작에서 반복되는 실패를 “모델이 말을 안 들었다”로 끝내지 않고, 실제 생성 입력이 작업 규칙에서 언제 벗어났는지 감사했습니다.',
    sections: [
      {
        eyebrow: '발견',
        title: '검토 에이전트가 실행됐지만 규칙은 강제되지 않았다',
        paragraphs: [
          '기획 문서에는 샷 번호, 고정 자산, 시작과 끝 장면, 동작 순서, 카메라, 물리 규칙 같은 필수 항목이 있었습니다. 하지만 실제 생성 도구에 전달된 프롬프트 대부분은 긴 영화식 문장으로 바뀌어 있었습니다.',
          '별도 검토 역할은 이야기와 연속성을 확인했지만 필수 항목의 존재 여부를 실패 조건으로 삼지 않았습니다. 그래서 “검토가 실행됨”과 “규칙이 지켜짐”이 같은 의미처럼 취급되었습니다.',
        ],
        quote: '리뷰가 존재하는 것과 계약이 실제로 강제되는 것은 다르다.',
      },
      {
        eyebrow: '전후 비교',
        title: '좋은 문장을 고치는 대신 입력 계약을 고쳤다',
        paragraphs: [
          '눈에 보이는 영상 오류만 고치면 다음 샷에서 비슷한 문제가 반복됩니다. 그래서 프롬프트 작성 단계와 생성 직전 검사를 분리했습니다.',
        ],
        table: {
          caption: '프롬프트 감사 전후의 작업 방식',
          headers: ['구분', '이전', '개선 후'],
          rows: [
            ['프롬프트 형식', '긴 영화식 설명 중심', '필수 항목이 분리된 실행 계약'],
            ['검토 기준', '이야기·장면 품질 중심', '품질과 필수 구조를 각각 검사'],
            ['생성 전 차단', '검토자의 판단에 의존', '필수 항목 누락 시 검사기가 중단'],
            ['반복 수정', '보이는 실패를 여러 항목 동시에 수정', '원인 변수를 하나씩 바꿔 재검증'],
            ['기록', '규칙 준수와 결과 품질이 섞임', '프롬프트·자산·결과 품질을 분리 기록'],
          ],
          source: promptDriftSource,
        },
      },
      {
        eyebrow: '워크플로우',
        title: '한 샷을 통과시킨 뒤 다음 샷으로 이동한다',
        paragraphs: [
          '캐릭터와 소품을 먼저 고정하고, 샷의 시작·행동·물리 결과·끝 장면을 구조화합니다. 생성 전 검사와 독립 검토를 모두 통과해야 실제 생성으로 넘어갑니다.',
        ],
        workflow: {
          caption: '검사 가능한 AI 영상 제작 루프',
          source: promptDriftSource,
          steps: [
            { label: '01', title: '자산과 장면 고정', detail: '인물·소품·배경의 우선순위와 연속성을 정합니다.', tone: 'work' },
            { label: '02', title: '구조화된 샷 작성', detail: '시작·동작·카메라·물리 결과·끝·금지 조건을 나눕니다.', tone: 'work' },
            { label: '03', title: '형식 사전 검사', detail: '필수 항목이 빠졌거나 기존 형식이면 생성을 막습니다.', tone: 'gate' },
            { label: '04', title: '독립 리뷰', detail: '이야기·자산·연속성·실패 기준을 다시 봅니다.', tone: 'check' },
            { label: '05', title: '생성과 증거 기록', detail: '사용한 입력과 나온 결과를 같은 샷 기록에 남깁니다.', tone: 'check' },
            { label: '06', title: '한 변수만 수정', detail: '실패 원인을 분류해 하나만 바꾸고 다시 검사합니다.', tone: 'loop' },
          ],
        },
      },
    ],
    caveat: '이 사례의 강점은 처음부터 완벽했다는 데 있지 않습니다. 규칙이 문서에만 있고 실행 입력에는 없었던 실패를 수치로 확인하고, 이후 작업을 하드 게이트로 바꾼 과정에 있습니다.',
    sources: [promptDriftSource, storyboardSkillSource],
  },

  'design-rulebook': {
    deck: '“세련되게 만들어 줘” 같은 추상적인 요청을, AI가 확인할 수 있는 디자인 제약과 반복 가능한 규칙 정리 절차로 바꾸는 실험입니다.',
    sections: [
      {
        eyebrow: '문제',
        title: '좋은 디자인이라는 말은 실행 기준이 되기 어렵다',
        paragraphs: [
          'AI는 추상적인 표현에도 그럴듯한 화면을 만들지만, 왜 통과하거나 실패했는지 설명하기 어렵습니다. 그래서 디자인 리뷰에서 반복되는 판단을 간격·대비·정렬·상태 같은 확인 가능한 문장으로 바꾸었습니다.',
        ],
        table: {
          caption: '추상적인 요청을 검사 가능한 규칙으로 바꾸는 방식',
          headers: ['추상 표현', '규칙으로 바꾼 질문'],
          rows: [
            ['깔끔하게', '같은 성격의 요소가 같은 간격 체계를 쓰는가'],
            ['강조해 줘', '한 화면의 최우선 행동이 하나로 보이는가'],
            ['일관되게', '같은 역할의 요소가 색·크기·상태 규칙을 공유하는가'],
            ['접근성 있게', '색 외에도 텍스트와 형태로 상태를 구분하는가'],
          ],
          source: designPromptSource,
        },
      },
      {
        eyebrow: '루프',
        title: '새 규칙을 바로 추가하지 않고 먼저 합친다',
        paragraphs: [
          '새로운 관찰을 발견할 때마다 규칙을 덧붙이면 같은 의미의 문장이 늘어납니다. 기존 규칙과 정규화하고, 비슷한 항목을 묶고, 대표 문장을 고른 뒤 적용 맥락을 붙이는 순서로 관리합니다.',
        ],
        workflow: {
          caption: '디자인 규칙 정제 흐름',
          source: designPolicySource,
          steps: [
            { label: '01', title: '관찰 수집', detail: '리뷰에서 반복되는 판단을 문장으로 모읍니다.', tone: 'work' },
            { label: '02', title: '표현 정규화', detail: '같은 뜻을 가진 표현의 기준어를 맞춥니다.', tone: 'work' },
            { label: '03', title: '유사 규칙 묶기', detail: '중복과 충돌을 확인해 하나의 그룹으로 만듭니다.', tone: 'check' },
            { label: '04', title: '대표 규칙 선택', detail: 'AI가 실행하고 사람이 검토할 수 있는 문장으로 정리합니다.', tone: 'gate' },
            { label: '05', title: '작업에서 재검증', detail: '실제 결과를 보고 규칙을 다시 수정합니다.', tone: 'loop' },
          ],
        },
      },
    ],
    caveat: '현재 룰북에는 중복 규칙과 비어 있는 항목이 남아 있어 완성된 디자인 시스템보다는 진행 중인 방법론 실험으로 소개합니다.',
    sources: [designPolicySource, designPromptSource],
  },
}
