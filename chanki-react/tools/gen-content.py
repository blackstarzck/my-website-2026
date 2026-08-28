# -*- coding: utf-8 -*-
"""김찬기 포트폴리오 콘텐츠 생성기.

원본(nicoborja) 콘텐츠를 대체한다. 이력서 PDF + GitHub 저장소 목록이 출처.
좌표/연결선/깊이는 여기서 계산해 emit 한다 — 손으로 숫자를 적지 않는다.
"""
import io, json, math, os

# 이 스크립트(tools/) 기준 상대경로 — 폴더명이 바뀌어도 따라온다.
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")

REGIONS = ["entry", "frontend", "backend", "ai", "product", "lab"]

COLOR = {
    "entry":    "#9B8FFF",
    "frontend": "#4FC3F7",
    "backend":  "#FF6A3D",
    "ai":       "#CFFF04",
    "product":  "#FF3D7A",
    "lab":      "#06D6C4",
}
RLAB = {
    "entry": "시작", "frontend": "프론트엔드", "backend": "서버 · 데이터",
    "ai": "AI 개발 프로세스", "product": "제품 · 협업", "lab": "실험실",
}
SLUG = {
    "entry": "chanki", "frontend": "frontend", "backend": "backend",
    "ai": "ai", "product": "product", "lab": "lab",
}
AGRAD = {
    "entry":    ["#9B8FFF", "#4FC3F7"],
    "frontend": ["#4FC3F7", "#06D6C4"],
    "backend":  ["#FF6A3D", "#FFB03D"],
    "ai":       ["#CFFF04", "#06D6C4"],
    "product":  ["#FF3D7A", "#9B8FFF"],
    "lab":      ["#06D6C4", "#4FC3F7"],
}

# 이미지 스트립(<id>-2.jpg …) 장수. 자세한 설명은 아래 MULTI 출력부 주석 참고.
MULTI = {"react-basics": 2}

# ── 노드 정의 ────────────────────────────────────────────────────────────
# (id, name, region, kicker, sum, body, cap, project|None, links|None)
N = []

def node(i, name, region, kicker, sum_, body, cap, project=None, url=None, urlLabel=None, links=None):
    d = dict(id=i, name=name, region=region, kicker=kicker)
    # sum 이 비면 필드를 아예 넣지 않는다 — 리전 노드는 갤러리가 body 를 쓴다.
    if sum_: d["sum"] = sum_
    d["body"] = body
    d["cap"] = cap
    if url: d["url"] = url
    if urlLabel: d["urlLabel"] = urlLabel
    if links: d["links"] = links
    if project: d["project"] = project
    N.append(d)

def P(role=None, duration=None, impact=None, scope=None, objectives=None, impacts=None, skills=None, story=None):
    d = {}
    if role: d["role"] = role
    if duration: d["duration"] = duration
    if impact: d["impact"] = impact
    if scope: d["scope"] = scope
    if objectives: d["objectives"] = objectives
    if impacts: d["impacts"] = impacts
    if skills: d["skills"] = skills
    if story: d["story"] = story
    return d

# ── entry ────────────────────────────────────────────────────────────────
node("chanki", "김찬기", "entry", "시작점",
     "퍼블리싱에서 시작해 프론트엔드를 지나 서버까지, 화면 뒤의 흐름을 이해하려고 계속 범위를 넓혀온 5년 9개월입니다.",
     "영어영문학을 전공하고 관광통역안내사로 일하다 개발로 넘어왔습니다. HTML·CSS·JavaScript 퍼블리싱에서 출발해 React·Angular·TypeScript 프론트엔드를 거쳐 NestJS·MySQL 서버 개발까지 경험했습니다. 화면만 만드는 것이 아니라 데이터가 전달되고 처리되는 전체 흐름을 이해하려 노력합니다. 기획자와 디자이너가 없는 환경에서도 기획·디자인·개발을 주도적으로 수행해 왔고, 최근에는 멀티 에이전트와 게이트 하네스로 AI를 개발 프로세스에 편입시키고 있습니다.",
     "김찬기 · 프론트엔드 개발자")
# 진입 노드는 페이지가 열리지 않는다 (원본과 같은 설계). 지도의 중심을 누르면
# 지도로 돌아가고, 프로필은 갤러리가 body 로 보여준다. 그래서 project(역할·기간·
# 성과·범위·스킬)와 links 는 어디에도 그려지지 않아 두지 않는다.
# 실제로 쓰이는 것은 넷뿐이다.
#   body    진입 갤러리 설명(.gdesc)
#   cap     갤러리 히어로 플레이스홀더
#   kicker  지도 호버 툴팁(#tip .kc)
#   sum     contact 페이지의 관련 카드 부제
# 같은 링크는 contact 노드에 있고 그 페이지는 열린다.

node("contact", "연락", "entry", "닿는 곳",
     "이력서와 GitHub, 기술 블로그. 그리고 메일.",
     "제안이나 문의는 메일로 주시면 가장 빠릅니다. 작업물은 GitHub에, 배우고 정리한 것들은 기술 블로그에 남기고 있습니다.",
     "연락처",
     # 이메일은 링크 칩이 아니라 메타 행(연락처)으로 보여준다 — engine/legacy.ts
     links=[["GitHub", "https://github.com/blackstarzck"],
            ["기술 블로그", "https://chan-chan2.tistory.com/"],
            ["이 사이트의 소스", "https://github.com/blackstarzck/my-website-2026"]])

# ── frontend ─────────────────────────────────────────────────────────────
node("frontend", "프론트엔드", "frontend", "핵심 영역",
     "",
     "5년 9개월간 프론트엔드를 중심에 두고 일했습니다. 화면을 만들기 전에 사용자 흐름과 상태 전이를 먼저 정리해야 좋은 결과가 나온다는 생각으로, 기획 단계부터 의견을 내는 편입니다. Figma 활용 수준도 일반 개발자 이상이라 디자이너와 직접 시안을 조율하거나 구성을 스스로 잡는 경우도 많았습니다. 관리자 도구처럼 매일 반복해 쓰는 화면일수록 작은 마찰이 누적된다고 보고, 반복 입력·일괄 적용·미리보기 같은 기능으로 운영 시간을 줄이는 데 관심이 많습니다. Jira·Tiga·ClickUp으로 일정을 관리하고, Redmine으로 이슈를 추적하며 다양한 팀 환경에 맞춰왔습니다.",
     "프론트엔드")

