import type { AIArticle } from './aiArticles'

const frontendRepository = {
  label: 'doc-merge 프론트엔드 저장소',
  url: 'https://github.com/blackstarzck/doc-merge',
}

const backendRepository = {
  label: 'doc-merge 백엔드 저장소',
  url: 'https://github.com/blackstarzck/doc-merge-server',
}

const uploadReadme = {
  label: '엑셀 업로드 규칙',
  url: 'https://github.com/blackstarzck/doc-merge/blob/main/README.md',
}

const frontendTables = {
  label: '프론트엔드 문서별 열 정의',
  url: 'https://github.com/blackstarzck/doc-merge/blob/main/src/constants/tables.js',
}

const excelExport = {
  label: '엑셀 서식·다운로드 처리',
  url: 'https://github.com/blackstarzck/doc-merge/blob/main/src/components/ActionHandler/index.jsx',
}

const serverModules = {
  label: '서버 업무 모듈 구성',
  url: 'https://github.com/blackstarzck/doc-merge-server/blob/master/src/app.module.ts',
}

const serverUpload = {
  label: '서버 엑셀 업로드 처리',
  url: 'https://github.com/blackstarzck/doc-merge-server/blob/master/src/upload/upload.service.ts',
}

const transactionBoundary = {
  label: '서버 트랜잭션 처리',
  url: 'https://github.com/blackstarzck/doc-merge-server/blob/master/src/common/interceptor/transaction.interceptor.ts',
}

const millieRepository = {
  label: '밀리 관리자 대시보드 저장소',
  url: 'https://github.com/blackstarzck/millie-admin-dashboard',
}

const millieReadme = {
  label: '프로젝트 소개와 배포 주소',
  url: 'https://github.com/blackstarzck/millie-admin-dashboard/blob/main/README.md',
}

const millieRoutes = {
  label: '전체 관리 화면 구성',
  url: 'https://github.com/blackstarzck/millie-admin-dashboard/blob/main/src/App.js',
}

const millieSidebar = {
  label: '관리자 메뉴 정보 구조',
  url: 'https://github.com/blackstarzck/millie-admin-dashboard/blob/main/src/components/Sidebar.js',
}

const millieDashboard = {
  label: '운영 대시보드 화면',
  url: 'https://github.com/blackstarzck/millie-admin-dashboard/blob/main/src/pages/Dashboard.js',
}

const millieBookManagement = {
  label: '도서 관리 화면',
  url: 'https://github.com/blackstarzck/millie-admin-dashboard/blob/main/src/pages/ContentManagement/BookManagement.js',
}

const milliePermissions = {
  label: '권한 관리 화면',
  url: 'https://github.com/blackstarzck/millie-admin-dashboard/blob/main/src/pages/SystemSettings/PermissionManagement.js',
}

const milliePackage = {
  label: '사용한 화면 도구와 라이브러리',
  url: 'https://github.com/blackstarzck/millie-admin-dashboard/blob/main/package.json',
}

