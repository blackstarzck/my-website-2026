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

GH = "https://github.com/blackstarzck/"
PG = "https://blackstarzck.github.io/"

# 저장소가 여럿인 노드는 프로젝트 카드로 보여준다. 카드 하나에 화면·이름·설명·
# 스킬·코드·데모가 다 들어가므로, 카드가 있는 노드에서는 links/repos/이미지
# 스트립을 두지 않는다 — 같은 것을 네 번 늘어놓던 것이 그 셋이었다.
def card(repo, desc, skills, demo=None, shot=None, note=None, code=None, demo_label=None):
    d = {"repo": repo, "desc": desc, "skills": skills}
    if demo: d["demo"] = demo
    if shot: d["shot"] = shot
    if note: d["note"] = note
    if code is not None: d["code"] = code
    if demo_label: d["demoLabel"] = demo_label
    return d

CARDS = {
"corp-sites": [
    card("케듀올", "베트남과 한국을 잇는 유학·한국어교육·출판·에듀테크 기업 홈페이지.", ["React", "Tailwind CSS", "GSAP"], "https://keduall.com", "corp-sites", code=False, demo_label="사이트 열기 ↗"),
    card("부클리", "한국 출판 콘텐츠의 해외 수출과 판권 정보를 소개하는 글로벌 콘텐츠 홈페이지.", ["React", "Tailwind CSS", "GSAP"], "https://hibookly.com", "corp-sites-bookly", code=False, demo_label="사이트 열기 ↗"),
    card("위즈덤셀러", "언어와 커리어를 연결해 글로벌 교육·유학 서비스를 소개하는 홈페이지.", ["React", "Tailwind CSS", "GSAP"], "https://wisdomcellar.com", "corp-sites-wisdomcellar", code=False, demo_label="사이트 열기 ↗"),
    card("북차카", "한국어 교육과 글로벌 유학·도서 유통·출판 콘텐츠를 소개하는 홈페이지.", ["React", "Tailwind CSS", "GSAP"], "https://bookchaka.com", "corp-sites-bookchaka", code=False, demo_label="사이트 열기 ↗"),
    card("글로윈 비나 (북카페)", "글로윈 비나 북카페의 브랜드와 공간을 소개하는 홈페이지.", ["React", "Tailwind CSS", "GSAP"], "https://glowinvina.com", code=False, demo_label="사이트 열기 ↗"),
    card("비블리아", "비블리아의 브랜드와 서비스를 소개하는 홈페이지.", ["React", "Tailwind CSS", "GSAP"], "https://hibiblia.com", code=False, demo_label="사이트 열기 ↗"),
],
"three-lab": [
    card("isosmetric-02", "GLTF로 만든 아이소메트릭 방. 침대·책상·조명까지 배치하고 모델에 붙은 애니메이션을 재생한다.", ["three.js", "GLTF", "AnimationMixer"], "https://blackstarzck.github.io/isosmetric-02/", "three-lab"),
    card("isosmetric-01", "같은 구조로 지은 첫 번째 방. lil-gui를 붙여 값을 실시간으로 만져 가며 감을 잡았다.", ["three.js", "GLTF", "lil-gui"], "https://blackstarzck.github.io/isosmetric-01/", "three-lab-2"),
    card("custom_model", "Blender로 만든 모델을 웹에 올리고 조명 둘을 붙여 밝기와 위치를 조절해 봤다.", ["Blender", "three.js", "조명"], "https://blackstarzck.github.io/custom_model/", "three-lab-3"),
    card("controls-01", "카메라의 위치와 각도를 컨트롤 패널로 직접 움직여 보며 3D 좌표계에 익숙해진 것.", ["OrbitControls", "카메라"], "https://blackstarzck.github.io/controls-01/", "three-lab-4"),
    card("ilbunidiary", "위에서 내려다보는 시점의 방. Raycaster로 바닥을 찍으면 캐릭터가 그 지점까지 걸어간다.", ["Raycaster", "GLTF", "GSAP"], "https://blackstarzck.github.io/ilbunidiary/", "three-lab-5"),
],
"game-lab": [
    card("neon-fist", "백엔드도 외부 에셋도 없이 만든 1:1 격투 게임. UI·파티클·게이지를 코드로 그리고 타격음부터 배경 음악까지 실시간 합성한다.", ["Canvas 2D", "Web Audio API", "Vite"], "https://neon-fist.vercel.app", "game-lab"),
    card("game-cabinet", "3D 아케이드 캐비닛을 세우고 그 안에서 웹게임을 실행한다. 큐레이션한 게임을 캐비닛 화면에 띄운다.", ["React Three Fiber", "Next.js"], "https://game-cabinet.vercel.app", "game-lab-2"),
    card("bridge", "유리다리를 건너는 게임. 밟은 판이 깨져 떨어지는 것을 눈속임이 아니라 물리 엔진으로 처리했다.", ["cannon", "Raycaster", "GSAP"], "https://blackstarzck.github.io/bridge/", "game-lab-3"),
    card("first-person-perspective", "1인칭으로 공간을 걸어 다닌다. 충돌은 cannon-es로 처리하고 키보드와 터치 조작을 따로 나눠 뒀다.", ["three.js", "cannon-es", "입력 처리"], "https://blackstarzck.github.io/first-person-perspective/", "game-lab-4"),
    card("lets-fps", "여럿이 같이 하는 FPS. 충돌용 월드를 GLTF로 불러오고 로그인과 방 상태는 Supabase에 뒀다.", ["three.js", "Supabase", "Vite"], "https://lets-fps.vercel.app", "game-lab-5"),
],
"trading-lab": [
    card("zenith", "업비트 자동매매 본체. Python 봇과 React UI가 REST 없이 Supabase를 공유 채널로 쓴다. 손실 리포트와 원인 분석 문서가 함께 있다.", ["Python", "Supabase", "React"], None, "trading-lab"),
    card("zenith-v2", "봇을 zenith_bot 패키지로 다시 묶고 pytest를 붙였다.", ["Python", "pytest"], None),
    card("zenith-v3", "docs/prd.md에 적은 매매 명세를 그대로 구현하는 전략 엔진으로 다시 짰다. trader와 web을 나눴다.", ["Python", "명세 기반 구현"], None),
    card("zenith-v4", "모노레포로 재작성. 연결 상태를 상태머신으로 정리하고 타임아웃·지터 백오프 재시도, runId와 seq로 중복·순서역전을 막았다.", ["TypeScript", "WebSocket", "재시도 · 순서 보증"], None),
    card("coin-lab", "backend·frontend·workers·infra로 나눠 다시 세운 판. PostgreSQL 함수까지 직접 썼다.", ["Python", "PostgreSQL", "워커"], None),
    card("coin-lab-v2", "전략 실험 대시보드. 디자인 시스템을 문서로 먼저 정하고 화면을 맞췄다.", ["디자인 시스템", "Python", "React"], None, "trading-lab-2"),
    card("profitpal", "차트·뉴스·고래 지갑을 각각 보는 에이전트의 판단을 의장이 취합하는 위원회 구조.", ["멀티 에이전트", "Python"], None),
    card("Haley", "매매 전략을 코드보다 먼저 문서로 정리한 것. 단계별 다이어그램으로 흐름을 굳혔다.", ["전략 명세"], None),
],
"react-basics": [
    card("react-todos", "투두 앱. 영상을 보며 클론 코딩한 것으로, 목록 추가·완료·삭제를 처음 끝까지 만들어 봤다.", ["React", "클론 코딩"], None, "react-basics"),
    card("react-practice6", "드롭다운이 있는 반응형 네비게이션 바.", ["React"], None, "react-basics-2"),
    card("business-card", "명함을 만들어 저장하는 앱. Firebase로 로그인과 저장을, Cloudinary로 이미지 업로드를 붙였다.", ["Firebase", "Cloudinary"], "https://blackstarzck.github.io/business-card/", "react-basics-3"),
    card("react-modeal.net2", "화면 하나를 통째로 따라 만들어 본 클론 코딩. swiper로 캐러셀을 붙였다.", ["React Router", "swiper"], "https://blackstarzck.github.io/react-modeal.net2/", "react-basics-4"),
    card("react-modeal", "같은 클론의 앞 버전. styled-components와 라우터를 처음 같이 써 봤다.", ["styled-components", "React Router"], None),
    card("react-face-detect", "face-api.js를 붙여 사진 속 얼굴을 잡아 봤다. 모델 파일을 직접 넣어 브라우저에서 돌린다.", ["face-api.js", "React"], None),
    card("react-youtube", "유튜브 API를 붙여 영상 목록과 상세를 보여주는 앱. API 호출부를 service로 떼어 냈다.", ["axios", "API 분리"], None),
    card("react-swiper", "영화 목록과 상세를 라우팅으로 나눈 앱. 강의를 따라가며 만들었다.", ["React Router", "axios"], "https://blackstarzck.github.io/react-swiper/"),
    card("react-practice4", "코인 시세 목록. axios로 외부 API를 처음 붙여 본 연습이다.", ["axios"], None),
    card("react-axios-practice", "axios 호출 패턴만 떼어 여러 방식으로 써 본 것.", ["axios"], None),
    card("react-practice5", "투두 목록·입력·항목을 컴포넌트로 쪼개 본 연습.", ["컴포넌트 분리", "react-icons"], None),
    card("react-practice3", "페이지를 나누고 라우터로 이동시키는 연습. 아이콘을 붙여 봤다.", ["React Router", "react-icons"], None),
    card("react-practice2", "드롭다운 메뉴가 있는 네비게이션 바를 컴포넌트로 만들어 본 것.", ["컴포넌트 분리"], None),
    card("react-practice1", "라우터를 처음 붙여 본 연습.", ["React Router"], None),
    card("react-practice7", "가장 작은 형태로 남긴 연습 프로젝트.", ["React"], None),
    card("react-router-practice1", "history를 직접 다뤄 가며 라우팅 동작을 확인해 본 것.", ["React Router", "history"], None),
    card("react-router-practice2", "라우팅 구조를 한 번 더 반복해 본 연습.", ["React Router"], None),
    card("react-styled-component", "styled-components로 스타일을 컴포넌트 안으로 넣어 본 연습.", ["styled-components"], None),
    card("react-CRUD", "가장 기본적인 추가·조회·수정·삭제만 남긴 연습.", ["React"], None),
    card("memo", "메모 앱. lodash.debounce로 입력이 멈춘 뒤에만 저장되게 했다.", ["debounce", "React"], None),
    card("habit-tracker", "습관 기록 앱. 클래스형 컴포넌트로 만들었다.", ["클래스 컴포넌트"], None),
    card("new-habit-tracker", "위 앱을 함수형 컴포넌트로 다시 쓴 것. 같은 화면을 두 방식으로 만들어 비교했다.", ["함수형 컴포넌트"], None),
    card("assignment", "PokeAPI로 포켓몬을 검색하는 과제. TypeScript로 썼고 React 없이 만들었다.", ["TypeScript", "PokeAPI"], None),
    card("data_structure", "연결 리스트를 자바스크립트로 직접 구현하고 화면에 그려 확인했다.", ["자료구조", "바닐라 JS"], None),
    card("drag-n-drop", "라이브러리 없이 드래그 앤 드롭을 브라우저 API만으로 구현했다.", ["바닐라 JS", "DnD"], None),
    card("canvas-test", "캔버스에 삼각형과 다각형을 그려 본 첫 습작.", ["Canvas 2D"], None),
],
}