node("topik-user", "도토리 토픽 · 사용자단", "frontend", "케듀올 · 2026",
     "AI 피드백이 붙은 TOPIK 쓰기 학습 서비스의 사용자 화면을 설계하고 만들었습니다.",
     "AI 기반 TOPIK 학습 서비스에서 사용자단을 담당했습니다. 쓰기 문제 풀이와 AI 피드백, 추천, 학습 이력, 내 서재를 다국어 UI로 제공합니다. 학습 흐름 자체를 설계하는 일이라 화면 순서와 상태 전이를 먼저 정리한 뒤 구현에 들어갔습니다.",
     "도토리 토픽 사용자단",
     P(role="사용자단 프론트엔드 설계·개발",
       duration="2026.03 - 2026.08",
       impact="쓰기 연습부터 피드백까지 한 흐름으로 이어지는 학습 경험을 구현했습니다.",
       scope="Next.js·React·TypeScript 기반 반응형 웹. 학습 흐름 설계, 다국어 UI, 사용자단·관리자단 공통 데이터 계약 설계에 참여했습니다.",
       objectives=["TOPIK 쓰기 문제 풀이와 AI 피드백 흐름 구현",
                   "추천·학습 이력·내 서재로 이어지는 재방문 동선 설계",
                   "다국어 사용자 경험 제공"],
       skills=[["Next.js", "grew"], ["React · TypeScript", "core"], ["다국어 UI", "first"], ["Supabase 데이터 계약", "grew"]]))

node("topik-admin", "도토리 토픽 · 관리자단", "frontend", "케듀올 · 2026",
     "사용자·기관·문항은행·학습 분석·권한을 한곳에서 관리하는 운영 화면입니다.",
     "같은 서비스의 관리자단을 사용자단과 분리해 개발했습니다. 사용자·기관·문항·콘텐츠·학습 분석·알림·커머스·권한을 통합 관리합니다. 운영자가 쓰는 화면이라 데이터 밀도가 높고, 권한 경계를 잘못 그리면 바로 사고가 되기 때문에 경계를 문서로 남기는 데 신경 썼습니다.",
     "도토리 토픽 관리자단",
     P(role="관리자단 운영 화면·데이터 관리 기능 설계·개발",
       duration="2026.03 - 2026.08",
       impact="흩어져 있던 운영 업무를 하나의 관리자단으로 모았습니다.",
       scope="Vite·React·TypeScript·Ant Design 기반. Supabase 인증과 RLS/RPC, DB 마이그레이션 설계에 참여했습니다.",
       objectives=["사용자·기관·문항은행·콘텐츠 통합 관리",
                   "학습 분석·알림·커머스·권한 관리 기능 구현",
                   "사용자단과의 권한 경계를 문서화"],
       skills=[["Ant Design", "grew"], ["Vite", "grew"], ["Supabase RLS/RPC", "first"], ["React · TypeScript", "core"]]))

node("farm-3d", "센서 3D 시각화 대시보드", "frontend", "팜커넥트 · 2024",
     "30개가 넘는 센서의 온·습도를 3D로 띄워, 농장주가 온실 상태를 한눈에 보게 했습니다.",
     "숫자 표로는 온실 안에서 어디가 문제인지 알기 어렵다는 게 출발점이었습니다. 30개 이상 센서의 온·습도 데이터를 3D 공간에 배치해 위치와 값을 함께 보여주고, AI 권장값과 실시간 값을 나란히 비교할 수 있게 했습니다. 화면과 API를 함께 구현했습니다.",
     "센서 데이터 3D 대시보드",
     P(role="대시보드 화면·API 개발",
       duration="2024.03 - 2024.07",
       impact="복잡한 환경 정보를 공간 위에 올려 직관적으로 파악할 수 있게 했습니다.",
       scope="Angular·NestJS·TypeScript 기반. amCharts, RxJS, MySQL로 데이터 흐름과 시각화를 구현했습니다.",
       objectives=["30개 이상 센서의 온·습도를 3D로 시각화",
                   "AI 권장값과 실시간 환경 데이터를 비교하는 UI 설계"],
       skills=[["Angular", "grew"], ["amCharts · 3D 시각화", "first"], ["RxJS", "first"], ["NestJS", "grew"]],
       ))

node("connect-bee", "CONNECT BEE", "frontend", "팜커넥트",
     "수정벌 벌통의 센서 값을 보고 팬·열선·쿨러까지 한 화면에서 제어하는 하이브리드 앱입니다.",
     "수정벌 활동량과 벌통 센서 데이터를 확인하는 앱입니다. 내·외부 온도, 습도, CO2를 시각화하고 팬·열선·쿨러 제어 UI를 같은 화면에 두어, 상태 확인과 조치 사이를 오가지 않아도 되게 했습니다. 프론트엔드를 개발하고 하이브리드 앱으로 패키징해 출시했으며, 기획과 디자인, CES 2025 제출용 홍보 에셋 제작도 맡았습니다. CES 2025 혁신상을 받은 제품입니다.",
     "CONNECT BEE 하이브리드 앱",
     P(role="프론트엔드 개발 · 하이브리드 앱 패키징·출시 · 기획 · 디자인 · CES 2025 제출용 홍보 에셋 제작",
       impact="모니터링과 하드웨어 제어를 한 화면으로 합쳐 사용자 흐름을 줄였습니다.",
       scope="Angular·TypeScript 로 화면을 만들고 하이브리드 앱으로 패키징해 출시했습니다.",
       skills=[["하이브리드 앱 · 웹뷰", "first"], ["Angular", "grew"], ["하드웨어 제어 UI", "first"]]))

node("corp-sites", "법인별 홈페이지", "frontend", "케듀올 · 2025",
     "기획과 디자인부터 퍼블리싱, 배포까지 혼자 진행한 반응형 사이트입니다.",
     "Figma로 기획과 디자인을 직접 하고 React와 Tailwind로 퍼블리싱한 뒤 FTP로 배포까지 맡았습니다. 공통 UI 가이드와 컴포넌트 구조를 먼저 잡아 이후 법인이 추가될 때 재사용할 수 있게 했습니다.",
     "법인 홈페이지",
     P(role="기획·디자인·퍼블리싱·배포 1인 수행",
       duration="2025.05 - 2025.06",
       impact="디자이너 없이 기획부터 배포까지 완주했습니다.",
       scope="Figma 기획·디자인, React 18·Tailwind CSS 4·styled-components·GSAP 퍼블리싱, FTP 배포 운영.",
       skills=[["Figma 기획 · 디자인", "grew"], ["Tailwind CSS", "grew"], ["GSAP", "grew"], ["배포 운영", "first"]]))

