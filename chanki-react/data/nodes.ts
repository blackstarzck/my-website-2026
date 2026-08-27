// 김찬기 포트폴리오 콘텐츠.
// 생성: tools/gen-content.py (이력서 + GitHub 저장소 기반)
import type { ContentNode } from './types'

export const NODES: ContentNode[] = [
  {
    "id": "chanki",
    "name": "김찬기",
    "region": "entry",
    "kicker": "시작점",
    "sum": "퍼블리싱에서 시작해 프론트엔드를 지나 서버까지, 화면 뒤의 흐름을 이해하려고 계속 범위를 넓혀온 5년 9개월입니다.",
    "body": "영어영문학을 전공하고 관광통역안내사로 일하다 개발로 넘어왔습니다. HTML·CSS·JavaScript 퍼블리싱에서 출발해 React·Angular·TypeScript 프론트엔드를 거쳐 NestJS·MySQL 서버 개발까지 경험했습니다. 화면만 만드는 것이 아니라 데이터가 전달되고 처리되는 전체 흐름을 이해하려 노력합니다. 기획자와 디자이너가 없는 환경에서도 기획·디자인·개발을 주도적으로 수행해 왔고, 최근에는 멀티 에이전트와 게이트 하네스로 AI를 개발 프로세스에 편입시키고 있습니다.",
    "cap": "김찬기 · 프론트엔드 개발자",
    "x": 0.0,
    "y": 0.23,
    "r": 1.55
  },
  {
    "id": "contact",
    "name": "연락",
    "region": "entry",
    "kicker": "닿는 곳",
    "sum": "이력서와 GitHub, 기술 블로그. 그리고 메일.",
    "body": "제안이나 문의는 메일로 주시면 가장 빠릅니다. 작업물은 GitHub에, 배우고 정리한 것들은 기술 블로그에 남기고 있습니다.",
    "cap": "연락처",
    "links": [
      [
        "blackstarzck@naver.com",
        "mailto:blackstarzck@naver.com"
      ],
      [
        "GitHub",
        "https://github.com/blackstarzck"
      ],
      [
        "기술 블로그",
        "https://chan-chan2.tistory.com/"
      ]
    ],
    "x": 0.0,
    "y": 2.05,
    "r": 0.72
  },
  {
    "id": "frontend",
    "name": "프론트엔드",
    "region": "frontend",
    "kicker": "핵심 영역",
    "body": "5년 9개월의 중심 축입니다. jQuery와 Ajax로 시작해 React와 Angular, TypeScript, 최근에는 Next.js까지 다뤘습니다. 관리자 도구처럼 매일 쓰는 화면일수록 작은 마찰이 누적된다고 보고, 반복 입력·일괄 적용·미리보기 같은 기능으로 운영 시간을 줄이는 데 관심이 많습니다.",
    "cap": "프론트엔드",
    "x": -2.07,
    "y": 3.88,
    "r": 1.42
  },
  {
    "id": "topik-user",
    "name": "도토리 토픽 · 사용자단",
    "region": "frontend",
    "kicker": "케듀올 · 2026",
    "sum": "AI 피드백이 붙은 TOPIK 쓰기 학습 서비스의 사용자 화면을 설계하고 만들었습니다.",
    "body": "AI 기반 TOPIK 학습 서비스에서 사용자단을 담당했습니다. 쓰기 문제 풀이와 AI 피드백, 추천, 학습 이력, 내 서재를 다국어 UI로 제공합니다. 학습 흐름 자체를 설계하는 일이라 화면 순서와 상태 전이를 먼저 정리한 뒤 구현에 들어갔습니다.",
    "cap": "도토리 토픽 사용자단",
    "project": {
      "role": "사용자단 프론트엔드 설계·개발",
      "duration": "2026.03 - 2026.08",
      "impact": "쓰기 연습부터 피드백까지 한 흐름으로 이어지는 학습 경험을 구현했습니다.",
      "scope": "Next.js·React·TypeScript 기반 반응형 웹. 학습 흐름 설계, 다국어 UI, 사용자단·관리자단 공통 데이터 계약 설계에 참여했습니다.",
      "objectives": [
        "TOPIK 쓰기 문제 풀이와 AI 피드백 흐름 구현",
        "추천·학습 이력·내 서재로 이어지는 재방문 동선 설계",
        "다국어 사용자 경험 제공"
      ],
      "skills": [
        [
          "Next.js",
          "grew"
        ],
        [
          "React · TypeScript",
          "core"
        ],
        [
          "다국어 UI",
          "first"
        ],
        [
          "Supabase 데이터 계약",
          "grew"
        ]
      ]
    },
    "x": 1.23,
    "y": 6.33,
    "r": 0.62
  },
  {
    "id": "topik-admin",
    "name": "도토리 토픽 · 관리자단",
    "region": "frontend",
    "kicker": "케듀올 · 2026",
    "sum": "사용자·기관·문항은행·학습 분석·권한을 한곳에서 관리하는 운영 화면입니다.",
    "body": "같은 서비스의 관리자단을 사용자단과 분리해 개발했습니다. 사용자·기관·문항·콘텐츠·학습 분석·알림·커머스·권한을 통합 관리합니다. 운영자가 쓰는 화면이라 데이터 밀도가 높고, 권한 경계를 잘못 그리면 바로 사고가 되기 때문에 경계를 문서로 남기는 데 신경 썼습니다.",
    "cap": "도토리 토픽 관리자단",
    "project": {
      "role": "관리자단 운영 화면·데이터 관리 기능 설계·개발",
      "duration": "2026.03 - 2026.08",
      "impact": "흩어져 있던 운영 업무를 하나의 관리자단으로 모았습니다.",
      "scope": "Vite·React·TypeScript·Ant Design 기반. Supabase 인증과 RLS/RPC, DB 마이그레이션 설계에 참여했습니다.",
      "objectives": [
        "사용자·기관·문항은행·콘텐츠 통합 관리",
        "학습 분석·알림·커머스·권한 관리 기능 구현",
        "사용자단과의 권한 경계를 문서화"
      ],
      "skills": [
        [
          "Ant Design",
          "grew"
        ],
        [
          "Vite",
          "grew"
        ],
        [
          "Supabase RLS/RPC",
          "first"
        ],
        [
          "React · TypeScript",
          "core"
        ]
      ]
    },
    "x": -0.24,
    "y": 7.0,
    "r": 0.72
  },
  {
    "id": "farm-3d",
    "name": "센서 3D 시각화 대시보드",
    "region": "frontend",
    "kicker": "팜커넥트 · 2024",
    "sum": "30개가 넘는 센서의 온·습도를 3D로 띄워, 농장주가 온실 상태를 한눈에 보게 했습니다.",
    "body": "숫자 표로는 온실 안에서 어디가 문제인지 알기 어렵다는 게 출발점이었습니다. 30개 이상 센서의 온·습도 데이터를 3D 공간에 배치해 위치와 값을 함께 보여주고, AI 권장값과 실시간 값을 나란히 비교할 수 있게 했습니다. 화면과 API를 함께 구현했습니다.",
    "cap": "센서 데이터 3D 대시보드",
    "project": {
      "role": "대시보드 화면·API 개발",
      "duration": "2024.03 - 2024.07",
      "impact": "복잡한 환경 정보를 공간 위에 올려 직관적으로 파악할 수 있게 했습니다.",
      "scope": "Angular·NestJS·TypeScript 기반. amCharts, RxJS, MySQL로 데이터 흐름과 시각화를 구현했습니다.",
      "objectives": [
        "30개 이상 센서의 온·습도를 3D로 시각화",
        "AI 권장값과 실시간 환경 데이터를 비교하는 UI 설계"
      ],
      "skills": [
        [
          "Angular",
          "grew"
        ],
        [
          "amCharts · 3D 시각화",
          "first"
        ],
        [
          "RxJS",
          "first"
        ],
        [
          "NestJS",
          "grew"
        ]
      ]
    },
    "x": -1.67,
    "y": 6.23,
    "r": 0.82
  },
  {
    "id": "connect-bee",
    "name": "CONNECT BEE",
    "region": "frontend",
    "kicker": "팜커넥트",
    "sum": "수정벌 벌통의 센서 값을 보고 팬·열선·쿨러까지 한 화면에서 제어하는 하이브리드 앱입니다.",
    "body": "수정벌 활동량과 벌통 센서 데이터를 확인하는 하이브리드 앱과 웹뷰를 개발했습니다. 내·외부 온도, 습도, CO2를 시각화하고 팬·열선·쿨러 제어 UI를 같은 화면에 두어, 상태 확인과 조치 사이를 오가지 않아도 되게 했습니다.",
    "cap": "CONNECT BEE 하이브리드 앱",
    "project": {
      "role": "하이브리드 앱·웹뷰 화면 및 API 개발 참여",
      "impact": "모니터링과 하드웨어 제어를 한 화면으로 합쳐 사용자 흐름을 줄였습니다.",
      "scope": "Angular·NestJS·TypeScript 기반 하이브리드 앱.",
      "skills": [
        [
          "하이브리드 앱 · 웹뷰",
          "first"
        ],
        [
          "Angular",
          "grew"
        ],
        [
          "하드웨어 제어 UI",
          "first"
        ]
      ]
    },
    "x": -3.29,
    "y": 6.18,
    "r": 0.62
  },
  {
    "id": "corp-sites",
    "name": "법인별 홈페이지",
    "region": "frontend",
    "kicker": "케듀올 · 2025",
    "sum": "기획과 디자인부터 퍼블리싱, 배포까지 혼자 진행한 반응형 사이트입니다.",
    "body": "Figma로 기획과 디자인을 직접 하고 React와 Tailwind로 퍼블리싱한 뒤 FTP로 배포까지 맡았습니다. 공통 UI 가이드와 컴포넌트 구조를 먼저 잡아 이후 법인이 추가될 때 재사용할 수 있게 했습니다.",
    "cap": "법인 홈페이지",
    "project": {
      "role": "기획·디자인·퍼블리싱·배포 1인 수행",
      "duration": "2025.05 - 2025.06",
      "impact": "디자이너 없이 기획부터 배포까지 완주했습니다.",
      "scope": "Figma 기획·디자인, React 18·Tailwind CSS 4·styled-components·GSAP 퍼블리싱, FTP 배포 운영.",
      "skills": [
        [
          "Figma 기획 · 디자인",
          "grew"
        ],
        [
          "Tailwind CSS",
          "grew"
        ],
        [
          "GSAP",
          "grew"
        ],
        [
          "배포 운영",
          "first"
        ]
      ]
    },
    "x": -4.23,
    "y": 4.87,
    "r": 0.72
  },
  {
    "id": "dealer-web",
    "name": "모두가딜러 · 웹서비스",
    "region": "frontend",
    "kicker": "모두가딜러 · 2020–2022",
    "sum": "중고차 서비스의 반응형 웹과 신규 콘텐츠를 만들며 퍼블리싱에서 프론트엔드로 넘어왔습니다.",
    "body": "첫 직장이자 기본기를 만든 곳입니다. 반응형 웹·앱 UI를 구현하고 신규 콘텐츠 페이지를 개발했습니다. MySQL과 PHP로 차량 정보를 조회·가공해 노출하는 기능을 다뤘고, jQuery와 Ajax, async/await로 동적 콘텐츠와 인터랙션을 구현했습니다. Swiper.js와 GSAP을 도입해 기간을 줄이면서 표현 품질을 올렸습니다.",
    "cap": "모두가딜러 반응형 웹",
    "project": {
      "role": "반응형 웹 UI 구현 및 신규 콘텐츠 개발",
      "duration": "2020.06 - 2022.05",
      "impact": "쿠키 기반 개인화와 Skeleton UI로 체감 속도와 운영 편의성을 함께 개선했습니다.",
      "scope": "HTML·CSS·JavaScript·jQuery·Ajax, MySQL·PHP 데이터 조회, Swiper.js·GSAP·SmartEditor 도입.",
      "skills": [
        [
          "JavaScript · jQuery",
          "core"
        ],
        [
          "Ajax · async/await",
          "grew"
        ],
        [
          "GSAP · Swiper.js",
          "first"
        ],
        [
          "MySQL · PHP",
          "first"
        ]
      ]
    },
    "x": -5.66,
    "y": 4.11,
    "r": 0.82
  },
  {
    "id": "dealer-admin",
    "name": "모두가딜러 · 관리자",
    "region": "frontend",
    "kicker": "모두가딜러 · 2020–2022",
    "sum": "반복 입력이 많던 관리자 화면에 일괄 적용과 미리보기를 넣어 운영 시간을 줄였습니다.",
    "body": "다양한 프로모션 유형을 카테고리로 묶고 조건별로 입력 필드를 노출·숨김 처리해 관리자 사용성을 개선했습니다. 반복 입력이 많은 차량 데이터 화면에는 일괄 적용을 추가했고, 게시 전 스타일을 확인할 수 있는 미리보기 UI를 제공해 검수 정확도를 높였습니다.",
    "cap": "관리자 페이지 개선",
    "project": {
      "role": "관리자 페이지 UI 개선 및 운영 효율화",
      "duration": "2020.06 - 2022.05",
      "impact": "반복 입력과 검수에 쓰이던 운영 시간을 줄였습니다.",
      "objectives": [
        "프로모션 유형 카테고리화와 조건부 입력 필드 UI 설계",
        "차량 데이터 일괄 적용 기능 추가",
        "게시 전 미리보기 UI 제공"
      ],
      "skills": [
        [
          "관리자 UX",
          "grew"
        ],
        [
          "JavaScript",
          "core"
        ]
      ]
    },
    "x": -5.94,
    "y": 2.52,
    "r": 0.62
  },
  {
    "id": "backend",
    "name": "서버 · 데이터",
    "region": "backend",
    "kicker": "확장 중인 영역",
    "body": "프론트엔드만으로는 데이터가 왜 그 모양으로 오는지 설명할 수 없다는 게 계기였습니다. NestJS와 TypeORM으로 API를 만들고, MySQL과 PostgreSQL로 스키마를 설계했습니다. 최근에는 Supabase의 RLS와 RPC로 권한을 DB 레벨에서 다루는 경험을 했습니다.",
    "cap": "서버 · 데이터",
    "x": 4.5,
    "y": -0.96,
    "r": 1.22
  },
  {
    "id": "doc-merge",
    "name": "문서 통합 관리 서비스",
    "region": "backend",
    "kicker": "케듀올 · 2025",
    "sum": "같은 내용을 여러 엑셀에 반복 입력하던 업무를, 기획부터 서버까지 혼자 만들어 한 시스템으로 합쳤습니다.",
    "body": "도서 납품과 관련된 여러 종류의 문서를 한 번에 관리하고 자동 처리하는 웹서비스입니다. 기존에는 서로 다른 엑셀과 문서에 같은 정보를 반복 입력해야 했습니다. 이 문제를 기획 단계부터 정의하고 프론트엔드와 백엔드를 모두 직접 만들어 해결했습니다. 실제 업무의 불편을 제품으로 바꾼 경험이라 가장 애착이 갑니다.",
    "cap": "문서 통합 관리 서비스",
    "project": {
      "role": "기획부터 프론트엔드·백엔드까지 전 과정 1인 개발",
      "duration": "2025.02 - 2025.07",
      "impact": "반복 입력과 그로 인한 입력 오류를 줄여 업무 시간을 단축했습니다.",
      "scope": "React 18·Vite 6·TypeScript 프론트엔드, Redux Toolkit·SWR 상태 관리, NestJS·TypeORM·PostgreSQL API·DB 설계.",
      "objectives": [
        "흩어진 문서 양식을 하나의 시스템으로 통합",
        "대용량 데이터 테이블과 고급 필터·정렬 제공",
        "문서 병합과 엑셀 처리를 자동화"
      ],
      "impacts": [
        "여러 문서에 같은 정보를 반복 입력하던 과정을 제거",
        "입력 오류 감소",
        "Ant Design·Tailwind·styled-components로 관리용 UI/UX 구축"
      ],
      "skills": [
        [
          "NestJS · TypeORM",
          "first"
        ],
        [
          "PostgreSQL",
          "first"
        ],
        [
          "Redux Toolkit · SWR",
          "grew"
        ],
        [
          "AG Grid",
          "first"
        ],
        [
          "ExcelJS",
          "first"
        ],
        [
          "React · TypeScript",
          "core"
        ]
      ]
    },
    "x": 4.86,
    "y": -4.54,
    "r": 0.62
  },
  {
    "id": "supabase",
    "name": "Supabase 인증 · RLS",
    "region": "backend",
    "kicker": "케듀올 · 2026",
    "sum": "권한을 애플리케이션이 아니라 DB 레벨에서 다루는 방식을 처음 적용했습니다.",
    "body": "도토리 토픽에서 Supabase 기반 인증과 RLS(Row Level Security), RPC, DB 마이그레이션을 설계했습니다. 사용자단과 관리자단이 같은 DB를 쓰기 때문에 권한 경계를 어디에 둘지가 핵심이었고, 애플리케이션 코드가 아니라 DB 정책으로 막는 쪽을 택했습니다.",
    "cap": "Supabase 인증 · 권한",
    "project": {
      "role": "인증·RLS/RPC·마이그레이션 설계",
      "impact": "사용자단과 관리자단이 공유하는 데이터의 권한 경계를 DB 레벨에서 강제했습니다.",
      "skills": [
        [
          "Supabase",
          "first"
        ],
        [
          "RLS · RPC",
          "first"
        ],
        [
          "DB 마이그레이션",
          "grew"
        ]
      ]
    },
    "x": 7.04,
    "y": -1.5,
    "r": 0.72
  },
  {
    "id": "farm-api",
    "name": "스마트팜 관리자 · API",
    "region": "backend",
    "kicker": "팜커넥트",
    "sum": "농장·센서 정보를 관리하고 AI가 환경값을 안내할 수 있도록 데이터 구조를 잡았습니다.",
    "body": "스마트팜을 운영하는 농장주, 농장, 센서 정보를 관리하는 관리자 페이지를 개발하고 유지보수했습니다. 입력된 데이터를 바탕으로 AI가 온도·습도·CO2·배액량·환기 시간을 안내할 수 있도록 관리 구조를 구현하고, 운영자가 필요한 정보를 빠르게 찾도록 화면과 API를 함께 개선했습니다.",
    "cap": "스마트팜 관리자 페이지",
    "project": {
      "role": "관리자 페이지 개발 및 유지보수, 화면·API 개선",
      "impact": "AI 환경 안내가 동작할 수 있는 데이터 관리 구조를 만들었습니다.",
      "skills": [
        [
          "NestJS",
          "grew"
        ],
        [
          "MySQL",
          "grew"
        ],
        [
          "Angular",
          "grew"
        ]
      ]
    },
    "x": 6.29,
    "y": 2.17,
    "r": 0.82
  },
  {
    "id": "ai",
    "name": "AI 개발 프로세스",
    "region": "ai",
    "kicker": "현재 집중",
    "body": "생성형 AI를 요구사항 정리, 구현, 코드 리뷰, 테스트, 문서화에 활용합니다. 다만 결과를 그대로 받는 대신 요구사항·실제 동작·테스트 결과·Git 이력으로 검증하는 루프를 두는 데 관심이 있습니다. AI로 구현 가능한 범위가 빠르게 넓어지는 만큼, 무엇을 하지 않을지 정하는 일이 더 중요해졌다고 생각합니다.",
    "cap": "AI 개발 프로세스",
    "x": 2.07,
    "y": 3.88,
    "r": 1.3
  },
  {
    "id": "gate-harness",
    "name": "요구사항 게이트 하네스",
    "region": "ai",
    "kicker": "실무 적용",
    "sum": "요구사항을 통과 기준으로 바꿔, 충족하지 못한 변경이 다음 단계로 넘어가지 못하게 막습니다.",
    "body": "AI가 만든 결과물을 '그럴듯하다'가 아니라 '요구사항을 충족했다'로 판정하려면 기준이 코드 바깥에 명시돼 있어야 합니다. 요구사항을 게이트로 정의하고 통과하지 못하면 진행되지 않도록 하네스를 구성했습니다.",
    "cap": "요구사항 게이트 하네스",
    "url": "https://github.com/blackstarzck/requirement-gated-python-harness",
    "urlLabel": "GitHub에서 보기",
    "project": {
      "role": "게이트 하네스 설계·적용",
      "impact": "AI 결과를 주관적 판단이 아니라 명시된 기준으로 판정하게 했습니다.",
      "skills": [
        [
          "요구사항 명세",
          "grew"
        ],
        [
          "하네스 설계",
          "first"
        ]
      ]
    },
    "x": 5.94,
    "y": 2.52,
    "r": 0.62
  },
  {
    "id": "multi-agent",
    "name": "멀티 에이전트 오케스트레이션",
    "region": "ai",
    "kicker": "실무 적용",
    "sum": "PM·설계·개발·QA 역할을 나눠 맡기고, 사이에 피드백 루프를 뒀습니다.",
    "body": "하나의 에이전트에게 전부 맡기면 검토자가 없어집니다. PM·설계·개발·QA로 역할을 분담하고 각 단계 사이에 피드백 루프를 설계했습니다. 컨텍스트 인수인계를 명시적으로 처리해 단계가 넘어갈 때 정보가 유실되지 않게 하는 것이 핵심이었습니다.",
    "cap": "멀티 에이전트 오케스트레이션",
    "project": {
      "role": "역할 분담 구조와 피드백 루프 설계",
      "impact": "검토 없이 진행되던 단계에 독립적인 관점을 넣었습니다.",
      "skills": [
        [
          "에이전트 오케스트레이션",
          "first"
        ],
        [
          "컨텍스트 인수인계",
          "first"
        ]
      ]
    },
    "x": 5.16,
    "y": 4.73,
    "r": 0.72
  },
  {
    "id": "verify-loop",
    "name": "검증 루프",
    "region": "ai",
    "kicker": "실무 적용",
    "sum": "타입체크·린트·테스트·빌드·보안·배포를 게이트로 엮어 변경 품질을 확인합니다.",
    "body": "도토리 토픽에서 Vitest와 Playwright, typecheck, lint, build를 보안·배포 게이트와 연계해 변경마다 품질을 검증하도록 구성했습니다. 사람이 매번 확인하는 대신 통과 여부가 기계적으로 드러나게 하는 것이 목적이었습니다.",
    "cap": "검증 루프",
    "project": {
      "role": "테스트·정적분석·배포 게이트 연계",
      "impact": "변경 품질을 사람의 기억이 아니라 파이프라인이 보증하게 했습니다.",
      "skills": [
        [
          "Vitest · Playwright",
          "grew"
        ],
        [
          "CI 게이트 구성",
          "first"
        ]
      ]
    },
    "x": 3.03,
    "y": 5.7,
    "r": 0.82
  },
  {
    "id": "figma-gen",
    "name": "Figma → React 생성기",
    "region": "ai",
    "kicker": "개인 프로젝트",
    "sum": "디자인 토큰을 동기화하고 컴포넌트를 만들어내는 UI 라이브러리 스타터입니다.",
    "body": "Figma의 디자인 토큰을 코드로 동기화하고 shadcn 스타일의 기본 컴포넌트를 생성하는 스타터를 만들었습니다. npm 릴리스 자동화까지 포함해, 디자인과 코드 사이를 손으로 옮기던 과정을 줄이는 것이 목표였습니다.",
    "cap": "Figma 기반 UI 라이브러리",
    "url": "https://github.com/blackstarzck/figma-react-component-generator",
    "urlLabel": "GitHub에서 보기",
    "project": {
      "role": "개인 프로젝트 · 설계 및 구현",
      "skills": [
        [
          "디자인 토큰 동기화",
          "first"
        ],
        [
          "npm 릴리스 자동화",
          "first"
        ],
        [
          "TypeScript",
          "core"
        ]
      ]
    },
    "x": 1.03,
    "y": 6.92,
    "r": 0.62
  },
  {
    "id": "my-skills",
    "name": "개인 스킬 라이브러리",
    "region": "ai",
    "kicker": "개인 프로젝트",
    "sum": "반복해서 쓰는 작업 방식을 스킬로 정리해 재사용합니다.",
    "body": "매번 같은 방식으로 하게 되는 작업들 — 리뷰 절차, 하네스 구성, 문서 정리 — 을 스킬 형태로 모아두고 필요할 때 꺼내 씁니다. 개인 도구지만 팀에 적용할 수 있는 형태로 다듬는 중입니다.",
    "cap": "개인 스킬 라이브러리",
    "url": "https://github.com/blackstarzck/my-skills",
    "urlLabel": "GitHub에서 보기",
    "project": {
      "role": "개인 프로젝트",
      "skills": [
        [
          "작업 방식의 도구화",
          "grew"
        ]
      ]
    },
    "x": -1.23,
    "y": 6.33,
    "r": 0.72
  },
  {
    "id": "product",
    "name": "제품 · 협업",
    "region": "product",
    "kicker": "일하는 방식",
    "body": "기획자와 디자이너가 없는 환경에서 일한 시간이 길어, 무엇을 만들지 정하는 일과 만드는 일을 함께 해왔습니다. 기술적인 내용을 상대방의 눈높이에 맞게 설명하는 것, 서로 다른 관점 사이를 조율하는 것이 강점이라고 생각합니다.",
    "cap": "제품 · 협업",
    "x": -4.5,
    "y": -0.96,
    "r": 1.22
  },
  {
    "id": "dadoke",
    "name": "DADOKe 전자책 · 오디오북",
    "region": "product",
    "kicker": "케듀올 · B2C",
    "sum": "개발은 외주에 맡기고 기획·요구사항 정의·커뮤니케이션을 총괄했습니다.",
    "body": "B2C 전자책·오디오북 플랫폼입니다. 밀리의서재, 리디북스, 아마존 킨들 등 주요 서비스를 벤치마킹해 시장과 경쟁사를 분석했습니다. 개발은 베트남 외주업체에 위탁하고 기획과 요구사항 정의, 커뮤니케이션을 총괄했습니다.",
    "cap": "DADOKe 플랫폼",
    "project": {
      "role": "시장조사·기획·요구사항 정의·외주 커뮤니케이션 총괄",
      "impact": "직접 구현하지 않는 프로젝트에서 요구사항을 전달하고 조율하는 경험을 했습니다.",
      "scope": "밀리의서재·리디북스·아마존 킨들 벤치마킹, 베트남 외주업체와의 요구사항 조율.",
      "skills": [
        [
          "시장 · 경쟁사 분석",
          "first"
        ],
        [
          "외주 커뮤니케이션",
          "grew"
        ],
        [
          "요구사항 정의",
          "grew"
        ]
      ]
    },
    "x": -6.29,
    "y": 2.17,
    "r": 0.62
  },
  {
    "id": "legacy-cleanup",
    "name": "레거시 정리 · 성능 개선",
    "region": "product",
    "kicker": "모두가딜러 · 2022",
    "sum": "불필요한 호출과 쓰지 않는 자산을 걷어내 유지보수 비용을 줄였습니다.",
    "body": "불필요한 Ajax 호출을 제거하고 MySQL SELECT문을 정리해 데이터 조회 구조를 단순화했습니다. 쓰이지 않는 common.js와 style.css를 걷어내 프론트엔드 자산을 경량화했고, 네이버·구글 애널리틱스와 앱스플라이어, 카카오 픽셀 등 추적 코드를 재정비해 스크립트 관리 효율을 개선했습니다.",
    "cap": "레거시 정리",
    "project": {
      "role": "성능 개선 및 레거시 코드 정리",
      "duration": "2022.01 - 2022.05",
      "skills": [
        [
          "성능 개선",
          "grew"
        ],
        [
          "레거시 정리",
          "first"
        ]
      ]
    },
    "x": -7.2,
    "y": -0.21,
    "r": 0.72
  },
  {
    "id": "docs-comm",
    "name": "문서화 · 비개발 직군 협업",
    "region": "product",
    "kicker": "지속",
    "sum": "기능과 정책을 문서로 남기고, 비개발 직군이 읽을 수 있는 자료를 따로 만들었습니다.",
    "body": "서비스 기능과 정책을 문서화하고 비개발 직군과의 커뮤니케이션 자료를 별도로 제작해 협업 효율을 높였습니다. 최근에는 반응형·다국어 UI와 사용자·관리자 권한 경계를 문서화해 유지보수성과 운영 안정성을 함께 올리는 데 적용하고 있습니다.",
    "cap": "문서화 · 협업",
    "project": {
      "role": "기능·정책 문서화 및 협업 자료 제작",
      "skills": [
        [
          "기술 문서화",
          "grew"
        ],
        [
          "비개발 직군 커뮤니케이션",
          "core"
        ]
      ]
    },
    "x": -6.15,
    "y": -2.53,
    "r": 0.82
  },
  {
    "id": "english",
    "name": "영어 · 통역안내사",
    "region": "product",
    "kicker": "배경",
    "sum": "영어영문학 전공과 관광통역안내사 경력. 해외 외주와 영문 기술 문서를 다루는 기반입니다.",
    "body": "성결대학교 영어영문학과를 졸업하고 2014년 관광통역안내사(영어) 자격을 취득했습니다. TOEIC 920. 여행업에서 고객과 국내외 협력업체 사이를 잇는 일을 하며 신뢰를 형성하고 소통하는 방법을 배웠습니다. 지금은 영문 기술 문서를 읽고 활용하는 일, 해외 외주 개발사와 요구사항을 조율하는 일에 그 경험이 쓰입니다.",
    "cap": "영어영문학 · 관광통역안내사",
    "project": {
      "role": "영어영문학 전공 · 관광통역안내사(영어)",
      "duration": "성결대학교 2008.03 - 2014.03 · 자격 2014.12",
      "skills": [
        [
          "영문 기술 문서",
          "core"
        ],
        [
          "해외 외주 조율",
          "grew"
        ]
      ]
    },
    "x": -5.27,
    "y": -4.91,
    "r": 0.62
  },
  {
    "id": "lab",
    "name": "실험실",
    "region": "lab",
    "kicker": "손이 기억하는 것",
    "body": "회사 일과 별개로 계속 만들어 온 것들입니다. 파티클과 캔버스, 아이소메트릭과 3D, 간단한 게임까지. 당장 쓸 데가 없어도 손으로 만들어 보면 남는 게 있다고 생각합니다. 이 포트폴리오 사이트도 그 연장선입니다.",
    "cap": "실험실",
    "links": [
      [
        "GitHub에서 전부 보기",
        "https://github.com/blackstarzck?tab=repositories"
      ]
    ],
    "x": -0.15,
    "y": -4.2,
    "r": 1.18
  },
  {
    "id": "canvas-lab",
    "name": "캔버스 · 파티클",
    "region": "lab",
    "kicker": "실험",
    "sum": "파티클과 캔버스 합성을 다양하게 시도해 본 저장소들입니다.",
    "body": "particles, multicanvas, particle-colorful-stars 같은 저장소로 캔버스 위에서 입자를 다루는 방법을 실험했습니다. 여러 캔버스를 겹쳐 합성하거나, 수천 개 입자를 프레임마다 그릴 때 무엇이 병목이 되는지 직접 확인해 보는 것이 목적이었습니다.",
    "cap": "캔버스 · 파티클 실험",
    "project": {
      "role": "개인 실험",
      "skills": [
        [
          "Canvas 2D",
          "grew"
        ],
        [
          "파티클 시스템",
          "first"
        ]
      ]
    },
    "x": -3.4,
    "y": -5.24,
    "r": 0.62
  },
  {
    "id": "three-lab",
    "name": "3D · 아이소메트릭",
    "region": "lab",
    "kicker": "실험",
    "sum": "아이소메트릭 뷰와 3D 모델, 카메라 컨트롤을 다뤄본 저장소들입니다.",
    "body": "isosmetric, custom_model, controls 계열 저장소에서 3D 공간을 화면에 올리는 방법을 익혔습니다. 이 경험이 이후 팜커넥트에서 센서 데이터를 3D로 시각화할 때 직접 쓰였습니다.",
    "cap": "3D · 아이소메트릭 실험",
    "project": {
      "role": "개인 실험",
      "skills": [
        [
          "3D 렌더링",
          "grew"
        ],
        [
          "카메라 컨트롤",
          "first"
        ]
      ]
    },
    "x": -1.45,
    "y": -6.64,
    "r": 0.72
  },
  {
    "id": "game-lab",
    "name": "게임 · 인터랙션",
    "region": "lab",
    "kicker": "실험",
    "sum": "1인칭 시점, FPS 조작, 카드 게임 같은 인터랙션 실험입니다.",
    "body": "lets-fps, first-person-perspective, neon-fist, game-cards 같은 저장소로 조작감과 상태 전이를 실험했습니다. 게임은 프레임마다 상태가 바뀌기 때문에 UI 개발과는 다른 근육을 씁니다.",
    "cap": "게임 · 인터랙션 실험",
    "project": {
      "role": "개인 실험",
      "skills": [
        [
          "실시간 인터랙션",
          "first"
        ],
        [
          "게임 루프",
          "first"
        ]
      ]
    },
    "x": 0.91,
    "y": -6.18,
    "r": 0.82
  },
  {
    "id": "react-basics",
    "name": "React 학습기",
    "region": "lab",
    "kicker": "2022",
    "sum": "라우터·상태·스타일링을 하나씩 떼어 연습하던 시기의 기록입니다.",
    "body": "2022년, react-practice 시리즈와 react-router·styled-component·swiper 연습 저장소들을 남겼습니다. 지금 보면 조각난 예제들이지만, 이때 하나씩 떼어 연습한 것들이 이후 실무에서 조합되어 쓰였습니다. 지우지 않고 두는 이유입니다.",
    "cap": "React 학습기 · 2022",
    "project": {
      "role": "학습",
      "duration": "2022",
      "skills": [
        [
          "React",
          "first"
        ]
      ]
    },
    "x": 3.3,
    "y": -5.95,
    "r": 0.62
  }
]