# 이미지 스트립(<id>-2.jpg …) 장수. 자세한 설명은 아래 MULTI 출력부 주석 참고.
MULTI = {"react-basics": 4, "game-lab": 5, "three-lab": 5, "trading-lab": 2,
         "millie-admin-dashboard": 3}

# 이미지 슬롯마다 어느 저장소를 찍은 것인지. 0번이 대표 이미지다.
# 이름만 칩으로 깔면 "그래서 어떻게 생겼는데" 가 남아서 화면도 같이 보여준다.
SHOTS = {
    "canvas-lab": ["particle-colorful-stars"],
    "multicanvas-lab": ["multicanvas"],
    "scroll-3d": ["scroll-page"],
    "three-lab": ["isosmetric-02", "isosmetric-01", "custom_model", "controls-01", "ilbunidiary"],
    "game-lab": ["neon-fist", "game-cabinet", "bridge", "first-person-perspective", "lets-fps"],
    "trading-lab": ["zenith", "coin-lab-v2"],
    "space-3d": ["my-space"],
    "detect-lab": ["chanki-portfolio"],
    "react-basics": ["react-todos", "react-practice6", "business-card", "react-modeal.net2"],
    "figma-gen": ["chanchan2"],
    "doc-merge": ["doc-merge"],
    "millie-admin-dashboard": ["대시보드", "도서 관리", "회원 관리"],
}

# ── 노드 정의 ────────────────────────────────────────────────────────────
# (id, name, region, kicker, sum, body, cap, project|None, links|None)
N = []