node("dealer-web", "모두가딜러 · 웹서비스", "frontend", "모두가딜러 · 2020–2022",
     "중고차 서비스의 반응형 웹과 신규 콘텐츠를 만들며 퍼블리싱에서 프론트엔드로 넘어왔습니다.",
     "첫 직장이자 기본기를 만든 곳입니다. 반응형 웹·앱 UI를 구현하고 신규 콘텐츠 페이지를 개발했습니다. MySQL과 PHP로 차량 정보를 조회·가공해 노출하는 기능을 다뤘고, jQuery와 Ajax, async/await로 동적 콘텐츠와 인터랙션을 구현했습니다. Swiper.js와 GSAP을 도입해 기간을 줄이면서 표현 품질을 올렸습니다.",
     "모두가딜러 반응형 웹",
     P(role="반응형 웹 UI 구현 및 신규 콘텐츠 개발",
       duration="2020.06 - 2022.05",
       impact="쿠키 기반 개인화와 Skeleton UI로 체감 속도와 운영 편의성을 함께 개선했습니다.",
       scope="HTML·CSS·JavaScript·jQuery·Ajax, MySQL·PHP 데이터 조회, Swiper.js·GSAP·SmartEditor 도입.",
       skills=[["JavaScript · jQuery", "core"], ["Ajax · async/await", "grew"], ["GSAP · Swiper.js", "first"], ["MySQL · PHP", "first"]]))

node("dealer-admin", "모두가딜러 · 관리자", "frontend", "모두가딜러 · 2020–2022",
     "반복 입력이 많던 관리자 화면에 일괄 적용과 미리보기를 넣어 운영 시간을 줄였습니다.",
     "다양한 프로모션 유형을 카테고리로 묶고 조건별로 입력 필드를 노출·숨김 처리해 관리자 사용성을 개선했습니다. 반복 입력이 많은 차량 데이터 화면에는 일괄 적용을 추가했고, 게시 전 스타일을 확인할 수 있는 미리보기 UI를 제공해 검수 정확도를 높였습니다.",
     "관리자 페이지 개선",
     P(role="관리자 페이지 UI 개선 및 운영 효율화",
       duration="2020.06 - 2022.05",
       impact="반복 입력과 검수에 쓰이던 운영 시간을 줄였습니다.",
       objectives=["프로모션 유형 카테고리화와 조건부 입력 필드 UI 설계",
                   "차량 데이터 일괄 적용 기능 추가",
                   "게시 전 미리보기 UI 제공"],
       skills=[["관리자 UX", "grew"], ["JavaScript", "core"]],
       ))

# ── backend ──────────────────────────────────────────────────────────────
node("backend", "서버 · 데이터", "backend", "확장 중인 영역",
     "",
     "워터폴 프로세스에서 선행 작업을 기다리는 비용이 크다는 생각이 들었습니다. 이를 줄이고자 스스로 NestJS·TypeORM·MySQL·PostgreSQL을 익혀 백엔드 파트까지 소화했습니다. 최근에는 개발 스펙을 직접 결정할 수 있는 위치에서 빠른 개발과 시장 피드백을 우선해 서버리스 방향으로 전환했고, Vercel과 Supabase를 도입해 권한은 RLS·RPC로 DB 레벨에서 다루고 있습니다.",
     "서버 · 데이터")

node("doc-merge", "문서 통합 관리 서비스", "backend", "케듀올 · 2025",
     "같은 내용을 여러 엑셀에 반복 입력하던 업무를, 기획부터 서버까지 혼자 만들어 한 시스템으로 합쳤습니다.",
     "도서 납품과 관련된 여러 종류의 문서를 한 번에 관리하고 자동 처리하는 웹서비스입니다. 기존에는 서로 다른 엑셀과 문서에 같은 정보를 반복 입력해야 했습니다. 이 문제를 기획 단계부터 정의하고 프론트엔드와 백엔드를 모두 직접 만들어 해결했습니다. 실제 업무의 불편을 제품으로 바꾼 경험이라 가장 애착이 갑니다.",
     "문서 통합 관리 서비스",
     P(role="기획부터 프론트엔드·백엔드까지 전 과정 1인 개발",
       duration="2025.02 - 2025.07",
       impact="반복 입력과 그로 인한 입력 오류를 줄여 업무 시간을 단축했습니다.",
       scope="React 18·Vite 6·TypeScript 프론트엔드, Redux Toolkit·SWR 상태 관리, NestJS·TypeORM·PostgreSQL API·DB 설계.",
       objectives=["흩어진 문서 양식을 하나의 시스템으로 통합",
                   "대용량 데이터 테이블과 고급 필터·정렬 제공",
                   "문서 병합과 엑셀 처리를 자동화"],
       impacts=["여러 문서에 같은 정보를 반복 입력하던 과정을 제거",
                "입력 오류 감소",
                "Ant Design·Tailwind·styled-components로 관리용 UI/UX 구축"],
       skills=[["NestJS · TypeORM", "first"], ["PostgreSQL", "first"], ["Redux Toolkit · SWR", "grew"],
               ["AG Grid", "first"], ["ExcelJS", "first"], ["React · TypeScript", "core"]],
       ))

node("supabase", "Supabase 인증 · RLS", "backend", "케듀올 · 2026",
     "권한을 애플리케이션이 아니라 DB 레벨에서 다루는 방식을 처음 적용했습니다.",
     "도토리 토픽에서 Supabase 기반 인증과 RLS(Row Level Security), RPC, DB 마이그레이션을 설계했습니다. 사용자단과 관리자단이 같은 DB를 쓰기 때문에 권한 경계를 어디에 둘지가 핵심이었고, 애플리케이션 코드가 아니라 DB 정책으로 막는 쪽을 택했습니다.",
     "Supabase 인증 · 권한",
     P(role="인증·RLS/RPC·마이그레이션 설계",
       impact="사용자단과 관리자단이 공유하는 데이터의 권한 경계를 DB 레벨에서 강제했습니다.",
       skills=[["Supabase", "first"], ["RLS · RPC", "first"], ["DB 마이그레이션", "grew"]]))