export const PROJECT_ARTICLES: Record<string, AIArticle> = {
  'doc-merge': {
    deck: '프론트엔드와 백엔드 저장소를 함께 보면, 이 프로젝트는 단순한 엑셀 병합기가 아닙니다. 도서 납품 현황·기관·거래처·정산 장부를 하나의 데이터 흐름으로 묶고, 엑셀을 입력과 출력 형식으로 활용한 내부 업무 서비스입니다.',
    sections: [
      {
        eyebrow: '업무 문제',
        title: '하나의 납품 건이 여러 문서에서 따로 관리되고 있었다',
        paragraphs: [
          '도서 납품 업무에는 전체 진행 현황뿐 아니라 기관별 기록, 매출처·매입처 장부, 마크장비 진행, 물류비와 정산 정보가 함께 움직입니다. 기존 방식에서는 같은 기관명·납품일·금액을 서로 다른 엑셀에 반복해서 입력해야 했고, 한 문서의 수정이 다른 문서에 바로 반영되지 않았습니다.',
          '먼저 실제 문서 종류를 업무 단위로 나누고 공통 정보를 연결했습니다. 사용자는 익숙한 엑셀로 데이터를 가져오되, 서비스 안에서는 하나의 데이터베이스를 기준으로 조회·수정·재출력할 수 있도록 구성했습니다.',
        ],
        table: {
          caption: '흩어진 문서를 시스템 안의 업무 단위로 다시 나눈 구조',
          headers: ['업무 단위', '관리하는 정보', '함께 연결되는 정보'],
          rows: [
            ['도서 납품 현황', '기관·납품·금액·수익·진행 상태', '매출처와 매입처 장부'],
            ['용역·물품 납품', '계약·담당자·일정·비용', '기관과 상위 사업자'],
            ['장서 점검·도서 폐기', '수량·매출·입금·진행', '기관과 담당자'],
            ['물류 작업·화물 사용', '발송·납품·운임·정산', '진행 건과 업체'],
            ['매출처·매입처 장부', '발주·입금·송금·이익', '도서 납품 건'],
            ['마크장비 진행 현황', '장비·지역·기한·정산', '기관과 계약 업체'],
          ],
          source: serverModules,
        },
      },
      {
        eyebrow: '처리 흐름',
        title: '엑셀 한 장이 검증 가능한 업무 데이터가 되기까지',
        paragraphs: [
          '업로드 버튼만 추가한 것이 아니라, 파일의 형식을 확인하고 열 이름을 시스템 필드에 연결한 뒤 각 행을 검증하는 순서를 만들었습니다. 도서 납품 데이터에 매출처나 매입처가 들어 있으면 연결된 장부도 같은 흐름에서 갱신합니다.',
          '저장된 데이터는 대용량 표에서 다시 편집하고 필요한 열만 골라 볼 수 있습니다. 마지막에는 사용자가 선택한 서식을 미리 확인한 뒤 필터와 고정 헤더가 포함된 엑셀로 다시 내려받습니다.',
        ],
        workflow: {
          caption: '프론트엔드의 업로드·편집·출력과 서버의 검증·저장을 연결한 전체 흐름',
          steps: [
            { label: '01', title: '업무 문서 선택', detail: '납품·기관·장부 등 작업 대상을 먼저 정함', tone: 'work' },
            { label: '02', title: '엑셀 업로드', detail: '엑셀 형식과 첫 행 헤더를 확인', tone: 'work' },
            { label: '03', title: '시트 이름 확인', detail: '기관·거래처 이름과 대상이 일치하는지 검사', tone: 'gate' },
            { label: '04', title: '열 이름 연결', detail: '공백을 정리하고 한글 헤더를 데이터 필드로 변환', tone: 'gate' },
            { label: '05', title: '행 단위 검증', detail: '날짜·숫자·필수값과 허용되지 않은 열을 확인', tone: 'check' },
            { label: '06', title: '데이터 저장', detail: '기존 행을 갱신하고 관련 장부를 함께 연결', tone: 'work' },
            { label: '07', title: '표에서 재편집', detail: '필터·정렬·열 선택 후 필요한 값을 수정', tone: 'loop' },
            { label: '08', title: '서식 적용·출력', detail: '미리보기 후 업무용 엑셀로 다시 다운로드', tone: 'check' },
          ],
          source: serverUpload,
        },
      },
      {
        eyebrow: '전체 설계',
        title: '화면은 작업을 단순하게, 서버는 데이터의 연결을 책임지게 했다',
        paragraphs: [
          '프론트엔드는 사용자가 문서를 찾고, 올리고, 표에서 편집하고, 원하는 형태로 출력하는 과정에 집중합니다. 서버는 문서 종류별 저장 구조와 관계를 관리하고 잘못된 형식이 데이터베이스에 들어가지 않도록 막습니다.',
          '이렇게 역할을 나누면서 엑셀은 계속 사용할 수 있는 입출력 수단이 되고, 여러 문서가 공유하는 실제 데이터는 서버에서 한 번만 관리할 수 있게 했습니다.',
        ],
        table: {
          caption: '사용자 화면과 서버가 나눠 맡은 책임',
          headers: ['구간', '프론트엔드', '백엔드'],
          rows: [
            ['문서 탐색', '업무별 메뉴와 선택 상태 제공', '문서별 API와 데이터 모델 분리'],
            ['가져오기', '엑셀 형식 확인과 업로드 상태 안내', '첫 시트 해석·헤더 정리·열 이름 연결'],
            ['데이터 품질', '편집 가능한 열과 표시 형식 제어', '행 검증·시트 이름 확인·저장 실패 처리'],
            ['연결 정보', '기관·거래처 선택 맥락 유지', '납품 현황과 매출·매입 장부 연결'],
            ['내보내기', '서식 선택·미리보기·엑셀 생성', '최신 업무 데이터를 API로 제공'],
          ],
          source: excelExport,
        },
      },
      {
        eyebrow: '데이터 보호선',
        title: '잘못된 엑셀을 조용히 저장하지 않도록 경계를 세웠다',
        paragraphs: [
          '업무용 엑셀은 사람이 자유롭게 수정하기 때문에 열 이름, 시트 이름, 날짜 형식이 쉽게 달라집니다. 이 차이를 그대로 허용하면 화면에서는 성공처럼 보여도 다른 장부와 연결되지 않는 데이터가 생길 수 있습니다.',
          '그래서 업로드 규칙을 사용자 안내와 서버 검사에 함께 반영했습니다. 특히 기관·매출처·매입처 장부는 시트 이름과 선택한 대상의 이름이 다르면 저장을 중단합니다.',
        ],
        bullets: [
          '엑셀 이외의 파일은 화면에서 먼저 차단',
          '첫 행을 헤더로 사용하고 공백·줄바꿈·탭을 제거한 뒤 열 이름 연결',
          '정의되지 않은 열은 저장 대상에서 제외하고 각 행의 데이터 형식을 검증',
          '도서 납품 저장 시 매출처·매입처 장부 관계를 함께 갱신',
          '여러 저장 작업은 하나의 처리 경계로 묶어 실패 시 되돌릴 수 있도록 설계',
        ],
      },
      {
        eyebrow: '결과와 배움',
        title: '문서를 합치는 일은 결국 업무 규칙을 데이터 구조로 옮기는 일이었다',
        paragraphs: [
          '기획부터 화면, API, 데이터베이스까지 혼자 연결하면서 각 엑셀의 열 하나가 어떤 업무 의미를 갖는지 먼저 정의해야 했습니다. 화면을 만드는 것보다 서로 다른 장부에서 같은 납품 건을 어떻게 식별하고 연결할지가 더 중요한 문제였습니다.',
          '그 결과 반복 입력과 입력 오류를 줄일 수 있는 공통 작업 공간을 만들었습니다. 동시에 사용자가 익숙한 엑셀을 없애지 않고, 업로드와 다운로드 경계로 남겨 도입 부담을 낮췄습니다.',
        ],
        quote: '문서 통합의 핵심은 파일을 한곳에 모으는 것이 아니라, 여러 문서가 공유하는 정보를 한 번만 관리하게 만드는 것입니다.',
      },
    ],
    caveat: '현재 저장소에서는 프론트엔드와 서버가 열 이름 표를 각각 관리합니다. README에도 열을 바꾸면 양쪽 정의를 함께 수정해야 한다고 적혀 있어 유지보수 결합도가 남아 있습니다. 또한 업무 시간과 오류 감소는 정량 측정값이 기록되어 있지 않아 포트폴리오에서는 정성적 결과로만 표현했습니다.',
    sources: [
      frontendRepository,
      backendRepository,
      uploadReadme,
      frontendTables,
      excelExport,
      serverUpload,
      transactionBoundary,
    ],
  },
  'millie-admin-dashboard': {
    deck: '공식 서비스 운영 프로젝트가 아니라, 대형 콘텐츠 플랫폼의 관리자 업무를 직접 분해해 화면 체계로 만든 개인 프로토타입입니다. 90여 회의 커밋에 걸쳐 메뉴 구조, 데이터 테이블, 폼, 통계, 권한 화면을 확장했습니다.',
    sections: [
      {
        eyebrow: '프로젝트 정의',
        title: '관리자 화면의 핵심은 페이지 수가 아니라 업무의 연결이다',
        paragraphs: [
          '콘텐츠 플랫폼의 운영자는 도서만 등록하지 않습니다. 회원과 구독 상태를 확인하고, 쿠폰과 이벤트를 운영하며, 신고와 문의를 처리하고, 권한과 보안 설정도 관리해야 합니다. 한 업무의 결과가 다른 메뉴의 판단 근거가 되기 때문에 전체 구조가 먼저 필요했습니다.',
          '밀리의 서재를 참고하되 화면을 그대로 복제하기보다, 운영 업무를 콘텐츠·회원·프로모션·고객 대응·분석·시스템이라는 영역으로 나눴습니다. 각 영역이 같은 탐색 방식과 상태 표현을 사용하도록 설계해 많은 메뉴에서도 사용법이 달라지지 않게 했습니다.',
        ],
        table: {
          caption: '관리자 메뉴를 실제 운영 목적에 따라 다시 나눈 구조',
          headers: ['운영 영역', '대표 화면', '관리 목적'],
          rows: [
            ['콘텐츠', '도서·시리즈·메타데이터·큐레이션·카테고리·리뷰', '콘텐츠 등록부터 노출 품질까지 관리'],
            ['회원·구독', '회원 정보·구독 이력·해지·제재·배지', '이용 상태와 운영 조치를 한 흐름에서 확인'],
            ['프로모션·소통', '쿠폰·이벤트·배너·팝업·공지·알림·이메일', '캠페인 제작과 노출 상태를 관리'],
            ['고객 대응', '문의·FAQ·신고·리뷰·금칙어', '문제 접수부터 검토와 조치까지 연결'],
            ['분석', '운영 요약·회원·콘텐츠·방문·캠페인 지표', '현재 상태와 변화 신호를 빠르게 파악'],
            ['시스템·파트너', '권한·보안·API·버전·파트너 정산', '운영 경계와 외부 협업 기준을 관리'],
          ],
          source: millieSidebar,
        },
      },
      {
        eyebrow: '업무 흐름',
        title: '현황 확인에서 수정과 재확인까지 한 방향으로 이어지게 했다',
        paragraphs: [
          '관리자 업무는 목록을 보는 데서 끝나지 않습니다. 이상 신호를 발견하고 대상을 좁힌 뒤 상세 정보를 확인하고, 필요한 값을 수정한 다음 결과가 반영됐는지 다시 확인해야 합니다.',
          '대시보드를 출발점으로 두고 목록 화면의 검색·필터, 상세 또는 편집 화면, 확인 단계, 이력과 통계로 이어지는 공통 흐름을 만들었습니다. 메뉴가 달라도 같은 순서로 판단하고 조치할 수 있습니다.',
        ],
        workflow: {
          caption: '여러 관리 메뉴에 공통으로 적용한 운영자의 기본 작업 흐름',
          steps: [
            { label: '01', title: '현황 확인', detail: '대시보드 지표와 알림에서 우선 처리할 일을 찾음', tone: 'check' },
            { label: '02', title: '업무 선택', detail: '검색 가능한 메뉴에서 콘텐츠·회원·운영 영역으로 이동', tone: 'work' },
            { label: '03', title: '대상 좁히기', detail: '검색·필터·정렬·상태값으로 필요한 항목을 추림', tone: 'work' },
            { label: '04', title: '상세 확인·편집', detail: '관련 정보와 이력을 보고 필요한 값을 수정', tone: 'loop' },
            { label: '05', title: '검증·확정', detail: '필수값과 노출 상태를 확인한 뒤 작업을 반영', tone: 'gate' },
            { label: '06', title: '결과 재확인', detail: '목록·대시보드·활동 이력에서 변경 결과를 확인', tone: 'check' },
          ],
          source: millieDashboard,
        },
      },
      {
        eyebrow: '화면 설계',
        title: '데이터가 많아져도 사용법은 반복되도록 공통 패턴을 만들었다',
        paragraphs: [
          '관리자 화면은 정보 밀도가 높기 때문에 매번 새로운 화면 표현을 만들면 오히려 학습 비용이 커집니다. 메뉴, 목록, 편집, 분석, 권한이라는 몇 가지 패턴을 정하고 여러 업무에 반복 적용했습니다.',
          '도서 관리처럼 항목이 많은 화면에는 조건 검색과 상태 태그, 표와 페이지 이동을 함께 배치했습니다. 등록·수정 화면에는 날짜 선택과 다양한 편집기를 연결하고, 분석 화면에는 요약 카드와 차트를 사용했습니다.',
        ],
        table: {
          caption: '운영 목적에 맞춰 반복 사용한 관리자 화면 패턴',
          headers: ['화면 패턴', '공통 요소', '사용자에게 주는 이점'],
          rows: [
            ['탐색', '중첩 메뉴·메뉴 검색·현재 위치 표시', '메뉴가 많아도 원하는 업무를 빠르게 찾음'],
            ['목록', '검색·필터·정렬·페이지 이동·상태 태그', '대상을 좁히고 상태를 비교하기 쉬움'],
            ['등록·편집', '입력 규칙·날짜·콘텐츠 편집기·확인 단계', '복잡한 정보를 한 흐름에서 작성'],
            ['분석', '요약 카드·차트·순위·변화 지표', '숫자의 우선순위와 변화 방향을 빠르게 이해'],
            ['권한', '역할별 메뉴·기능 범위 설정', '운영자의 책임 범위를 화면 구조와 연결'],
          ],
          source: millieBookManagement,
        },
      },
      {
        eyebrow: '구현 범위',
        title: '관리자 서비스에 필요한 다양한 상호작용을 한 프론트엔드에 모았다',
        paragraphs: [
          'React와 관리자 UI 도구(Ant Design)를 중심으로 라우팅, 표, 폼, 모달, 차트를 구성했습니다. 여기에 콘텐츠 편집기, 코드 편집기, 조건 작성기, 드래그 앤 드롭을 더해 운영 도구에서 자주 만나는 복잡한 상호작용을 직접 다뤘습니다.',
          '많은 화면을 만드는 과정에서 개별 기능보다 메뉴와 상태 표현의 일관성을 먼저 확인했습니다. 저장소의 화면 구성과 배포 결과를 함께 남겨 설계 범위와 실제 구현 화면을 모두 확인할 수 있게 했습니다.',
        ],
        bullets: [
          'React Router로 업무 영역별 화면과 상세 경로 구성',
          '데이터 표·검색·필터·정렬·페이지 이동과 상태 태그 구현',
          '통계 카드와 여러 형태의 차트로 운영 지표 시각화',
          '콘텐츠 편집기·조건 작성기·드래그 앤 드롭 등 관리 도구 상호작용 실험',
          '역할과 메뉴 범위를 연결하는 권한 설정 화면 구성',
        ],
      },
      {
        eyebrow: '결과와 배움',
        title: '복잡한 관리자 제품을 정보 구조부터 끝까지 설계한 기록이다',
        paragraphs: [
          '이 프로젝트를 통해 관리자 제품은 예쁜 대시보드 한 장보다, 운영자가 정보를 찾고 판단하고 조치하는 반복 흐름이 더 중요하다는 점을 확인했습니다. 메뉴와 화면이 많아질수록 공통 규칙이 사용자 경험과 개발 효율을 함께 지탱합니다.',
          '이후 실제 관리자단 작업에서도 도메인을 먼저 분류하고 목록·상세·권한의 경계를 설계하는 기반이 되었습니다. 포트폴리오에서는 완성된 서비스 성과가 아니라 복잡한 운영 문제를 구조화하고 넓은 화면 범위를 구현한 역량을 보여주는 작업으로 제시합니다.',
        ],
        quote: '관리자 화면의 품질은 기능의 개수보다, 운영자가 같은 방식으로 찾고 판단하고 조치할 수 있는가에서 결정됩니다.',
      },
    ],
    caveat: '밀리의 서재 공식 프로젝트가 아닌 개인 학습·설계 프로토타입입니다. 화면의 수치와 회원·도서 정보는 예시 데이터이고 일부 저장·권한 흐름은 실제 API가 아닌 화면 상태로 동작합니다. 따라서 운영 성과가 아니라 관리자 정보 구조와 프론트엔드 설계 역량을 보여주는 작업으로 평가해야 합니다.',
    sources: [
      millieRepository,
      millieReadme,
      millieRoutes,
      millieSidebar,
      millieDashboard,
      millieBookManagement,
      milliePermissions,
      milliePackage,
    ],
  },
}