def node(i, name, region, kicker, sum_, body, cap, project=None, url=None, urlLabel=None,
         links=None, repos=None, contact=None):
    d = dict(id=i, name=name, region=region, kicker=kicker)
    # sum 이 비면 필드를 아예 넣지 않는다 — 리전 노드는 갤러리가 body 를 쓴다.
    if sum_: d["sum"] = sum_
    d["body"] = body
    d["cap"] = cap
    if url: d["url"] = url
    if urlLabel: d["urlLabel"] = urlLabel
    if links: d["links"] = links
    # 이 노드가 다루는 GitHub 저장소. 페이지에 칩으로 깔려 전부 눌린다.
    if repos: d["repos"] = repos
    if project: d["project"] = project
    if contact: d["contact"] = contact
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
     "HTML·CSS·JavaScript 퍼블리싱에서 출발해 React·Angular·TypeScript 프론트엔드를 거쳐 NestJS·MySQL 서버 개발까지 경험했습니다. 화면만 만드는 것이 아니라 데이터가 전달되고 처리되는 전체 흐름을 이해하려 노력합니다. 기획자와 디자이너가 없는 환경에서도 기획·디자인·개발을 주도적으로 수행해 왔고, 최근에는 멀티 에이전트와 게이트 하네스로 AI를 개발 프로세스에 편입시키고 있습니다.",
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

node("contact", "연락", "entry", "함께 제품을 더 낫게",
     "사용자의 불편을 발견하고, 팀이 운영할 수 있는 제품으로 끝까지 연결합니다.",
     "5년 9개월 동안 퍼블리싱에서 프론트엔드와 서버까지 범위를 넓혀 왔습니다. 화면을 구현하는 데서 멈추지 않고 사용자 흐름, 운영 구조, 데이터와 검증까지 연결합니다. 복잡한 요구를 팀의 언어로 정리하고 실제로 쓰이는 개선으로 만드는 프론트엔드 개발자입니다.",
     "김찬기 · 프론트엔드 개발자",
     # 이메일은 링크 칩이 아니라 메타 행(연락처)으로 보여준다 — engine/legacy.ts
     links=[["GitHub", "https://github.com/blackstarzck"],
            ["기술 블로그", "https://chan-chan2.tistory.com/"],
             ["2024 소개, 이력서", "/chanki-resume.pdf"],
            ["이 포트폴리오 코드", "https://github.com/blackstarzck/my-website-2026"]],
     contact={
         "proofHeading": "사용자 경험을 제품 가치로 바꾸는 네 가지 방식",
         "proofLead": "화면의 완성도만으로 끝내지 않고 사용자의 이해, 운영자의 시간, 팀의 검증 비용까지 함께 줄이는 방향으로 일합니다.",
         "proofs": [
             {
                 "label": "운영 효율",
                 "title": "반복을 찾아 업무 흐름을 줄입니다.",
                 "body": "관리자 화면에 공통 입력 일괄 적용과 게시 전 미리보기를 더해 반복 작업과 검수 과정의 마찰을 줄였습니다."
             },
             {
                 "label": "정보 시각화",
                 "title": "복잡한 데이터를 한눈에 보이게 만듭니다.",
                 "body": "30개 이상 센서의 온도·습도 데이터를 3D 대시보드로 풀어 농장주가 환경 상태를 직관적으로 파악하도록 만들었습니다."
             },
             {
                 "label": "0→1 실행",
                 "title": "문제를 서비스로 끝까지 연결합니다.",
                 "body": "여러 엑셀과 문서의 중복 입력 문제를 발견하고 문서 통합 서비스를 기획부터 프론트엔드·서버·데이터 구조까지 1인 개발했습니다."
             },
             {
                 "label": "검증 가능한 AI",
                 "title": "속도만큼 결과의 신뢰를 관리합니다.",
                 "body": "AI를 요구사항 정리·구현·리뷰·테스트·문서화에 활용하되 테스트·보안·배포 게이트와 Git 이력으로 결과를 검증합니다."
             }
         ],
         "journeyHeading": "관심을 결과물로, 화면을 제품으로",
         "journeyLead": "퍼블리싱에서 시작해 프론트엔드와 서버, 데이터, AI 검증까지 해결 범위를 넓혀 왔습니다.",
         "journey": [
             {
                 "year": "2014.03",
                 "title": "성결대학교 졸업",
                 "body": "영어영문학과"
             },
             {
                 "year": "2015.11 – 2018.05 · 2년 7개월",
                 "title": "가자하와이"
             },
             {
                 "year": "2018.10 – 2019.07 · 10개월",
                 "title": "G-Bridge"
             },
             {
                 "year": "2020",
                 "title": "코로나19",
                 "body": "익숙했던 일상이 멈추며 앞으로의 일을 다시 선택해야 했고, 오래 관심을 두었던 웹 개발을 새로운 커리어로 결정했습니다."
             },
             {
                 "year": "2020",
                 "title": "국비지원 개발 교육",
                 "body": "웹 개발의 기초를 체계적으로 배우고, 아이디어를 실제 화면과 기능으로 구현하는 개발자로 첫발을 내디뎠습니다."
             },
             {
                 "year": "2020.06 - 2022.06",
                 "title": "모두가딜러",
                 "body": "반응형 웹과 신규 콘텐츠 개발에서 시작해 데이터 조회, 사용자 인터랙션, 관리자 기능까지 담당하며 퍼블리셔에서 프론트엔드 개발자로 역할을 넓혔습니다.",
                 "projects": [
                     {
                         "title": "반응형 서비스 운영 및 신규 콘텐츠 개발",
                         "body": "웹과 앱의 화면을 개선하고 동적 콘텐츠와 개인화 기능을 구현해 화면의 완성도와 운영 편의성을 함께 높였습니다."
                     },
                     {
                         "title": "관리자 페이지 UI 개선",
                         "body": "조건별 입력 화면과 일괄 적용, 미리보기 기능을 추가해 반복 작업을 줄이고 검수 정확도를 높였습니다."
                     },
                     {
                         "title": "레거시 코드와 데이터 조회 구조 정리",
                         "body": "불필요한 데이터 호출과 사용하지 않는 자산을 제거하고 조회 구조와 추적 스크립트를 정리해 유지보수성을 높였습니다."
                     }
                 ]
             },
             {
                 "year": "2023.01 - 2025.02",
                 "title": "팜커넥트",
                 "body": "화면뿐 아니라 데이터가 전달되는 서버 영역까지 함께 구현하며 프론트엔드 개발 범위를 넓혔습니다.",
                 "projects": [
                     {
                         "title": "센서 데이터 3D 시각화 대시보드",
                         "body": "30개 이상 센서의 온도·습도 데이터를 3D로 시각화해 농장주가 실시간 환경과 AI 권장값을 직관적으로 비교하도록 만들었습니다."
                     },
                     {
                         "title": "CONNECT BEE 하이브리드 앱",
                         "body": "센서 데이터 확인과 팬·열선·쿨러 제어를 하나의 화면 흐름으로 연결했습니다."
                     },
                     {
                         "title": "스마트팜 관리자 페이지",
                         "body": "농장주와 농장, 센서 정보를 관리하고 환경 상태를 빠르게 확인할 수 있는 운영 화면을 개발했습니다."
                     }
                 ]
             },
             {
                 "year": "2025.02 - 현재",
                 "title": "케듀올",
                 "body": "기획과 디자인, 프론트엔드와 서버를 연결하고 AI 기반 검증 과정까지 설계하며 제품 전체로 역할을 넓혔습니다.",
                 "projects": [
                     {
                         "title": "도토리 TOPIK 학습 서비스",
                         "body": "문제 풀이와 AI 피드백, 추천, 학습 이력, 다국어 경험을 구현하고 테스트·보안·배포 검증 과정을 연결했습니다."
                     },
                     {
                         "title": "도서 재고 문서 통합 관리 서비스",
                         "body": "여러 문서에 같은 정보를 반복 입력하던 업무를 하나의 시스템으로 통합하고 기획부터 화면과 서버까지 1인 개발했습니다."
                     },
                     {
                         "title": "법인별 홈페이지",
                         "body": "기획과 디자인부터 반응형 웹 개발, 배포와 운영까지 단독으로 수행해 유지보수성과 확장성을 높였습니다."
                     },
                     {
                         "title": "DADOKe 전자책·오디오북 플랫폼",
                         "body": "시장과 경쟁사를 분석하고 요구사항 정의와 해외 개발업체 커뮤니케이션을 총괄했습니다."
                     }
                 ]
             }
         ],
         "collaborationHeading": "이런 방식으로 함께 일합니다.",
         "collaboration": [
             {
                 "title": "흐름부터 합의합니다.",
                 "body": "화면을 만들기 전에 사용자 동선과 상태 전이를 정리하고 기획 단계부터 의견을 냅니다."
             },
             {
                 "title": "눈높이를 번역합니다.",
                 "body": "PPT·Figma·흐름도·기능 명세를 활용해 기술적인 내용을 각 직군이 판단할 수 있는 형태로 설명합니다."
             },
             {
                 "title": "경계를 넘되 책임을 남깁니다.",
                 "body": "기획자나 디자이너가 없는 환경에서도 필요한 역할을 메우고 결과는 문서와 테스트로 다시 확인할 수 있게 남깁니다."
             },
             {
                 "title": "영어 협업도 이어갑니다.",
                 "body": "영어 기술 문서를 읽고 해외 외주 개발사와 요구사항을 조율한 경험으로 언어와 직군의 차이를 넘어 협업합니다."
             }
         ],
         "fitHeading": "이런 팀이라면 특히 잘 맞습니다.",
         "fit": [
             "사용자 경험과 운영 효율을 모두 제품 품질로 보는 팀",
             "역할의 경계를 열어 두고 문제 해결을 함께 소유하는 팀",
             "빠른 실험과 자동화, 검증 가능한 개발 문화를 함께 만들 팀",
             "프론트엔드 전문성을 중심으로 서버와 데이터까지 연결할 사람이 필요한 팀"
         ],
         "closingTitle": "다음 제품의 사용자·운영 문제를 함께 풀어보고 싶습니다.",
         "closingBody": "사용자의 불편을 발견해 더 나은 경험과 제품 가치로 연결하는 프론트엔드 개발자 김찬기입니다."
     })

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