node("farm-api", "스마트팜 관리자 · API", "backend", "팜커넥트",
     "농장·센서 정보를 관리하고 AI가 환경값을 안내할 수 있도록 데이터 구조를 잡았습니다.",
     "스마트팜을 운영하는 농장주, 농장, 센서 정보를 관리하는 관리자 페이지를 개발하고 유지보수했습니다. 입력된 데이터를 바탕으로 AI가 온도·습도·CO2·배액량·환기 시간을 안내할 수 있도록 관리 구조를 구현하고, 운영자가 필요한 정보를 빠르게 찾도록 화면과 API를 함께 개선했습니다.",
     "스마트팜 관리자 페이지",
     P(role="관리자 페이지 개발 및 유지보수, 화면·API 개선",
       impact="AI 환경 안내가 동작할 수 있는 데이터 관리 구조를 만들었습니다.",
       skills=[["NestJS", "grew"], ["MySQL", "grew"], ["Angular", "grew"]]))

# ── ai ───────────────────────────────────────────────────────────────────
node("ai", "AI 개발 프로세스", "ai", "현재 집중",
     "",
     "생성형 AI를 요구사항 정리, 구현, 코드 리뷰, 테스트, 문서화에 활용합니다. 다만 결과를 그대로 받는 대신 요구사항·실제 동작·테스트 결과·Git 이력으로 검증하는 루프를 두는 데 관심이 있습니다. AI로 구현 가능한 범위가 빠르게 넓어지는 만큼, 무엇을 하지 않을지 정하는 일이 더 중요해졌다고 생각합니다.",
     "AI 개발 프로세스")

node("gate-harness", "요구사항 게이트 하네스", "ai", "실무 적용",
     "요구사항을 통과 기준으로 바꿔, 충족하지 못한 변경이 다음 단계로 넘어가지 못하게 막습니다.",
     "AI가 만든 결과물을 '그럴듯하다'가 아니라 '요구사항을 충족했다'로 판정하려면 기준이 코드 바깥에 명시돼 있어야 합니다. 요구사항을 게이트로 정의하고 통과하지 못하면 진행되지 않도록 하네스를 구성했습니다.",
     "요구사항 게이트 하네스",
     P(role="게이트 하네스 설계·적용",
       impact="AI 결과를 주관적 판단이 아니라 명시된 기준으로 판정하게 했습니다.",
       skills=[["요구사항 명세", "grew"], ["하네스 설계", "first"]]),
     url="https://github.com/blackstarzck/requirement-gated-python-harness", urlLabel="GitHub에서 보기")

node("multi-agent", "멀티 에이전트 오케스트레이션", "ai", "실무 적용",
     "PM·설계·개발·QA 역할을 나눠 맡기고, 사이에 피드백 루프를 뒀습니다.",
     "하나의 에이전트에게 전부 맡기면 검토자가 없어집니다. PM·설계·개발·QA로 역할을 분담하고 각 단계 사이에 피드백 루프를 설계했습니다. 컨텍스트 인수인계를 명시적으로 처리해 단계가 넘어갈 때 정보가 유실되지 않게 하는 것이 핵심이었습니다.",
     "멀티 에이전트 오케스트레이션",
     P(role="역할 분담 구조와 피드백 루프 설계",
       impact="검토 없이 진행되던 단계에 독립적인 관점을 넣었습니다.",
       skills=[["에이전트 오케스트레이션", "first"], ["컨텍스트 인수인계", "first"]]))

node("verify-loop", "검증 루프", "ai", "실무 적용",
     "타입체크·린트·테스트·빌드·보안·배포를 게이트로 엮어 변경 품질을 확인합니다.",
     "도토리 토픽에서 Vitest와 Playwright, typecheck, lint, build를 보안·배포 게이트와 연계해 변경마다 품질을 검증하도록 구성했습니다. 사람이 매번 확인하는 대신 통과 여부가 기계적으로 드러나게 하는 것이 목적이었습니다.",
     "검증 루프",
     P(role="테스트·정적분석·배포 게이트 연계",
       impact="변경 품질을 사람의 기억이 아니라 파이프라인이 보증하게 했습니다.",
       skills=[["Vitest · Playwright", "grew"], ["CI 게이트 구성", "first"]]))

node("figma-gen", "Figma → React 생성기", "ai", "개인 프로젝트",
     "디자인 토큰을 동기화하고 컴포넌트를 만들어내는 UI 라이브러리 스타터입니다.",
     "Figma의 디자인 토큰을 코드로 동기화하고 shadcn 스타일의 기본 컴포넌트를 생성하는 스타터를 만들었습니다. npm 릴리스 자동화까지 포함해, 디자인과 코드 사이를 손으로 옮기던 과정을 줄이는 것이 목표였습니다.",
     "Figma 기반 UI 라이브러리",
     P(role="개인 프로젝트 · 설계 및 구현",
       skills=[["디자인 토큰 동기화", "first"], ["npm 릴리스 자동화", "first"], ["TypeScript", "core"]]),
     url="https://chanchan2.vercel.app", urlLabel="디자인 시스템 문서 열기",
     links=[["저장소", "https://github.com/blackstarzck/chanchan2"]])

node("my-skills", "개인 스킬 라이브러리", "ai", "개인 프로젝트",
     "반복해서 쓰는 작업 방식을 스킬로 정리해 재사용합니다.",
     "매번 같은 방식으로 하게 되는 작업들 — 리뷰 절차, 하네스 구성, 문서 정리 — 을 스킬 형태로 모아두고 필요할 때 꺼내 씁니다. 개인 도구지만 팀에 적용할 수 있는 형태로 다듬는 중입니다.",
     "개인 스킬 라이브러리",
     P(role="개인 프로젝트",
       skills=[["작업 방식의 도구화", "grew"]]))
# ↑ 저장소가 비공개라 링크를 두지 않는다. 공개로 돌리면
#   url="https://github.com/blackstarzck/my-skills", urlLabel="GitHub에서 보기" 를 되살리면 된다.

node("ai-squads", "비개발자용 에이전트 IDE", "ai", "개인 프로젝트",
     "AI 에이전트를 지휘해 서비스를 만들고 고칠 수 있게 하는 비주얼 IDE입니다.",
     "개발을 모르는 사람이 AI 에이전트에게 일을 시켜 서비스를 개발하고 유지보수할 수 있게 하는 플랫폼입니다. Next.js와 FastAPI 위에 LangGraph로 에이전트 그래프를 구성했습니다. 멀티 에이전트를 제 작업에 쓰는 것과, 그 방식을 남이 쓸 수 있는 화면으로 만드는 것은 다른 문제였습니다.",
     "비개발자용 에이전트 IDE",
     P(role="개인 프로젝트 · 설계 및 구현",
       skills=[["LangGraph", "first"], ["FastAPI", "first"], ["Next.js", "core"]]),
     url="https://github.com/blackstarzck/ai-squads", urlLabel="GitHub에서 보기")

