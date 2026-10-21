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
  'ttokttok-admin': {
    deck: '독자가 만나는 책과 게시물 뒤에는 콘텐츠를 준비하고 발행하는 운영 과정이 있습니다. 똑똑 관리자는 도서 등록부터 카드·영상 제작, 추천 구성과 독자 반응 확인까지 이어지는 별도 웹 앱입니다.',
    sections: [
      {
        eyebrow: '콘텐츠 제작',
        title: '등록과 편집을 실제 독자 화면의 미리보기로 연결했습니다',
        paragraphs: [
          '운영자는 도서의 서지 정보와 표지, 전자책 본문과 외부 구매 링크를 등록합니다. 등록한 책을 카드나 영상 게시물에 연결하고, 문구·배경·서체·페이지 순서를 편집해 독자에게 보여 줄 콘텐츠를 구성합니다.',
          '게시물 편집기에서는 실제 독자 화면에 가까운 미리보기를 함께 확인합니다. 도서 선택과 배경, 문구 작성, 최종 확인을 단계로 나누고 여러 페이지를 추가해 게시물을 제작하도록 구성했습니다.',
        ],
        workflow: {
          caption: '도서 준비에서 게시물 발행까지의 운영 흐름',
          steps: [
            { label: 'Prepare', title: '도서와 채널 준비', detail: '책 정보와 본문·구매 링크, 발행할 채널을 정합니다.' },
            { label: 'Edit', title: '게시물 제작', detail: '카드 문구와 배경·서체를 조절하거나 영상을 연결합니다.' },
            { label: 'Review', title: '미리보기와 발행', detail: '독자에게 보일 화면을 확인하고 게시물을 발행합니다.', tone: 'check' },
          ],
        },
      },
      {
        eyebrow: '서비스 운영',
        title: '콘텐츠를 공개한 뒤의 관리 업무도 한곳에 모았습니다',
        paragraphs: [
          '도서와 게시물 외에 채널 정보, 오늘의 추천과 노출 순서도 관리자에서 관리합니다. 통계·분석 화면에서는 독자 반응과 도서 성과를 확인해 다음 콘텐츠 운영에 참고할 수 있도록 구성했습니다.',
          '댓글 신고 검토와 금칙어 관리를 운영 메뉴에 포함하고, 회원과 관리자 계정 관리는 최고 관리자에게 제한합니다. 콘텐츠를 다루는 업무와 계정·권한을 다루는 업무의 접근 범위를 구분했습니다.',
        ],
        bullets: [
          '도서·본문·구매 링크와 카드·영상 게시물 관리',
          '채널 소개·추천 도서·노출 순서 관리',
          '독자 반응과 도서 성과를 확인하는 통계·분석',
          '댓글 신고·금칙어 처리와 역할에 따른 관리 권한',
        ],
      },
      {
        eyebrow: '구현 구성',
        title: '독자 앱과 운영 앱의 화면 규칙을 공용 코드로 맞췄습니다',
        paragraphs: [
          '관리자 앱은 Next.js App Router·TypeScript·Tailwind CSS v4·Supabase를 기반으로 구성했습니다. 모노레포 안에서 독자 앱과 공용 UI·데이터 타입·콘텐츠 코드를 함께 사용해 편집 미리보기와 실제 표시 규칙을 연결합니다.',
          '사용자 앱과 분리된 Vercel 프로젝트로 배포하며, 관리자 기능은 로그인과 역할 확인을 거칩니다. 이 페이지의 미리보기는 저장소에 포함된 게시물 편집기 검증 화면입니다.',
        ],
      },
    ],
    sources: [
      { label: '똑똑 관리자 업무 메뉴 (비공개 저장소)', url: 'https://github.com/blackstarzck/ttokttok/blob/master/apps/admin/src/app/admin/(dashboard)/page.tsx' },
      { label: '관리자 앱 기술 스택', url: 'https://github.com/blackstarzck/ttokttok/blob/master/apps/admin/package.json' },
      { label: '게시물 편집기 검증 화면', url: 'https://github.com/blackstarzck/ttokttok/blob/master/e2e/baselines/admin/post-studio-1440.png' },
    ],
  },
  'on-the-book-admin': {
    deck: '책과 챕터, 3D 모델과 본문을 하나의 작품으로 구성하는 온더북 운영 도구입니다. 공간을 편집하는 과정에서 독자 체험으로 전환해 동작을 확인하고, 초안과 공개본을 구분해 콘텐츠를 운영합니다.',
    sections: [
      {
        eyebrow: '도서와 장면 관리',
        title: '책장에 보이는 정보와 장면 속 콘텐츠를 함께 편집합니다',
        paragraphs: [
          '도서 보관함에서 표지·분류·작품 소개와 공개 여부를 관리하고 독자 책장의 노출 순서를 정합니다. 홈 화면의 추천 배너와 연결 도서, 이미지와 문구도 운영 화면에서 구성합니다.',
          '챕터 편집에서는 본문·장면 썸네일·공간 크기와 분위기를 조절합니다. 장면 순서를 바꾸면 독자가 이동하는 여정도 바뀌며, 작품 정보와 3D 공간을 하나의 도서 구조 안에서 관리할 수 있습니다.',
        ],
      },
      {
        eyebrow: '3D 편집 도구',
        title: '모델과 이미지를 배치하고 접근 반응을 조절합니다',
        paragraphs: [
          'GLB 모델을 보관함에 등록해 월드로 끌어 배치하고, 위치·크기·회전과 접근 거리·동작을 설정합니다. 모델 선택과 이동 도구, 좌표 패널을 연결해 장면 안의 오브젝트를 편집하도록 구성했습니다.',
          '바닥 이미지와 화살표를 배치해 이동 경로를 안내하고, 모델의 접근 반응과 충돌 범위를 함께 확인합니다. 독자 체험에서는 편집 중인 공간을 직접 이동하며 본문·애니메이션·카메라 구도를 검수할 수 있습니다.',
        ],
        bullets: [
          'GLB 모델 보관함과 드래그 배치',
          '위치·크기·회전·애니메이션과 접근 범위 설정',
          '바닥 이미지·이동 안내와 챕터별 본문 편집',
          '독자 체험 전환과 편집 시점·선택 상태 복원',
        ],
      },
      {
        eyebrow: '검수와 공개',
        title: '독자와 같은 공간에서 확인하고 공개본을 갱신합니다',
        paragraphs: [
          '관리자와 독자 화면은 같은 좌표와 공통 3D 렌더링 코드를 사용합니다. 편집 화면의 결과를 독자 체험으로 확인한 뒤 임시 저장하고, 사용자 화면에 공개하는 단계를 별도로 거칩니다.',
          'Supabase에 도서·챕터·모델 배치와 공개본을 보관하고, GLB와 이미지는 파일 저장소에서 관리합니다. JavaScript·Three.js·Vite 기반 관리자 앱은 독자 앱과 분리해 Vercel에 배포합니다.',
          '이 페이지의 미리보기는 저장소에 포함된 3D 월드 편집기 검증 화면입니다. 운영 관리자 화면은 로그인 후 사용할 수 있습니다.',
        ],
        workflow: {
          caption: '편집 결과를 독자 경험으로 확인하고 공개하는 흐름',
          steps: [
            { label: 'Edit', title: '장면 편집', detail: '모델·이미지·본문과 공간 설정을 수정합니다.' },
            { label: 'Preview', title: '독자 체험', detail: '같은 공간을 이동하며 반응과 본문을 확인합니다.', tone: 'check' },
            { label: 'Publish', title: '저장과 공개', detail: '초안을 저장하고 확인을 마친 내용을 공개합니다.', tone: 'gate' },
          ],
        },
      },
    ],
    sources: [
      { label: '온더북 관리자 안내', url: 'https://github.com/blackstarzck/on-the-book/blob/main/docs/ADMIN-GUIDE.md' },
      { label: '사용자·관리자 분리 배포', url: 'https://github.com/blackstarzck/on-the-book/blob/main/docs/DEPLOYMENT.md' },
      { label: '3D 편집기 검증 화면', url: 'https://github.com/blackstarzck/on-the-book/blob/main/docs/screenshots/admin-desktop.png' },
    ],
  },
  ttokttok: {
    deck: '책 소개를 본 관심이 실제 읽기로 이어지도록, 발견과 독서를 같은 화면 흐름 안에 놓았습니다. 숏폼 피드·EPUB 뷰어·독서 기록과 콘텐츠 운영 도구를 함께 구성한 모바일 웹 서비스입니다.',
    sections: [
      {
        eyebrow: '제품 설계',
        title: '책을 읽을 생각이 없던 순간에도 첫 장을 열 수 있도록',
        paragraphs: [
          '책 소개를 보고 흥미가 생겨도 검색과 구매, 앱 설치를 거치는 사이에 읽기를 미루기 쉽습니다. 똑똑은 카드와 세로 영상을 넘기며 책을 발견하고, 읽기 버튼으로 바로 본문에 들어가도록 구성했습니다.',
          '피드 탐색과 전문 도서 읽기에는 로그인을 요구하지 않습니다. 좋아요·댓글·찜처럼 개인 계정이 필요한 행동에서 로그인을 요청하며, 본문을 제공하지 않는 링크형 도서는 외부 서점으로 안내합니다.',
        ],
        workflow: {
          caption: '책 발견에서 독서 기록까지 이어지는 사용자 동선',
          steps: [
            { label: 'Discover', title: '카드·영상에서 책 발견', detail: '피드를 넘기거나 제목·저자·채널과 장르로 탐색합니다.' },
            { label: 'Read', title: '전문 도서 바로 읽기', detail: 'EPUB 뷰어에서 글자 크기와 배경을 조절합니다.' },
            { label: 'Continue', title: '읽던 위치에서 계속', detail: '비회원은 같은 브라우저에서, 회원은 기기를 바꿔 이어 읽습니다.', tone: 'loop' },
          ],
        },
      },
      {
        eyebrow: '독서 경험',
        title: '피드의 빠른 탐색과 본문의 차분한 읽기를 연결했습니다',
        paragraphs: [
          '피드에서는 책 소개 카드와 세로 영상, 책 정보와 읽기 동작을 함께 보여 줍니다. 탐색 화면에는 운영자가 고른 추천 도서와 장르, 최근 게시물의 반응을 확인할 수 있는 급상승 영역을 두었습니다.',
          '본문은 epub.js로 열고 탭·스와이프 페이지 이동, 목차, 글자 크기와 밝게·어둡게·세피아 배경을 지원합니다. 독서 위치와 완독 여부를 기록하고, 뷰어 코드에서는 본문 교체로 이전 위치를 복원하지 못할 때 첫 페이지로 돌아가도록 처리합니다.',
        ],
        bullets: [
          '로그인 없이 피드·탐색·전문 도서 읽기와 같은 브라우저 이어 읽기',
          '구글·카카오 로그인과 회원의 기기 간 독서 위치 복원',
          '읽는 중·보관함·완독으로 나눈 개인 독서 기록',
          '게시물별 공유 주소와 책 정보 미리보기',
        ],
      },
      {
        eyebrow: '구현과 운영',
        title: '독자 앱과 관리자 앱을 나누고 콘텐츠 운영을 연결했습니다',
        paragraphs: [
          '사용자와 관리자 앱을 Next.js App Router 기반으로 분리하고 공용 UI·데이터베이스·콘텐츠 코드를 패키지로 공유합니다. TypeScript와 Tailwind CSS v4를 사용하며 Supabase가 인증·데이터베이스·파일 저장을 담당합니다.',
          '운영자는 도서와 전자책 파일, 카드·영상 게시물, 채널, 추천 도서를 관리하고 게시 전 미리보기를 확인합니다. 댓글 금칙어와 신고 처리도 관리자 흐름에 포함해, 독자 경험을 유지하는 운영 기능까지 구성했습니다.',
          '제품의 확인 기준은 게시물을 본 사람이 실제로 책을 연 비율과 독서 시간에 두었습니다. 관심을 끄는 입구와 읽기를 지속하는 경험을 함께 살피도록 설계했습니다.',
        ],
      },
    ],
    sources: [
      { label: '똑똑 README · 서비스 흐름 (비공개 저장소)', url: 'https://github.com/blackstarzck/ttokttok/blob/master/README.md' },
      { label: 'EPUB 뷰어와 독서 위치 복원', url: 'https://github.com/blackstarzck/ttokttok/blob/master/apps/client/src/components/reader/reader.tsx' },
      { label: '사용자 앱 기술 스택', url: 'https://github.com/blackstarzck/ttokttok/blob/master/apps/client/package.json' },
      { label: '관리자 앱 기술 스택', url: 'https://github.com/blackstarzck/ttokttok/blob/master/apps/admin/package.json' },
    ],
  },
  'on-the-book': {
    deck: '책의 내용을 화면에서 읽는 데서 출발해, 장면 속으로 들어가 직접 걸어 보는 독서 경험으로 확장했습니다. 독자의 3D 탐색과 운영자의 장면 편집·미리보기·공개를 하나의 콘텐츠 구조로 연결했습니다.',
    sections: [
      {
        eyebrow: '독자 경험',
        title: '책장에서 고른 작품이 직접 걸을 수 있는 장면으로 이어집니다',
        paragraphs: [
          '온더북의 첫 화면에서는 추천 배너와 책장, 장면별 탐색으로 작품을 발견합니다. 제목·작가 검색과 분류·정렬로 책을 고른 뒤 작품 상세에서 장면을 선택하고, 이 장면부터 걷기 버튼으로 3D 공간에 들어갑니다.',
          '공간 안에서는 바닥 클릭이나 방향키로 캐릭터를 움직이며, 휴대폰에는 방향 버튼을 제공합니다. 모델 가까이 다가가면 애니메이션과 글귀를 만나고 연결된 챕터를 따라 본문을 읽습니다. 마지막으로 방문한 장면을 브라우저에 기억해 다음 방문 때 이어 갈 수 있습니다.',
        ],
        workflow: {
          caption: '작품 탐색과 장면 속 읽기를 잇는 동선',
          steps: [
            { label: 'Browse', title: '작품 찾기', detail: '책장 검색·분류·정렬과 추천 배너로 책을 고릅니다.' },
            { label: 'Choose', title: '장면 선택', detail: '작품 상세에서 장면과 소개를 확인합니다.' },
            { label: 'Walk', title: '3D 공간에서 읽기', detail: '모델의 반응과 글귀를 만나며 챕터를 이동합니다.' },
          ],
        },
      },
      {
        eyebrow: '콘텐츠 운영',
        title: '장면을 편집하는 화면과 독자가 보는 공간을 맞췄습니다',
        paragraphs: [
          '관리자는 도서 표지·분류·추천 배너와 노출 순서를 관리하고, 챕터별 공간 크기·본문·색 분위기를 편집합니다. GLB 모델을 등록해 위치·크기·회전·접근 거리·동작을 지정하고 바닥 글귀와 이동 안내도 배치할 수 있습니다.',
          '관리자 미리보기와 독자 화면이 같은 좌표와 지형을 사용해 편집 결과를 확인할 수 있도록 했습니다. 임시 저장과 공개를 분리하고, 독자 화면은 가장 최근 공개본을 읽어 편집 중인 상태가 바로 노출되지 않도록 구성했습니다.',
        ],
        table: {
          caption: '독자 화면과 운영 도구가 공유하는 콘텐츠 단위',
          headers: ['콘텐츠', '관리자 작업', '독자 경험'],
          rows: [
            ['도서', '표지·분류·소개·노출 순서 편집', '책장 탐색과 작품 상세'],
            ['장면', '본문·공간 크기·썸네일 편집', '장면 선택과 챕터 이동'],
            ['3D 모델', '파일 등록·배치·접근 반응 설정', '모델에 다가가 동작과 글귀 확인'],
            ['공개본', '임시 저장·미리보기 후 공개', '마지막 공개 상태로 작품 열람'],
          ],
        },
      },
      {
        eyebrow: '기술 구성',
        title: '공통 3D 코드와 공개 데이터를 기준으로 두 화면을 연결했습니다',
        paragraphs: [
          'JavaScript와 Three.js로 3D 공간을 구성하고 Vite로 사용자·관리자 화면을 빌드합니다. 로컬 서버는 Express가 담당하며, 공통 렌더링·모델 처리·데이터 검증은 shared 영역에서 함께 사용합니다.',
          'Supabase에는 도서·챕터·모델 배치와 공개본을 보관하고 파일 저장소에 GLB와 이미지를 저장합니다. 사용자와 관리자 화면을 Vercel의 별도 프로젝트로 배포할 수 있도록 구성했습니다.',
          '수집과 보상, 퍼즐보다 공간 이동과 본문 읽기에 집중한 서비스입니다. 3D를 실행할 수 없는 환경에서는 설명과 본문을 읽는 대안을 제공하며, 현재 본문은 원작을 한국어로 축약·각색한 샘플입니다.',
        ],
      },
    ],
    sources: [
      { label: '온더북 README · 독서·관리 흐름', url: 'https://github.com/blackstarzck/on-the-book/blob/main/README.md' },
      { label: '공통 모델 접근 반응과 거리 계산', url: 'https://github.com/blackstarzck/on-the-book/blob/main/shared/experience.js' },
      { label: '사용한 기술과 실행 구성', url: 'https://github.com/blackstarzck/on-the-book/blob/main/package.json' },
    ],
  },
  'doc-merge': {
    deck: '프론트엔드와 백엔드 저장소를 함께 보면, 이 프로젝트는 단순한 엑셀 병합기가 아닙니다. 도서 납품 현황·기관·거래처·정산 장부를 하나의 데이터 흐름으로 묶고, 엑셀을 입력과 출력 형식으로 활용한 내부 업무 서비스입니다.',
    sections: [
      {
        eyebrow: '업무 문제',
        title: '하나의 납품 건이 여러 문서에서 따로 관리되고 있었습니다',
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
        title: '화면은 작업을 단순하게, 서버는 데이터의 연결을 책임지게 했습니다',
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
        title: '잘못된 엑셀을 조용히 저장하지 않도록 경계를 세웠습니다',
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
        title: '문서를 합치는 일은 결국 업무 규칙을 데이터 구조로 옮기는 일이었습니다',
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
        title: '관리자 화면의 핵심은 페이지 수가 아니라 업무의 연결입니다',
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
        title: '현황 확인에서 수정과 재확인까지 한 방향으로 이어지게 했습니다',
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
        title: '데이터가 많아져도 사용법은 반복되도록 공통 패턴을 만들었습니다',
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
        title: '관리자 서비스에 필요한 다양한 상호작용을 한 프론트엔드에 모았습니다',
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
        title: '복잡한 관리자 제품을 정보 구조부터 끝까지 설계한 기록입니다',
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