node("millie-admin-dashboard", "밀리 관리자 대시보드", "frontend", "개인 프로젝트 · 2025",
     "복잡한 콘텐츠 플랫폼의 운영 업무를 하나의 관리자 정보 구조와 화면 체계로 풀어낸 개인 프로젝트입니다.",
     "밀리의 서재를 참고해 콘텐츠·회원·구독·쿠폰·알림·통계·권한 관리까지 관리자 업무를 폭넓게 설계하고 React로 구현했습니다. 실제 서비스 운영 프로젝트가 아닌 개인 UI 프로토타입이며, 데이터가 많은 화면에서 탐색·필터·편집·상태 확인이 끊기지 않도록 메뉴 구조와 공통 패턴을 정리하는 데 초점을 맞췄습니다.",
     "밀리 관리자 대시보드 · 개인 프로젝트",
     P(role="관리자 정보 구조·UI 설계 및 프론트엔드 구현",
       duration="2025.04 - 2025.12 · GitHub 기록 기준",
       impact="여러 운영 도메인을 일관된 메뉴·표·폼·통계 화면으로 구조화했습니다.",
       scope="React 18·React Router·Ant Design 기반 프론트엔드 프로토타입. 표·차트·편집기·드래그 앤 드롭·권한 설정 화면을 구현했습니다.",
       objectives=["콘텐츠·회원·구독·프로모션·고객 대응 업무를 하나의 메뉴 체계로 구성",
                   "검색·필터·상태·일괄 작업이 반복되는 관리자 화면 패턴 정리",
                   "대시보드 지표와 분석 화면으로 운영 상태를 빠르게 파악"],
       skills=[["관리자 UX · 정보 구조", "grew"], ["React · React Router", "core"],
               ["Ant Design", "grew"], ["데이터 테이블 · 차트", "grew"]]),
     url="https://millie-admin-dashboard.vercel.app/#/dashboard", urlLabel="대시보드 열어보기",
     repos=["millie-admin-dashboard"])

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
       ),
     links=[["화면 열어보기", "https://blackstarzck.github.io/doc-merge/"]],
     repos=["doc-merge", "doc-merge-server"])

node("nest-sns", "NestJS 학습", "backend", "학습",
     "인증부터 실시간 채팅까지, 서버 한 벌을 빈 폴더에서 얹어 본 기록입니다.",
     "강의를 따라가며 NestJS로 SNS 서버를 한 벌 만들었습니다. JWT로 인증을 붙이고 bcrypt로 비밀번호를 다뤘고, TypeORM으로 PostgreSQL 스키마와 관계를 잡았습니다. 사용자·게시글·채팅을 모듈로 나누고 socket.io로 실시간 채팅을 얹었습니다. 들어오는 값은 class-validator로 걸렀고 파일 업로드는 multer로 처리했습니다. 실무에서 만난 서버는 이미 굴러가고 있는 것이었습니다. 빈 폴더에서 시작해 인증·검증·관계·실시간까지 직접 쌓아 보는 것이 목적이었습니다.",
     "NestJS SNS 서버 · 학습",
     P(role="학습",
       skills=[["NestJS", "grew"], ["TypeORM · PostgreSQL", "grew"],
               ["JWT 인증", "first"], ["WebSocket", "first"]]),
     url="https://github.com/blackstarzck/cf_sns", urlLabel="GitHub에서 보기",
     repos=["cf_sns"])