# ── product ──────────────────────────────────────────────────────────────
node("product", "제품 · 협업", "product", "일하는 방식",
     "",
     "기획자와 디자이너가 없는 환경에서 일한 시간이 길어, 무엇을 만들지 정하는 일과 만드는 일을 함께 해왔습니다. 기술적인 내용을 상대방의 눈높이에 맞게 설명하는 것, 서로 다른 관점 사이를 조율하는 것이 강점이라고 생각합니다.",
     "제품 · 협업")

node("dadoke", "DADOKe 전자책 · 오디오북", "product", "케듀올 · B2C",
     "개발은 외주에 맡기고 기획·요구사항 정의·커뮤니케이션을 총괄했습니다.",
     "B2C 전자책·오디오북 플랫폼입니다. 밀리의서재, 리디북스, 아마존 킨들 등 주요 서비스를 벤치마킹해 시장과 경쟁사를 분석했습니다. 개발은 베트남 외주업체에 위탁하고 기획과 요구사항 정의, 커뮤니케이션을 총괄했습니다.",
     "DADOKe 플랫폼",
     P(role="시장조사·기획·요구사항 정의·외주 커뮤니케이션 총괄",
       impact="직접 구현하지 않는 프로젝트에서 요구사항을 전달하고 조율하는 경험을 했습니다.",
       scope="밀리의서재·리디북스·아마존 킨들 벤치마킹, 베트남 외주업체와의 요구사항 조율.",
       skills=[["시장 · 경쟁사 분석", "first"], ["외주 커뮤니케이션", "grew"], ["요구사항 정의", "grew"]]))

node("legacy-cleanup", "레거시 정리 · 성능 개선", "product", "모두가딜러 · 2022",
     "불필요한 호출과 쓰지 않는 자산을 걷어내 유지보수 비용을 줄였습니다.",
     "불필요한 Ajax 호출을 제거하고 MySQL SELECT문을 정리해 데이터 조회 구조를 단순화했습니다. 쓰이지 않는 common.js와 style.css를 걷어내 프론트엔드 자산을 경량화했고, 네이버·구글 애널리틱스와 앱스플라이어, 카카오 픽셀 등 추적 코드를 재정비해 스크립트 관리 효율을 개선했습니다.",
     "레거시 정리",
     P(role="성능 개선 및 레거시 코드 정리",
       duration="2022.01 - 2022.05",
       skills=[["성능 개선", "grew"], ["레거시 정리", "first"]]))

node("docs-comm", "문서화 · 비개발 직군 협업", "product", "지속",
     "기능과 정책을 문서로 남기고, 비개발 직군이 읽을 수 있는 자료를 따로 만들었습니다.",
     "서비스 기능과 정책을 문서화하고 비개발 직군과의 커뮤니케이션 자료를 별도로 제작해 협업 효율을 높였습니다. 최근에는 반응형·다국어 UI와 사용자·관리자 권한 경계를 문서화해 유지보수성과 운영 안정성을 함께 올리는 데 적용하고 있습니다.",
     "문서화 · 협업",
     P(role="기능·정책 문서화 및 협업 자료 제작",
       skills=[["기술 문서화", "grew"], ["비개발 직군 커뮤니케이션", "core"]]))

node("english", "영어 · 통역안내사", "product", "배경",
     "영어영문학 전공과 관광통역안내사 경력. 해외 외주와 영문 기술 문서를 다루는 기반입니다.",
     "성결대학교 영어영문학과를 졸업하고 2014년 관광통역안내사(영어) 자격을 취득했습니다. TOEIC 920. 여행업에서 고객과 국내외 협력업체 사이를 잇는 일을 하며 신뢰를 형성하고 소통하는 방법을 배웠습니다. 지금은 영문 기술 문서를 읽고 활용하는 일, 해외 외주 개발사와 요구사항을 조율하는 일에 그 경험이 쓰입니다.",
     "영어영문학 · 관광통역안내사",
     P(role="영어영문학 전공 · 관광통역안내사(영어)",
       duration="성결대학교 2008.03 - 2014.03 · 자격 2014.12",
       skills=[["영문 기술 문서", "core"], ["해외 외주 조율", "grew"]]))

# ── lab ──────────────────────────────────────────────────────────────────
node("lab", "실험실", "lab", "손이 기억하는 것",
     "",
     "회사 일과 별개로 계속 만들어 온 것들입니다. 파티클과 캔버스, 아이소메트릭에서 시작해 Blender로 3D 모델을 직접 만들고 Three.js·React Three Fiber로 웹에 올리는 것까지 이어졌습니다. 아이디어가 생기면 AI로 빠르게 프로토타입을 만들어 검증하는 흐름도 자주 씁니다. 당장 쓸 데가 없어도 손으로 만들어 보면 남는 게 있다고 생각합니다. 이 포트폴리오 사이트도 그 연장선입니다.",
     "실험실",
     # NOTE: area 노드의 links 는 렌더되지 않는다 — 갤러리는 body 만 쓰고
     #       page 는 열리지 않는다. 보이게 하려면 contact 로 옮겨야 한다.
     links=[["GitHub에서 전부 보기", "https://github.com/blackstarzck?tab=repositories"]])

node("canvas-lab", "캔버스 · 파티클", "lab", "실험",
     "한 저장소에 예제를 여섯 개 넣어두고 입자를 다루는 방법을 하나씩 바꿔가며 실험했습니다.",
     "particle-colorful-stars 한 저장소에 예제를 여섯 개 넣어두고 하나씩 바꿔가며 실험했습니다. 기본 Geometry로 만든 파티클에서 시작해 랜덤 배치, Point 좌표마다 메쉬를 생성하는 것, 형태가 바뀌는 이미지 패널까지 갔습니다. 수천 개 입자를 프레임마다 그릴 때 무엇이 병목이 되는지 직접 확인해 보는 것이 목적이었습니다. 지금 보고 계신 이 지도도 같은 계열입니다.",
     "캔버스 · 파티클 실험",
     P(role="개인 실험", skills=[["Canvas 2D", "grew"], ["파티클 시스템", "first"]]),
     links=[["파티클 데모 열기", "https://blackstarzck.github.io/particle-colorful-stars/"],
            ["저장소", "https://github.com/blackstarzck/particle-colorful-stars"]])

