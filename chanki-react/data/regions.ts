// 김찬기 포트폴리오 콘텐츠.
// 생성: tools/gen-content.py (이력서 + GitHub 저장소 기반)
import type { Region } from './types'

export const COLOR: Record<Region, string> = {
  "entry": "#9B8FFF",
  "frontend": "#4FC3F7",
  "backend": "#FF6A3D",
  "ai": "#CFFF04",
  "product": "#FF3D7A",
  "lab": "#06D6C4"
}

export const RLAB: Record<Region, string> = {
  "entry": "시작",
  "frontend": "프론트엔드",
  "backend": "서버 · 데이터",
  "ai": "AI 개발 프로세스",
  "product": "제품 · 협업",
  "lab": "실험실"
}

export const SLUG: Record<Region, string> = {
  "entry": "chanki",
  "frontend": "frontend",
  "backend": "backend",
  "ai": "ai",
  "product": "product",
  "lab": "lab"
}

export const AGRAD: Record<Region, [string, string]> = {
  "entry": [
    "#9B8FFF",
    "#4FC3F7"
  ],
  "frontend": [
    "#4FC3F7",
    "#06D6C4"
  ],
  "backend": [
    "#FF6A3D",
    "#FFB03D"
  ],
  "ai": [
    "#CFFF04",
    "#06D6C4"
  ],
  "product": [
    "#FF3D7A",
    "#9B8FFF"
  ],
  "lab": [
    "#06D6C4",
    "#4FC3F7"
  ]
}

export const TREECOLS: [Region, string][] = [
  [
    "frontend",
    "frontend"
  ],
  [
    "backend",
    "backend"
  ],
  [
    "ai",
    "ai"
  ],
  [
    "product",
    "product"
  ],
  [
    "lab",
    "lab"
  ]
]

/** 라이트 테마 전용 이미지가 있는 노드. 아직 없음. */
export const THEMED: Record<string, number> = {}

/**
 * 이미지 스트립이 있는 노드와 장수. <id>.jpg 다음에 <id>-2.jpg … 를 읽는다.
 * react-basics 2 = react-todos(대표) + react-practice6(네비게이션 바).
 * 슬롯별로 어느 저장소인지는 SHOTS 가 들고 있다.
 * react-practice6 은 저장소에 빌드 산출물만 있어 소스를 읽을 수 없다.
 * 그래서 노드로 두지 않고 이미지로만 남겼다.
 */
export const MULTI: Record<string, number> = {
  "react-basics": 4,
  "game-lab": 5,
  "three-lab": 5,
  "trading-lab": 2
}

/** 이미지 슬롯마다 찍힌 저장소 이름. 0번이 대표 이미지. */
export const SHOTS: Record<string, string[]> = {
  "canvas-lab": [
    "particle-colorful-stars"
  ],
  "multicanvas-lab": [
    "multicanvas"
  ],
  "scroll-3d": [
    "scroll-page"
  ],
  "three-lab": [
    "isosmetric-02",
    "isosmetric-01",
    "custom_model",
    "controls-01",
    "ilbunidiary"
  ],
  "game-lab": [
    "neon-fist",
    "game-cabinet",
    "bridge",
    "first-person-perspective",
    "lets-fps"
  ],
  "trading-lab": [
    "zenith",
    "coin-lab-v2"
  ],
  "space-3d": [
    "my-space"
  ],
  "detect-lab": [
    "chanki-portfolio"
  ],
  "react-basics": [
    "react-todos",
    "react-practice6",
    "business-card",
    "react-modeal.net2"
  ],
  "figma-gen": [
    "chanchan2"
  ],
  "doc-merge": [
    "doc-merge"
  ]
}

/** 카드 이미지를 다른 파일명으로 쓰는 노드. 아직 없음. */
export const CARD_IMG: Record<string, string> = {}

/** 영상(<id>.mp4)이 있는 노드. 아직 없음. */
export const VID: Record<string, number> = {}

export const PARENTS: ReadonlySet<Region> = new Set([
  "frontend",
  "backend",
  "ai",
  "product",
  "lab"
] as Region[])

export const AREAS: ReadonlySet<string> = new Set([
  "frontend",
  "backend",
  "ai",
  "product",
  "lab"
])