# ── ai ───────────────────────────────────────────────────────────────────
node("ai", "AI 개발 프로세스", "ai", "현재 집중",
     "",
     "AI에게 결과를 생성시키는 데서 그치지 않고, 무엇을 읽고 어디까지 작업하며 어떤 근거로 통과시킬지를 시스템으로 설계합니다. 문서로 맥락을 고정하고, 하네스로 위험한 작업을 막으며, 역할별 에이전트와 검증 루프가 결과를 다시 확인하게 만듭니다. 아래 작업들은 한 번의 프롬프트 결과가 아니라 실패를 발견하고 규칙·도구·작업 순서를 다시 설계한 기록입니다.",
     "AI 개발 프로세스")

node("gate-harness", "요구사항 게이트 하네스", "ai", "실무 적용",
     "문서를 확인하지 않으면 변경할 수 없고, 실패해도 같은 작업 기록에서 다시 이어갈 수 있는 AI 실행 환경입니다.",
     "AI가 규칙을 읽었다고 가정하지 않고 확인 기록이 생기기 전에는 파일 변경과 실행을 차단했습니다. 에이전트·도구·샌드박스가 실패해도 작업 장부는 유지되며, 검증과 품질 리뷰를 통과해야 완료할 수 있습니다. README의 실제 워크플로우와 테스트 근거를 사례 연구로 정리했습니다.",
     "요구사항 게이트 하네스",
     P(role="게이트 하네스 설계·적용",
       impact="AI 작업을 중단·재개·검증할 수 있는 사건 기록과 게이트로 바꿨습니다.",
       skills=[["요구사항 명세", "grew"], ["하네스 설계", "first"]]),
     url="https://github.com/blackstarzck/requirement-gated-python-harness", urlLabel="GitHub에서 보기",
     repos=["requirement-gated-python-harness"])

node("multi-agent", "AI 개발 파이프라인", "ai", "실무 적용",
     "Codex와 Claude가 바뀌어도 같은 작업 공간·맥락·검증 근거를 이어받는 개발 흐름입니다.",
     "질문·작은 코드·병렬 위험 작업을 먼저 분류하고, 작업 성격에 맞는 공간을 선택하도록 했습니다. AI 도구가 바뀌어도 목표와 결정, 남은 일, 검증 근거를 같은 작업 기록으로 넘기며, 현재 코드와 정확히 일치하는 성공 증거만 재사용합니다.",
     "AI 개발 파이프라인 v3.1",
     P(role="AI 작업 수명주기·인수인계·검증 흐름 설계",
       impact="도구가 바뀌어도 작업의 상태와 완료 근거가 끊기지 않게 했습니다.",
       skills=[["작업 오케스트레이션", "first"], ["컨텍스트 인수인계", "first"]]),
     url="https://github.com/blackstarzck/topik-project-v13/blob/main/docs/operations/ai-development-pipeline.md", urlLabel="파이프라인 원문 보기",
     repos=["topik-project-v13"])

node("verify-loop", "TOPIK AI 검증 하네스", "ai", "실무 적용",
     "문서·화면 경로·데이터 경계·테스트가 함께 움직이는지를 변경마다 반복 검사합니다.",
     "TOPIK 관리자 서비스에서 짧은 작업 지침과 상세 문서를 분리하고, 문서 연결·화면 경로·데이터 계약·중복·타입·빌드·대표 화면 흐름을 기계적으로 검사했습니다. 같은 문제가 반복되면 코드뿐 아니라 문서와 하네스 규칙도 다시 고칩니다.",
     "TOPIK AI Admin Harness",
     P(role="문서·구조·코드·화면 검증 하네스 설계",
       impact="저장소 규칙의 이탈을 사람이 기억하기 전에 검사기가 드러내게 했습니다.",
       skills=[["Vitest · Playwright", "grew"], ["CI 게이트 구성", "first"]]),
     url="https://github.com/blackstarzck/topik-ai/blob/main/docs/harness/index.md", urlLabel="하네스 원문 보기",
     repos=["topik-ai"])

node("figma-gen", "Figma → React 생성기", "ai", "개인 프로젝트",
     "디자인 토큰을 동기화하고 컴포넌트를 만들어내는 UI 라이브러리 스타터입니다.",
     "Figma의 디자인 토큰을 코드로 동기화하고 shadcn 스타일의 기본 컴포넌트를 생성하는 스타터를 만들었습니다. npm 릴리스 자동화까지 포함해, 디자인과 코드 사이를 손으로 옮기던 과정을 줄이는 것이 목표였습니다.",
     "Figma 기반 UI 라이브러리",
     P(role="개인 프로젝트 · 설계 및 구현",
       skills=[["디자인 토큰 동기화", "first"], ["npm 릴리스 자동화", "first"], ["TypeScript", "core"]]),
     url="https://chanchan2.vercel.app", urlLabel="디자인 시스템 문서 열기",
     links=[["저장소", "https://github.com/blackstarzck/chanchan2"]],
     repos=["chanchan2"])

node("my-skills", "반복 작업을 SKILL로 만드는 법", "ai", "개인 프로젝트",
     "자주 반복되는 판단을 발동 조건·작업 범위·읽을 자료·검증 방법이 있는 절차로 바꿉니다.",
     "SKILL을 긴 프롬프트 모음이 아니라 특정 요청에서 자동으로 꺼내 쓰는 작업 절차로 설계했습니다. 테마 변경 사례에서는 넓게 탐색하기 전에 범위와 보호선을 묻고, 최소 자료만 읽은 뒤 주변 화면으로 변경이 번지지 않았는지 검증합니다.",
     "재사용 가능한 AI 작업 절차",
     P(role="반복 작업 절차 설계·적용",
       skills=[["작업 방식의 도구화", "grew"]]),
     url="https://github.com/blackstarzck/v12/blob/main/.codex/skills/theme-clarification-fast-path/SKILL.md", urlLabel="SKILL 원문 보기",
     repos=["v12", "sample-03"])

node("ai-squads", "비개발자용 에이전트 IDE", "ai", "개인 프로젝트",
     "PM·설계·개발·QA의 작업 흐름을 보여주는 비주얼 IDE와, 이견을 보존하는 AI 위원회 실험입니다.",
     "비개발자가 역할별 에이전트의 진행을 볼 수 있는 초기 프로토타입을 만들었습니다. 별도의 ProfitPal 실험에서는 차트·뉴스·수급 분석을 병렬로 실행하고, 의견이 갈리면 재검토한 뒤 최종안과 소수 의견을 함께 남기도록 구성했습니다.",
     "비개발자용 에이전트 IDE",
     P(role="개인 프로젝트 · 설계 및 구현",
       skills=[["LangGraph", "first"], ["FastAPI", "first"], ["Next.js", "core"]]),
     url="https://github.com/blackstarzck/ai-squads", urlLabel="GitHub에서 보기",
     links=[["AI 위원회 프롬프트 설계", "https://github.com/blackstarzck/profitpal/blob/main/docs/agent-prompt-design.md"]],
     repos=["ai-squads", "profitpal"])