node("multicanvas-lab", "캔버스 여러 개", "lab", "실험",
     "WebGL 렌더러 하나로 페이지 곳곳의 캔버스 자리를 채웁니다.",
     "캔버스마다 렌더러를 하나씩 두면 브라우저가 허용하는 WebGL 컨텍스트 수에 금방 닿습니다. multicanvas는 렌더러를 하나만 두고, 페이지에 흩어진 자리표시자 세 곳의 위치를 매 프레임 getBoundingClientRect로 읽어 setScissor와 setViewport로 그 영역만 잘라 그립니다. 자리가 화면 밖으로 밀려나면 아예 그리지 않고 넘어갑니다. 캔버스가 여러 개인 것처럼 보이지만 실제로는 하나입니다. 장면마다 GLTF 모델과 자기 카메라를 따로 가집니다.",
     "캔버스 여러 개 · 실험",
     P(role="개인 실험",
       skills=[["WebGL 컨텍스트 관리", "first"], ["three.js", "grew"], ["뷰포트 컬링", "first"]]),
     links=[["데모 열기", "https://blackstarzck.github.io/multicanvas/"],
            ["저장소", "https://github.com/blackstarzck/multicanvas"]])

node("scroll-3d", "스크롤 연동 3D", "lab", "실험",
     "스크롤 위치에 3D 장면을 묶어, 페이지를 내리면 장면 안으로 들어갑니다.",
     "소스에 적어둔 주제 그대로 '스크롤에 따라 움직이는 3D 페이지'입니다. GLTF로 불러온 집 모델을 배치하고 window.scrollY 값을 gsap으로 카메라에 연결했습니다. 스크롤을 내리면 장면 안을 이동하는 것처럼 보입니다. 값이 변하는 일과 화면에 그리는 일을 어디서 나눌지 정해야 하는데, 이 포트폴리오의 지도도 결국 같은 문제를 푼 것입니다.",
     "스크롤 연동 3D · 실험",
     P(role="개인 실험",
       skills=[["GSAP", "first"], ["GLTF 로딩", "grew"], ["스크롤 연동", "first"]]),
     links=[["데모 열기 · 스크롤해 보세요", "https://blackstarzck.github.io/scroll-page/"],
            ["저장소", "https://github.com/blackstarzck/scroll-page"]])

node("three-lab", "3D · 아이소메트릭", "lab", "실험",
     "아이소메트릭 뷰와 3D 모델, 카메라 컨트롤을 다뤄본 저장소들입니다.",
     "isosmetric-01·02는 아이소메트릭 방을 하나씩 지어 본 것이고, custom_model은 Blender로 만든 모델을 웹에 올려 조명을 붙인 것, controls-01은 카메라를 손으로 움직여 본 것입니다. ilbunidiary는 직교 카메라로 방을 내려다보며 Raycaster로 바닥을 찍어 캐릭터를 걷게 했습니다. 이 경험이 이후 팜커넥트에서 센서 데이터를 3D로 시각화할 때 직접 쓰였고, 최근에는 game-cabinet에서 React Three Fiber로 이어졌습니다. 네 개 모두 아래에서 바로 돌려볼 수 있습니다.",
     "3D · 아이소메트릭 실험",
     P(role="개인 실험",
       skills=[["3D 렌더링", "grew"], ["카메라 컨트롤", "first"], ["직교 카메라", "first"]]),
     links=[["아이소메트릭 방 01", "https://blackstarzck.github.io/isosmetric-01/"],
            ["아이소메트릭 방 02", "https://blackstarzck.github.io/isosmetric-02/"],
            ["Blender 모델 + 조명", "https://blackstarzck.github.io/custom_model/"],
            ["걸어다니는 방", "https://blackstarzck.github.io/ilbunidiary/"]])

node("game-lab", "게임 · 인터랙션", "lab", "실험",
     "브라우저에서 도는 격투 게임과 3D 아케이드 캐비닛, 1인칭 조작 실험입니다.",
     "neon-fist는 백엔드도 외부 에셋도 없이 Vite와 Canvas 2D만으로 만든 1:1 격투 게임입니다. 배경 한 장과 파이터 키프레임을 빼면 UI·파티클·플래시·게이지를 전부 코드로 그리고, 타격음부터 배경 음악까지 Web Audio API로 실시간 합성합니다. game-cabinet은 React Three Fiber로 3D 아케이드 캐비닛을 세우고 그 안에서 웹게임을 실행합니다. bridge는 유리다리를 건너는 게임인데, 밟는 판이 깨지고 떨어지는 것을 눈속임이 아니라 cannon 물리 엔진으로 처리했습니다. 그 전에는 lets-fps와 first-person-perspective로 1인칭 조작을, game-cards로 상태 전이를 실험했습니다. 게임은 프레임마다 상태가 바뀌기 때문에 UI 개발과는 다른 근육을 씁니다.",
     "게임 · 인터랙션 실험",
     P(role="개인 실험",
       skills=[["Canvas 2D", "grew"], ["Web Audio API", "first"],
               ["물리 엔진(cannon)", "first"], ["게임 루프", "first"]]),
     links=[["NEON FIST 플레이", "https://neon-fist.vercel.app"],
            ["GAME CABINET 열기", "https://game-cabinet.vercel.app"],
            ["유리다리 건너기", "https://blackstarzck.github.io/bridge/"],
            ["1인칭 시점 실험", "https://blackstarzck.github.io/first-person-perspective/"]])