node("video-agent", "검사 가능한 AI 영상 제작 루프", "ai", "개인 프로젝트",
     "36개 실행 프롬프트를 감사해 규칙 이탈을 찾고, 생성 전에 검사기가 막는 제작 루프로 바꿨습니다.",
     "영상 작업 문서에는 필수 항목이 있었지만 실제 생성 프롬프트 36개 중 정확히 지킨 것은 1개뿐이었습니다. 검토 에이전트가 실행됐다는 사실과 규칙이 강제됐다는 사실을 분리하고, 필수 항목 사전 검사·독립 리뷰·한 번에 한 변수만 바꾸는 재생성 루프를 도입했습니다.",
     "AI 영상 프롬프트 감사와 개선",
     P(role="AI 영상 제작 계약·검증 루프 설계",
       skills=[["에이전트 문서 설계", "grew"], ["근거 등급 관리", "first"], ["하드 게이트", "grew"]]),
     url="https://github.com/blackstarzck/sample-03", urlLabel="GitHub에서 보기",
     repos=["sample-03"])

node("design-rulebook", "디자인 룰북", "ai", "개인 프로젝트",
     "추상적인 디자인 요청을 AI가 실행하고 사람이 확인할 수 있는 제약 문장으로 바꾸는 진행 중 실험입니다.",
     "디자인 리뷰에서 반복되는 판단을 간격·대비·정렬·상태처럼 확인 가능한 규칙으로 바꿨습니다. 새 관찰을 바로 추가하지 않고 기존 규칙과 표현을 맞추고, 유사 항목을 묶고, 대표 문장을 선택한 뒤 실제 작업에서 다시 검증합니다.",
     "디자인 룰북",
     P(role="개인 프로젝트",
       skills=[["디자인 기준 문서화", "first"], ["AI 프롬프트 규칙", "grew"]]),
     url="https://github.com/blackstarzck/madia-design-rule", urlLabel="GitHub에서 보기",
     repos=["madia-design-rule"])

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
            ["저장소", "https://github.com/blackstarzck/particle-colorful-stars"]],
     repos=["particle-colorful-stars"])

node("multicanvas-lab", "캔버스 여러 개", "lab", "실험",
     "WebGL 렌더러 하나로 페이지 곳곳의 캔버스 자리를 채웁니다.",
     "캔버스마다 렌더러를 하나씩 두면 브라우저가 허용하는 WebGL 컨텍스트 수에 금방 닿습니다. multicanvas는 렌더러를 하나만 두고, 페이지에 흩어진 자리표시자 세 곳의 위치를 매 프레임 getBoundingClientRect로 읽어 setScissor와 setViewport로 그 영역만 잘라 그립니다. 자리가 화면 밖으로 밀려나면 아예 그리지 않고 넘어갑니다. 캔버스가 여러 개인 것처럼 보이지만 실제로는 하나입니다. 장면마다 GLTF 모델과 자기 카메라를 따로 가집니다.",
     "캔버스 여러 개 · 실험",
     P(role="개인 실험",
       skills=[["WebGL 컨텍스트 관리", "first"], ["three.js", "grew"], ["뷰포트 컬링", "first"]]),
     links=[["데모 열기", "https://blackstarzck.github.io/multicanvas/"],
            ["저장소", "https://github.com/blackstarzck/multicanvas"]],
     repos=["multicanvas"])

node("scroll-3d", "스크롤 연동 3D", "lab", "실험",
     "스크롤 위치에 3D 장면을 묶어, 페이지를 내리면 장면 안으로 들어갑니다.",
     "소스에 적어둔 주제 그대로 '스크롤에 따라 움직이는 3D 페이지'입니다. GLTF로 불러온 집 모델을 배치하고 window.scrollY 값을 gsap으로 카메라에 연결했습니다. 스크롤을 내리면 장면 안을 이동하는 것처럼 보입니다. 값이 변하는 일과 화면에 그리는 일을 어디서 나눌지 정해야 하는데, 이 포트폴리오의 지도도 결국 같은 문제를 푼 것입니다.",
     "스크롤 연동 3D · 실험",
     P(role="개인 실험",
       skills=[["GSAP", "first"], ["GLTF 로딩", "grew"], ["스크롤 연동", "first"]]),
     links=[["데모 열기 · 스크롤해 보세요", "https://blackstarzck.github.io/scroll-page/"],
            ["저장소", "https://github.com/blackstarzck/scroll-page"]],
     repos=["scroll-page"])

node("three-lab", "3D · 아이소메트릭", "lab", "실험",
     "아이소메트릭 뷰와 3D 모델, 카메라 컨트롤을 다뤄본 저장소들입니다.",
     "3D 공간을 화면에 올리는 방법을 하나씩 바꿔가며 익혔습니다. 모델을 불러오고, 카메라를 두고, 조명을 붙이고, 클릭한 지점으로 캐릭터를 보내는 것까지 갔습니다. 이 경험이 이후 팜커넥트에서 센서 데이터를 3D로 시각화할 때 직접 쓰였고, 최근에는 game-cabinet의 React Three Fiber로 이어졌습니다.",
     "3D · 아이소메트릭 실험",
     P(role="개인 실험",
       skills=[["3D 렌더링", "grew"], ["카메라 컨트롤", "first"], ["직교 카메라", "first"]]),
     links=[["아이소메트릭 방 01", "https://blackstarzck.github.io/isosmetric-01/"],
            ["아이소메트릭 방 02", "https://blackstarzck.github.io/isosmetric-02/"],
            ["Blender 모델 + 조명", "https://blackstarzck.github.io/custom_model/"],
            ["걸어다니는 방", "https://blackstarzck.github.io/ilbunidiary/"]],
     repos=["isosmetric-01", "isosmetric-02", "custom_model", "controls-01", "ilbunidiary"])

node("game-lab", "게임 · 인터랙션", "lab", "실험",
     "브라우저에서 도는 격투 게임과 3D 아케이드 캐비닛, 1인칭 조작 실험입니다.",
     "게임은 프레임마다 상태가 바뀝니다. 누르면 바로 반응해야 하고, 충돌과 물리를 직접 다뤄야 하고, 소리까지 붙습니다. UI 개발과는 다른 근육이라 계속 만들어 보고 있습니다. 캔버스에 직접 그리는 것에서 시작해 물리 엔진과 3D, 실시간 사운드까지 하나씩 넓혀 왔습니다.",
     "게임 · 인터랙션 실험",
     P(role="개인 실험",
       skills=[["Canvas 2D", "grew"], ["Web Audio API", "first"],
               ["물리 엔진(cannon)", "first"], ["게임 루프", "first"]]),
     links=[["NEON FIST 플레이", "https://neon-fist.vercel.app"],
            ["GAME CABINET 열기", "https://game-cabinet.vercel.app"],
            ["유리다리 건너기", "https://blackstarzck.github.io/bridge/"],
            ["1인칭 시점 실험", "https://blackstarzck.github.io/first-person-perspective/"]],
     repos=["neon-fist", "game-cabinet", "bridge", "lets-fps",
            "first-person-perspective"])

node("game-cards", "능력치 카드 게임", "lab", "2022 · 개인 프로젝트",
     "얼굴 사진으로 능력치 카드를 만들고 보관해 친구와 대결하는 웹게임입니다.",
     "얼굴이 보이는 사진을 올리면 능력치가 무작위로 부여된 카드가 만들어집니다. 로그인 후 카드를 보관하고 그룹을 구성해 친구와 대결할 수 있으며, 친구 목록과 알림, 전적까지 한 흐름으로 연결했습니다.",
     "능력치 카드 게임",
     P(role="개인 프로젝트 · 기획 · 디자인 · 구현",
       duration="2022",
       impact="카드 생성부터 보관·친구·대결·전적까지 이어지는 게임 흐름을 구현했습니다.",
       scope="React 기반 웹게임. Firebase 인증·데이터 저장과 face-api.js 얼굴 감지를 연결했습니다.",
       objectives=["사진으로 능력치 카드 생성", "로그인 사용자 카드 보관과 그룹 구성", "친구 대결과 전적 확인"],
       skills=[["React", "first"], ["Firebase", "first"], ["face-api.js", "first"]]),
     url="https://simple-gatcha.netlify.app/", urlLabel="카드 게임 열기",
     repos=["game-cards"])

node("trading-lab", "자동매매 시스템", "lab", "2026",
     "업비트 자동매매를 여덟 개 저장소에 걸쳐 만들고 다시 만든 기록입니다.",
     "2026년 2월부터 6월까지 여덟 개 저장소로 업비트 자동매매를 만들고 다시 만들었습니다. 돈이 걸린 코드라 틀리면 바로 드러납니다. 손실이 났을 때 리포트와 원인 분석을 남기고 다음 버전으로 넘어간 기록이 저장소에 그대로 있습니다. 상태머신, 재시도와 순서 보증, 에이전트 위원회 같은 것들이 그 과정에서 하나씩 붙었습니다.",
     "업비트 자동매매 · 2026",
     P(role="개인 프로젝트 · 설계 및 구현",
       duration="2026.02 - 2026.06",
       skills=[["Python", "grew"], ["실시간 상태 설계", "first"],
               ["재시도 · 순서 보증", "first"], ["Supabase", "grew"]]),
     links=[["zenith · 자동매매 본체", "https://github.com/blackstarzck/zenith"],
            ["zenith-v4 · 모노레포 재작성", "https://github.com/blackstarzck/zenith-v4"],
            ["coin-lab-v2", "https://github.com/blackstarzck/coin-lab-v2"],
            ["profitpal · 에이전트 위원회", "https://github.com/blackstarzck/profitpal"]],
     repos=["zenith", "zenith-v2", "zenith-v3", "zenith-v4", "coin-lab", "coin-lab-v2", 
            "profitpal", "Haley"])

node("space-3d", "3D 공간 만들기", "lab", "실험",
     "마을 하나를 통째로 세워 걸어 다닐 수 있게 만든 3D 씬입니다.",
     "예제 하나를 돌려보는 데서 멈추지 않고, 3D 앱을 구조로 짜 보려고 만든 것입니다. Experience를 싱글턴으로 두고 카메라·렌더러·리소스 로더·크기 대응을 각각 분리했습니다. 씬에서 바꾼 값은 localStorage에 남겨 다시 들어와도 유지됩니다. 눈이 쌓인 마을을 세우고 그 안을 돌아다닐 수 있게 했습니다.",
     "3D 공간 · 실험",
     P(role="개인 실험",
       skills=[["3D 앱 구조 설계", "first"], ["three.js", "grew"], ["리소스 로딩", "grew"]]),
     links=[["마을 걸어보기", "https://blackstarzck.github.io/my-space/"],
            ["저장소", "https://github.com/blackstarzck/my-space"]],
     repos=["my-space"])

node("detect-lab", "물체 감지", "lab", "2022",
     "사진 속 물건을 브라우저에서 잡아 카드로 띄운, 이 사이트 이전의 포트폴리오입니다.",
     "오늘의집을 보다 시작했습니다. 이미지 속 물건의 위치를 사람이 일일이 찍어 표시하는데, 그걸 자동으로 하면 작업 시간이 줄겠다고 생각했습니다. tensorflow.js로 브라우저에서 물체를 감지하고, 오늘의집 DB가 없으니 결과는 SVG 아이콘 카드로 대신 띄웠습니다. 감지된 지점에 점을 찍고 캔버스로 점과 카드를 선으로 이었는데, 카드끼리 겹치지 않도록 충돌 방지를 넣었습니다. 충돌을 확인하느라 렌더링이 늘어 결과가 늦게 나오길래 로딩 애니메이션을 뒀습니다. 정작 더 오래 붙잡은 건 AI가 틀렸을 때였습니다 — 전혀 다른 물체를 잡은 경우와 비슷하지만 아닌 경우를 나누고, 어느 쪽이든 사용자가 직접 고르게 하는 단계를 두었습니다. 바닐라 자바스크립트로 만든 싱글 페이지입니다. 점과 선으로 이어 보여주는 방식은 지금 이 지도와 같습니다.",
     "이미지 물체 감지 · 2022",
     P(role="개인 프로젝트 · 기획 · 디자인 · 구현",
       duration="2022",
       skills=[["tensorflow.js", "first"], ["Canvas 2D", "grew"],
               ["GSAP", "first"], ["바닐라 자바스크립트", "core"]]),
     links=[["직접 돌려보기", "https://blackstarzck.github.io/chanki-portfolio/"],
            ["저장소", "https://github.com/blackstarzck/chanki-portfolio"]],
     repos=["chanki-portfolio"])