node("trading-lab", "자동매매 시스템", "lab", "2026",
     "업비트 자동매매를 여덟 개 저장소에 걸쳐 만들고 다시 만든 기록입니다.",
     "2026년 2월부터 6월까지 여덟 개 저장소로 업비트 자동매매를 만들고 다시 만들었습니다 — zenith와 v2·v3·v4, coin-lab과 v2, profitpal, 그리고 전략을 문서로 정리한 Haley입니다. zenith는 Python 봇과 React UI가 REST 없이 Supabase를 공유 채널로 씁니다 — 봇이 쓰면 UI가 realtime으로 읽고, UI가 전략 파라미터를 바꾸면 봇이 폴링해 반영합니다. v4에서는 연결 상태를 LIVE·DELAYED·RECONNECTING·ERROR·PAUSED 상태머신으로 정리하고, 타임아웃과 지터를 섞은 백오프 재시도, runId와 seq로 메시지 중복·순서역전을 막는 장치를 넣었습니다. profitpal은 차트·뉴스·고래 지갑을 각각 보는 에이전트의 판단을 의장이 취합하는 위원회 구조입니다. 돈이 걸린 코드라 틀리면 바로 드러납니다. 손실 리포트와 원인 분석을 남기고 다음 버전으로 넘어간 기록이 저장소에 그대로 있습니다.",
     "업비트 자동매매 · 2026",
     P(role="개인 프로젝트 · 설계 및 구현",
       duration="2026.02 - 2026.06",
       skills=[["Python", "grew"], ["실시간 상태 설계", "first"],
               ["재시도 · 순서 보증", "first"], ["Supabase", "grew"]]),
     links=[["zenith · 자동매매 본체", "https://github.com/blackstarzck/zenith"],
            ["zenith-v4 · 모노레포 재작성", "https://github.com/blackstarzck/zenith-v4"],
            ["coin-lab-v2", "https://github.com/blackstarzck/coin-lab-v2"],
            ["profitpal · 에이전트 위원회", "https://github.com/blackstarzck/profitpal"]])

node("space-3d", "3D 공간 만들기", "lab", "실험",
     "마을 하나를 통째로 세워 걸어 다닐 수 있게 만든 3D 씬입니다.",
     "예제 하나를 돌려보는 데서 멈추지 않고, 3D 앱을 구조로 짜 보려고 만든 것입니다. Experience를 싱글턴으로 두고 카메라·렌더러·리소스 로더·크기 대응을 각각 분리했습니다. 씬에서 바꾼 값은 localStorage에 남겨 다시 들어와도 유지됩니다. 눈이 쌓인 마을을 세우고 그 안을 돌아다닐 수 있게 했습니다.",
     "3D 공간 · 실험",
     P(role="개인 실험",
       skills=[["3D 앱 구조 설계", "first"], ["three.js", "grew"], ["리소스 로딩", "grew"]]),
     links=[["마을 걸어보기", "https://blackstarzck.github.io/my-space/"],
            ["저장소", "https://github.com/blackstarzck/my-space"]])

node("react-basics", "React 학습기", "lab", "2022",
     "2022년에 스무 개 남짓 남긴 연습 저장소들, 하나씩 떼어 익히던 시기의 기록입니다.",
     "2022년에 남긴 연습 저장소가 스무 개 남짓입니다. react-practice1부터 7까지, react-router-practice, react-styled-component, react-swiper로 라우터·상태·스타일링을 하나씩 떼어 봤습니다. React 바깥으로도 나갔습니다 — react-face-detect로 face-api.js를 붙여 얼굴을 잡아봤고, data_structure에서는 연결 리스트를 직접 짜봤고, drag-n-drop과 canvas-test는 브라우저 API만으로 만들었습니다. 지금 보면 조각난 예제들이지만, 이때 하나씩 떼어 연습한 것들이 이후 실무에서 조합되어 쓰였습니다. 지우지 않고 두는 이유입니다.",
     "React 학습기 · 2022",
     P(role="학습",
       duration="2022",
       skills=[["React", "first"]]),
     links=[["명함 제작기 데모", "https://blackstarzck.github.io/business-card/"],
            ["react-todos 저장소", "https://github.com/blackstarzck/react-todos"],
            ["연습 저장소 목록", "https://github.com/blackstarzck?tab=repositories&q=react-practice"]])

# ── 좌표 계산 ────────────────────────────────────────────────────────────
AREA_ANGLE = {"frontend": 118, "ai": 62, "backend": 348, "product": 192, "lab": 268}
AREA_R = {"frontend": 4.4, "ai": 4.4, "backend": 4.6, "product": 4.6, "lab": 4.2}
AREA_SIZE = {"frontend": 1.42, "ai": 1.30, "backend": 1.22, "product": 1.22, "lab": 1.18}

by_region = {}
for n in N:
    by_region.setdefault(n["region"], []).append(n)

pos = {}
pos["chanki"] = (0.0, 0.23, 1.55)
pos["contact"] = (0.0, 2.05, 0.72)

for reg, ang in AREA_ANGLE.items():
    a = math.radians(ang)
    ax, ay = AREA_R[reg] * math.cos(a), AREA_R[reg] * math.sin(a)
    pos[reg] = (ax, ay, AREA_SIZE[reg])
    kids = [n for n in by_region[reg] if n["id"] != reg]
    k = len(kids)
    # 자식은 area 노드 바깥쪽 부채꼴로 펼친다 (중심에서 멀어지는 방향).
    #
    # 각도를 넓히면 옆 리전 부채꼴과 부딪힌다 — 리전 사이 간격이 56~80도 뿐이다.
    # 그래서 각도는 그대로 두고 반지름을 3단으로 어긋나게 둔다. 이웃한 두 자식이
    # 같은 반지름에 놓이지 않으므로 지도 라벨이 세로로 갈라져 겹치지 않는다.
    # (2단 0.55 로는 lab 이 8개가 되면서 '스크롤 연동 3D' 와 '3D · 아이소메트릭'
    #  라벨이 붙어 읽히지 않았다.)
    spread = 78 if k > 4 else 62
    for j, kid in enumerate(kids):
        t = 0.5 if k == 1 else j / (k - 1)
        kang = math.radians(ang - spread / 2 + spread * t)
        kr = AREA_R[reg] + 1.95 + 0.9 * (j % 3)
        pos[kid["id"]] = (kr * math.cos(kang), kr * math.sin(kang), 0.62 + 0.10 * (j % 3))

for n in N:
    x, y, r = pos[n["id"]]
    n["x"], n["y"], n["r"] = round(x, 2), round(y, 2), round(r, 2)

# ── 엣지 ─────────────────────────────────────────────────────────────────
E = [["chanki", r] for r in AREA_ANGLE] + [["chanki", "contact"]]
for reg in AREA_ANGLE:
    for kid in by_region[reg]:
        if kid["id"] != reg:
            E.append([reg, kid["id"]])