node("react-basics", "React 학습기", "lab", "2022",
     "2022년에 스무 개 남짓 남긴 연습 저장소들, 하나씩 떼어 익히던 시기의 기록입니다.",
     "2022년에 남긴 연습 저장소가 스무 개 남짓입니다. 라우터·상태·스타일링을 하나씩 떼어 익히고, 자료구조나 브라우저 API처럼 React 바깥의 것들도 만져 봤습니다. 지금 보면 조각난 예제들이지만, 이때 하나씩 떼어 연습한 것들이 이후 실무에서 조합되어 쓰였습니다. 지우지 않고 두는 이유입니다.",
     "React 학습기 · 2022",
     P(role="학습",
       duration="2022",
       skills=[["React", "first"]]),
     links=[["명함 제작기 데모", "https://blackstarzck.github.io/business-card/"],
            ["클론 코딩 데모", "https://blackstarzck.github.io/react-modeal.net2/"],
            ["react-todos 저장소", "https://github.com/blackstarzck/react-todos"],
            ["연습 저장소 목록", "https://github.com/blackstarzck?tab=repositories&q=react-practice"]],
     repos=["react-practice1", "react-practice2", "react-practice3", "react-practice4", 
            "react-practice5", "react-practice6", "react-practice7", "react-router-practice1", 
            "react-router-practice2", "react-styled-component", "react-swiper", "react-todos", 
            "react-modeal", "react-modeal.net2", "react-CRUD", "react-axios-practice", 
            "react-youtube", "react-face-detect", "memo", "business-card",
            "habit-tracker", "new-habit-tracker", "assignment", "data_structure", 
            "drag-n-drop", "canvas-test"])

node("pokemon", "포켓몬 도감", "lab", "2022 · 개인 프로젝트",
     "이름·번호·특성·타입으로 포켓몬을 찾고 번호순으로 정렬하는 도감입니다.",
     "외부 포켓몬 데이터를 불러와 이름과 번호, 특성, 타입으로 검색할 수 있게 만들었습니다. 목록 정렬과 상세 화면 이동을 연결하고, 전역 상태와 화면 전환 애니메이션을 한 프로젝트 안에서 함께 다뤘습니다.",
     "포켓몬 도감",
     P(role="개인 프로젝트 · 기획 · 디자인 · 구현",
       duration="2022",
       impact="검색·분류·정렬·상세 탐색이 이어지는 도감 경험을 구현했습니다.",
       scope="React·TypeScript 기반. PokeAPI 데이터, Redux Toolkit 전역 상태와 GSAP 화면 전환을 사용했습니다.",
       objectives=["이름·번호·특성·타입 검색", "포켓몬 번호순 정렬", "목록에서 상세 화면으로 이어지는 탐색"],
       skills=[["TypeScript", "grew"], ["Redux Toolkit", "first"], ["GSAP", "first"]]),
     url="https://chanki-pokedx.netlify.app/", urlLabel="포켓몬 도감 열기",
     repos=["pokemon"])

# 카드가 있는 노드는 links/repos 를 지운다. 카드가 그 둘을 대신한다.
_byid = {n["id"]: n for n in N}
for _nid, _cs in CARDS.items():
    _n = _byid[_nid]
    _n["cards"] = _cs
    _n.pop("links", None)
    _n.pop("repos", None)
    MULTI.pop(_nid, None)
    SHOTS.pop(_nid, None)

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
    ["farm-3d", "three-lab"],
    ["topik-user", "topik-admin"],
    ["topik-admin", "verify-loop"], ["doc-merge", "corp-sites"],
    ["millie-admin-dashboard", "topik-admin"],
    ["gate-harness", "multi-agent"], ["multi-agent", "verify-loop"],
    ["gate-harness", "video-agent"], ["design-rulebook", "figma-gen"],
    ["figma-gen", "corp-sites"], ["my-skills", "gate-harness"],
    ["react-basics", "dealer-web"], ["canvas-lab", "three-lab"],
    ["three-lab", "game-lab"],
    ["canvas-lab", "multicanvas-lab"], ["multicanvas-lab", "three-lab"],
    ["scroll-3d", "three-lab"], ["space-3d", "three-lab"], ["space-3d", "game-lab"],
    ["detect-lab", "react-basics"], ["detect-lab", "canvas-lab"],
    ["ai-squads", "multi-agent"],
    ["docs-comm", "dealer-admin"],
    ["doc-merge", "backend"], ["dadoke", "topik-user"],
]

# ── SPINE (서사 순서) ────────────────────────────────────────────────────
SPINE = ["chanki", "contact", "react-basics", "pokemon", "frontend", "dealer-web", "dealer-admin",
         "legacy-cleanup", "canvas-lab", "multicanvas-lab", "scroll-3d", "three-lab",
         "space-3d", "game-lab", "game-cards", "trading-lab", "detect-lab", "lab",
         "farm-3d", "connect-bee", "backend", "nest-sns", "doc-merge",
         "corp-sites", "millie-admin-dashboard", "figma-gen", "design-rulebook", "dadoke", "docs-comm", "product",
         "topik-user", "topik-admin", "ai", "gate-harness", "multi-agent",
         "verify-loop", "my-skills", "ai-squads", "video-agent"]

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
assert len(N) == 39, f"노드 수 {len(N)}"
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
w("config.ts", "export const CONTACT_EMAIL = 'blackstarzck@naver.com'\n"
              "// ContentNode.repos 의 저장소 칩이 가리킬 계정.\n"
              "export const GITHUB_USER = 'blackstarzck'\n")

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
 * 슬롯별로 어느 저장소인지는 SHOTS 가 들고 있다.
 * react-practice6 은 저장소에 빌드 산출물만 있어 소스를 읽을 수 없다.
 * 그래서 노드로 두지 않고 이미지로만 남겼다.
 */
export const MULTI: Record<string, number> = {j(MULTI)}

/** 이미지 슬롯마다 찍힌 저장소 이름. 0번이 대표 이미지. */
export const SHOTS: Record<string, string[]> = {j(SHOTS)}

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

export type ProjectCard = {{
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
}}

export type ContactItem = {{
  title: string
  body: string
}}

export type ContactProof = ContactItem & {{
  label: string
}}

export type ContactJourney = {{
  year: string
  title: string
  body?: string
  projects?: ContactItem[]
}}

export type ContactFields = {{
  proofHeading: string
  proofLead: string
  proofs: ContactProof[]
  journeyHeading: string
  journeyLead: string
  journey: ContactJourney[]
  collaborationHeading: string
  collaboration: ContactItem[]
  fitHeading: string
  fit: string[]
  closingTitle: string
  closingBody: string
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
  /** 이 노드가 다루는 GitHub 저장소 이름. 페이지에 칩으로 그려진다. */
  repos?: string[]
  /** 저장소가 여럿인 노드의 프로젝트 카드. 있으면 links/repos/스트립을 대신한다. */
  cards?: ProjectCard[]
  project?: ProjectFields
  contact?: ContactFields
}}
""")

print(f"\n  노드 {len(N)} / 엣지 {len(E)} / 리전 {len(REGIONS)}")
for r in REGIONS:
    print(f"    {r:9s} {len(by_region.get(r, []))}")