# 서사를 잇는 교차 연결 — 지도에서 성장 경로가 보이도록
E += [
    ["dealer-web", "dealer-admin"], ["dealer-admin", "legacy-cleanup"],
    ["farm-3d", "three-lab"], ["farm-3d", "farm-api"],
    ["connect-bee", "farm-api"],
    ["topik-user", "topik-admin"], ["topik-admin", "supabase"], ["topik-user", "supabase"],
    ["topik-admin", "verify-loop"], ["doc-merge", "corp-sites"],
    ["gate-harness", "multi-agent"], ["multi-agent", "verify-loop"],
    ["figma-gen", "corp-sites"], ["my-skills", "gate-harness"],
    ["react-basics", "dealer-web"], ["canvas-lab", "three-lab"],
    ["three-lab", "game-lab"], ["trading-lab", "supabase"],
    ["canvas-lab", "multicanvas-lab"], ["multicanvas-lab", "three-lab"],
    ["scroll-3d", "three-lab"], ["space-3d", "three-lab"], ["space-3d", "game-lab"],
    ["ai-squads", "multi-agent"],
    ["english", "dadoke"], ["docs-comm", "dealer-admin"],
    ["doc-merge", "backend"], ["dadoke", "topik-user"],
]

# ── SPINE (서사 순서) ────────────────────────────────────────────────────
SPINE = ["chanki", "contact", "english", "react-basics", "frontend", "dealer-web", "dealer-admin",
         "legacy-cleanup", "canvas-lab", "multicanvas-lab", "scroll-3d", "three-lab",
         "space-3d", "game-lab", "trading-lab", "lab",
         "farm-3d", "connect-bee", "farm-api", "backend", "doc-merge", "supabase",
         "corp-sites", "figma-gen", "dadoke", "docs-comm", "product",
         "topik-user", "topik-admin", "ai", "gate-harness", "multi-agent",
         "verify-loop", "my-skills", "ai-squads"]

# ── ZMAP (깊이) ──────────────────────────────────────────────────────────
DEPTH = {"entry": 0.0, "frontend": 0.85, "ai": 1.15, "backend": -0.35,
         "product": -0.75, "lab": 0.35}
ZMAP = {}
for n in N:
    base = DEPTH[n["region"]]
    if n["id"] == n["region"] or n["id"] == "chanki":
        ZMAP[n["id"]] = round(base, 2)
    else:
        idx = [k["id"] for k in by_region[n["region"]] if k["id"] != n["region"]].index(n["id"])
        ZMAP[n["id"]] = round(base + (0.18 * (idx % 3) - 0.18), 2)

# ── 무결성 검사 ──────────────────────────────────────────────────────────
ids = {n["id"] for n in N}
assert len(ids) == len(N), "중복 id"
assert len(N) == 35, f"노드 수 {len(N)}"
for a, b in E:
    assert a in ids and b in ids, f"엣지 미상 노드: {a}-{b}"
assert set(SPINE) == ids, f"SPINE 누락: {ids - set(SPINE)} / 초과: {set(SPINE) - ids}"
assert set(ZMAP) == ids
for reg in REGIONS:
    if reg != "entry":
        assert any(n["id"] == reg for n in N), f"area 노드 없음: {reg}"

# ── 파일 출력 ────────────────────────────────────────────────────────────
BANNER = "// 김찬기 포트폴리오 콘텐츠.\n// 생성: tools/gen-content.py (이력서 + GitHub 저장소 기반)\n"
j = lambda v: json.dumps(v, ensure_ascii=False, indent=2)

def w(name, body):
    io.open(os.path.join(OUT, name), "w", encoding="utf-8", newline="\n").write(body)
    print(f"  {name}")

w("nodes.ts", f"{BANNER}import type {{ ContentNode }} from './types'\n\nexport const NODES: ContentNode[] = {j(N)}\n")
w("edges.ts", f"{BANNER}\nexport const EDGES: [string, string][] = {j(E)}\n")
w("spine.ts", f"{BANNER}\nexport const SPINE: string[] = {j(SPINE)}\n")
w("zmap.ts", f"{BANNER}\nexport const ZMAP: Record<string, number> = {j(ZMAP)}\n")
w("config.ts", "export const CONTACT_EMAIL = 'bucheongosok@gmail.com'\n")

TREECOLS = [[r, SLUG[r]] for r in REGIONS if r != "entry"]
w("regions.ts", f"""{BANNER}import type {{ Region }} from './types'

export const COLOR: Record<Region, string> = {j(COLOR)}

export const RLAB: Record<Region, string> = {j(RLAB)}

export const SLUG: Record<Region, string> = {j(SLUG)}

export const AGRAD: Record<Region, [string, string]> = {j(AGRAD)}

export const TREECOLS: [Region, string][] = {j(TREECOLS)}

/** 라이트 테마 전용 이미지가 있는 노드. 아직 없음. */
export const THEMED: Record<string, number> = {{}}

/**
 * 이미지 스트립이 있는 노드와 장수. <id>.jpg 다음에 <id>-2.jpg … 를 읽는다.
 * react-basics 2 = react-todos(대표) + react-practice6(네비게이션 바).
 * react-practice6 은 저장소에 빌드 산출물만 있어 소스를 읽을 수 없다.
 * 그래서 노드로 두지 않고 이미지로만 남겼다.
 */
export const MULTI: Record<string, number> = {j(MULTI)}

/** 카드 이미지를 다른 파일명으로 쓰는 노드. 아직 없음. */
export const CARD_IMG: Record<string, string> = {{}}

/** 영상(<id>.mp4)이 있는 노드. 아직 없음. */
export const VID: Record<string, number> = {{}}

export const PARENTS: ReadonlySet<Region> = new Set({j([r for r in REGIONS if r != "entry"])} as Region[])

export const AREAS: ReadonlySet<string> = new Set({j([r for r in REGIONS if r != "entry"])})
""")

w("types.ts", f"""export type Region = {' | '.join(repr(r).replace("'", "'") for r in REGIONS)}

export type SkillLevel = 'core' | 'grew' | 'first'

export type ProjectFields = {{
  role?: string
  duration?: string
  impact?: string
  scope?: string
  objectives?: string[]
  impacts?: string[]
  skills?: [string, SkillLevel][]
  story?: string
}}

export type ContentNode = {{
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
  project?: ProjectFields
}}
""")

print(f"\n  노드 {len(N)} / 엣지 {len(E)} / 리전 {len(REGIONS)}")
for r in REGIONS:
    print(f"    {r:9s} {len(by_region.get(r, []))}")
