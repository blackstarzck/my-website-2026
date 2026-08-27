// ============================================================================
// 원본 ../nicoborja-clone/index.html 의 마지막 <script> 블록(L403–1144)을
// **쪼개지 않고** 한 모듈로 옮긴 것. 렌더러 분해는 다음 계획에서 Task 7 회귀
// 테스트의 보호 아래 진행한다. 여기서는 구조를 바꾸지 않는다.
//
// 적용한 기계적 치환 8가지:
//  1. 전체를 createEngine({ canvases }) 팩토리로 감쌌다.
//  2. getElementById('c'|'glass'|'mini') → canvases.field|glass|mini
//  3. 'origenc' 참조 삭제 — 원본 CSS L362 에서 display:none!important 인 죽은
//     엘리먼트다. drawOrigen 은 ctx(=#c)에 그리므로 동작에 영향이 없다.
//  4. 이산 상태(mode/activeId/fieldSel/galMode/galNode/regionMode/origenOn/
//     theme/focusSet/hoverId) 선언을 삭제하고 uiStore 스냅샷에서 읽는다.
//     frame() 최상단에서 ui = uiStore.getState() 를 한 번 읽는다.
//  5. 이산 상태를 쓰던 지점은 uiStore 액션 호출로 바꿨다.
//  6. 매 프레임 바뀌는 스칼라 한 벌(전이 진행도·회전·줌·시야각·필드 초점·품질 등)은
//     프레임 끝에서 engineStore 로 미러링한다.
//  7. DB/ZMAP 로컬 정의 삭제 → @/data import. const N 별칭으로 본문 수정 최소화.
//  8. regions 상수 → @/data/regions import.
//
// 규칙 하나: frame() 및 frame()에서만 호출되는 그리기 함수는 스냅샷 `ui` 를
// 읽는다. 핸들러에서도 호출되는 함수(setCrumb/setTabsOn/selRegion/rootIdx 등)와
// 모든 이벤트 핸들러는 U() 로 최신 상태를 읽는다. frame() 안에서 액션을 부른
// 직후에는 원본이 갱신된 값을 보고 계속 진행하므로 ui 를 다시 읽는다.
//
// Plan 2 Task 5: 위 6번의 스칼라 한 벌과 캔버스 치수(너비/높이/스케일/라벨 배율/
// 미니맵 치수)는 더 이상 팩토리 지역 변수가 아니다. engine/sim.ts 의 Sim 컨텍스트로
// 옮겼다(createSim). engine/viewport.ts·projection.ts 가 그 컨텍스트 하나를 받아
// resize/miniResize/proj 계열을 돌려주고, 아래 본문은 그 반환값을 원래 이름 그대로
// 구조분해해 쓴다 — 호출부 이름은 바뀌지 않는다.
// ============================================================================

import { EDGES } from '@/data/edges'
import { NODES } from '@/data/nodes'
import {
  AGRAD, AREAS, CARD_IMG, COLOR, MULTI, PARENTS, RLAB, SLUG, THEMED, TREECOLS, VID,
} from '@/data/regions'
import { SPINE } from '@/data/spine'
import type { ContentNode, Region } from '@/data/types'
import { ZMAP } from '@/data/zmap'
import { engineStore } from '@/stores/engineStore'
import { uiStore, type UISnapshot } from '@/stores/uiStore'
import { createLayoutPass } from './layout'
import { createParticles } from './particles'
import { createProjection } from './projection'
import { makeGauss, mulberry32 } from './random'
import { createBubble } from './renderers/bubble'
import { createClusters } from './renderers/clusters'
import { createGlass, type GlassShape } from './renderers/glass'
import { createHaze } from './renderers/haze'
import { createLinks } from './renderers/links'
import { createMinimap } from './renderers/minimap'
import { createOrigen, type OWord } from './renderers/origen'
import { createRings } from './renderers/rings'
import { createStars } from './renderers/stars'
import type { FieldRenderCtx } from './renderers/types'
import { createSim } from './sim'
import type { EngineDeps, EngineTestHandle } from './types'
import { createViewport } from './viewport'
import { ENTRY_ID, HOME_ITEMS, MANIFESTO_ENTRY_IDS, MANIFESTO_ID, PAGE_TEXT, REG_TABS, SKILL_LEVEL, TAB_DESC, UI_TEXT } from '@/data/site'

/** 원본이 DB.N 에 런타임으로 붙이던 z(ZMAP)를 포함한 노드. cl(파티클)은 더 이상 노드에
 *  붙지 않는다 — engine/particles.ts 의 clouds[i](노드 인덱스 배열)로 옮겼다(Task 6).
 *  drawCluster 는 이제 region 과 파티클 배열을 별도 인자로 받는다(아래 참고). */
type ENode = ContentNode & { z: number }
/** 생성된 마크업의 인라인 핸들러(onclick="galGo(event,-1)")가 요구하는 전역. */
type InlineHandlers = {
  galGo(ev: Event, d: number): void
  stripView(el: Element, nid: string, i: number): void
}
/** 원본 L738 의 개발/테스트 전용 전역. 프로덕션 번들에서는 붙이지 않는다. */
type DevHooks = {
  __open(id: string, fromPage?: boolean): void
  __focus(id: string): void
}


export function createEngine({ canvases, seed = 0xC0FFEE }: EngineDeps): EngineTestHandle {
  // 파티클 배치(노드 클라우드/haze/별/origen 허브)의 유일한 난수원. 같은 시드 →
  // 같은 픽셀 — 골든/픽셀 회귀 테스트가 재현 가능해야 성립한다.
  const rng = mulberry32(seed)
  const gauss = makeGauss(rng)
  // ── 생명주기 배선 (원본에 없던 부분. 원본의 첫 addEventListener 보다 앞서야 한다) ──
  let rafId = 0
  let zinRaf = 0
  let disposed = false
  const listeners: Array<() => void> = []

  function on<E extends Event>(
    target: EventTarget,
    type: string,
    fn: (ev: E) => void,
    opts?: AddEventListenerOptions,
  ): void {
    const handler = fn as EventListener
    target.addEventListener(type, handler, opts)
    listeners.push(() => target.removeEventListener(type, handler, opts))
  }

  /** 원본의 document.getElementById(...) 를 그대로 옮긴 헬퍼. 요소가 없으면
   *  원본과 동일하게 이후 프로퍼티 접근에서 터진다 (조용히 넘기지 않는다). */
  const gid = (id: string): HTMLElement => document.getElementById(id) as HTMLElement
  const qs = (sel: string): Element => document.querySelector(sel) as Element
  /** '#RRGGBB'.match(/\w\w/g).map(...) 의 타입 안전 버전. */
  const rgb = (hex: string): number[] => (hex.match(/\w\w/g) ?? []).map((h) => parseInt(h, 16))

  const U = (): ReturnType<typeof uiStore.getState> => uiStore.getState()
  /** frame() 최상단에서 한 번 읽는 이산 상태 스냅샷. */
  let ui: UISnapshot = U()

  // ── 원본 L1–30 · 파생 테이블과 파티클 ──
  // Depth formula: ZMAP[n.id] || 0. Must stay in sync with the same formula in
  // engine/projection.ts::nodeFieldScreen().
  const N: ENode[] = NODES.map((n) => ({ ...n, z: ZMAP[n.id] || 0 }))
  const E = EDGES
  const idIndex: Record<string, number> = Object.fromEntries(N.map((n, i) => [n.id, i] as [string, number]))
  const byId: Record<string, ENode> = Object.fromEntries(N.map((n) => [n.id, n] as [string, ENode]))
  const REG: [Region, string][] = REG_TABS
  const adj = N.map(() => new Set<number>())
  E.forEach(([a, b]) => { adj[idIndex[a]].add(idIndex[b]); adj[idIndex[b]].add(idIndex[a]) })
  const TABDESC: Record<Region, string> = TAB_DESC
  const CAM: Region[] = [...AREAS] as Region[]
  const childrenIdx: Record<number, number[]> = {}
  N.forEach((n, i) => {
    if (PARENTS.has(n.region) && n.id !== n.region) {
      const r = idIndex[n.region];(childrenIdx[r] = childrenIdx[r] || []).push(i)
    }
  })
  const numOf = (id: string): string => String(SPINE.indexOf(id) + 1).padStart(2, '0')
  const TOTAL = SPINE.length

  const esc = (s?: string): string => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
  const ease = (p: number): number => p * p * (3 - 2 * p)
  const sat = (v: number): number => Math.max(0, Math.min(1, v))
  const lerp = (a: number, b: number, t: number): number => a + (b - a) * t
  // Sim — 모듈 간 공유되는 가변 스칼라(engine/sim.ts). engineStore 의 현재 스냅샷을 한
  // 번 읽어(es) CX/CY/R/AL/DF 를 그대로 별칭한다. viewport/projection 이 각자 자기
  // canvases/sim 으로 새로 만들어지므로 엔진 인스턴스마다 독립적이다(클래스도 싱글턴도
  // 아니다).
  const es = engineStore.getState()
  const sim = createSim(es)
  // cx0/cy0/orgR/BX 는 NODES 경계에서 유도되는 상수 — createProjection() 이 계산한다.
  // orgR 은 engine/viewport.ts 의 resize()도 sim.SC 계산에 쓰므로, 여기서 sim 에 되먹인다
  // (createProjection 은 sim 을 읽기만 한다 — 이 대입은 legacy.ts 의 배선 책임이다).
  // projection 객체 자체도 남겨둔다 — engine/layout.ts·renderers/minimap.ts·
  // renderers/origen.ts 가 통째로 받는다(아래 layoutPass/minimap/origen). proj/cx0/cy0/BX
  // 를 직접 쓰던 legacy.ts 코드(원본 frame()의 좌표 변환, drawMini/drawOrigen)는 Task 5·8이
  // 전부 다른 모듈로 옮겨서, legacy.ts 자신이 구조분해로 꺼내 쓰는 필드는 orgR 하나뿐이다.
  const projection = createProjection(sim)
  sim.orgR = projection.orgR
  // 파티클(노드 클라우드/haze/별)은 engine/particles.ts 가 만든다 — 엔진 인스턴스마다
  // 주입된 rng(기본 시드 0xC0FFEE)로 시퀀스를 낸다. 같은 시드면 로드마다 같은 위치가
  // 나온다. 골든이 검사하는 레이아웃 배열에는 영향이 없다. 생성 순서(클라우드→haze→별)는
  // rng 수열 소비 순서라 바꾸지 않는다 — clouds[i] 는 N[i](=NODES[i]) 에 대응한다.
  const { clouds, haze, stars } = createParticles(rng, gauss)
  let mouseX = -999, mouseY = -999
  on<PointerEvent>(window, 'pointermove', (e) => { mouseX = e.clientX; mouseY = e.clientY }, { passive: true })

  const c = canvases.field
  const ctx = c.getContext('2d') as CanvasRenderingContext2D
  const { resize, miniResize } = createViewport(sim, canvases)
  on(window, 'resize', resize); resize()

  // ── GLASS · refracción WebGL (Task 8: engine/renderers/glass.ts) ──
  const glass = createGlass(canvases.glass, c)

  // ── 엔진 로컬 상태 (원본 L107–124). 매 프레임 바뀌는 스칼라 한 벌은 engine/sim.ts 의
  // sim 으로 옮겼다 — 위에서 이미 만들었다. 이산 상태 선언은 uiStore 로 갔다. ──
  /** setQuality() 가 sim.PQ 를 고정했는지. Task 10 의 적응형 품질 컨트롤러가 핀 상태에서
   *  자동 조절을 멈추는 데 쓴다. 이 태스크에서는 신설·대입만 하고 아직 아무도 읽지
   *  않는다 — Task 10 이 읽는 코드를 추가하면 아래 억제를 제거한다. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let qualityPinned = false
  let bubbleShape: { cx: number; cy: number; r: number; a: number } | null = null
  let galA = 0
  let pageNeighbors: number[] = [], nbRank: Record<number, number> = {}
  let gate = 0
  /* horizontal focus of the field (0.5=center). Shifts to the left half when the desktop window is open.
   * 필드 초점 값 자체는 sim.fieldCX 로 옮겼다 — fieldCXt 는 그 프레임의 목표값일 뿐
   * engine 밖 어디서도 읽지 않아 로컬로 남는다. */
  let fieldCXt = 0.5
  let userInteracted = false
  /** returnHome() 이 전이 완료 시점까지 미뤄둔 goHome. (ambiguity #2 참고) */
  let pendingHome = false
  // per-node CX/CY/R/AL/DF 계산(engine/layout.ts, Task 6). nbRank 는 openPage() 가
  // 재대입하므로(`nbRank = {}`) 구조분해로 값을 한 번만 들고 있으면 stale 참조가 된다 —
  // getter 로 넘겨 매 프레임 최신 객체를 다시 읽는다.
  const layoutPass = createLayoutPass({ sim, projection, getNbRank: () => nbRank })
  // 2D 필드 렌더러(Task 7). stars/haze 는 FieldRenderer 모양(rc 하나만 받는다) 그대로다 —
  // engine/renderers/types.ts 상단 메모 참고.
  const starsRenderer = createStars({ sim, stars })
  const hazeRenderer = createHaze({ projection, haze })
  // links/rings/bubble/clusters 는 FieldRenderer 모양이 아니다 — frame() 이 여러 시점에서
  // 여러 번 호출하는 프리미티브라 원본 호출부를 그대로 두고 참조만 이 모듈들로 옮겼다
  // (engine/renderers/types.ts 상단 메모 참고).
  const links = createLinks({ ctx })
  const rings = createRings({ ctx })
  const bubble = createBubble({ ctx })
  const clusters = createClusters({ ctx })

  // ────────────────────────────────────────────────────────────────────────
  // 리뷰 Fix 5: 아래부터는 정적 DOM 골격이 요구하는 엘리먼트를 gid() 로 하나씩 찾는다.
  // 골격이 어긋나 있으면(id 하나만 누락돼도) 그 자리에서 던지고, createEngine() 은
  // 핸들을 반환하지 못한다 — 그러면 dispose() 를 부를 방법이 사라져 이미 등록된 window
  // pointermove/resize 리스너(:185,:200 근처, on() 으로 등록)가 이 문서 생애 내내
  // 회수되지 않는다. dispose() 의 완전한 teardown을 재사용해 던진 뒤 원래 에러를 다시
  // 던지도록 남은 본문을 try 로 감싼다.
  //
  // dispose() 는 이미 멱등·null-안전하지만, 그 안에서 읽는 origenEntering/win/
  // unsubscribeUI 는 원래 이 지점보다 한참 뒤(각각 origen 섹션·인라인 핸들러 전역·
  // uiStore 구독)에서 선언됐다 — 실패가 그 전에 나면 dispose() 가 TDZ 에러로 다시
  // 던져 원래 에러를 가리고 teardown도 중간에 멈춘다. 그래서 세 값의 선언만 여기로
  // 끌어올렸다(로직은 원래 자리에 그대로 있고, 대입만 한다 — 아래 참고). 나머지
  // (rafId/zinRaf/listeners/disposed 는 최상단, gid/U 는 :100 부근, glass 는 :184
  // 부근)는 이미 이 지점보다 앞이라 그대로 둔다.
  const win = window as unknown as Window & Partial<InlineHandlers> & Partial<DevHooks>
  let unsubscribeUI: () => void = () => {}
  let origenEntering = false

  function dispose(): void {
    disposed = true
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0 }
    if (zinRaf) { cancelAnimationFrame(zinRaf); zinRaf = 0 }
    for (const off of listeners) off()
    listeners.length = 0
    unsubscribeUI()
    // 줌인 도중에 dispose 되면 body.origen 이 남아 다음 엔진이 origen 화면으로 오인한다.
    if (origenEntering) {
      origenEntering = false
      if (!U().origenOn) document.body.classList.remove('origen')
    }
    delete win.galGo
    delete win.stripView
    delete win.__open
    delete win.__focus
    // GL 자원 해제(프로그램/버퍼/텍스처)와 loseContext() 를 부르지 않는 이유는
    // engine/renderers/glass.ts 의 모듈 주석·dispose() 로 옮겼다 — #glass 캔버스는
    // React 가 소유하고 리마운트에서 재사용되므로 컨텍스트 자체는 살려둔다(Plan 1에서
    // 확립, StrictMode 이중 마운트로 실측 확인된 계약. Task 8 Fact #4).
    glass.dispose()
    // 리뷰 Fix 6: #doc/#gallery 는 React 가 소유한 정적 컨테이너다(MapCanvas.tsx). 엔진이
    // innerHTML 로 채운 마크업과 그 안의 .onclick 클로저를 비우지 않으면, dispose 이후
    // 우연히 살아남은 카드를 클릭할 때 죽은 엔진의 openPage 등이 uiStore 를 건드리면서도
    // 그 엔진의 지역 상태(P 등)는 더 이상 진행하지 않아, 살아있는 엔진이 mode:'trans' 에
    // P 가 멈춘 상태를 보게 될 수 있다.
    // 최종 리뷰 #1: gid() 는 null 을 무검사로 캐스트한다. 생성이 #doc 자체가 없어서
    // 실패한 경우(팩토리의 catch 가 원래 진단 에러를 보존하려고 이 dispose() 를 부른다)
    // 여기서 다시 무방비로 던지면 "Cannot set properties of null" 이 원래 에러를
    // 덮어써 버린다. React 언마운트의 mutation phase 가 서브트리를 먼저 떼어내는
    // 경우도 동일하게 null 이 된다. :1858 의 기존 패턴과 동일하게 null-가드한다.
    const _d = document.getElementById('doc'); if (_d) _d.innerHTML = ''
    const _g = document.getElementById('gallery'); if (_g) _g.innerHTML = ''
  }

  try {
  const themebtn = gid('themebtn')
  on(themebtn, 'click', () => {
    U().toggleTheme()
    const s = U()
    // body 의 light 클래스는 BodyClassSync 가 uiStore.theme 에서 선언적으로 붙인다.
    themebtn.innerHTML = (s.theme === 'light')
      ? '<span class="ti">☾</span><span class="tl">' + PAGE_TEXT.themeDark + '</span>'
      : '<span class="ti">☀</span><span class="tl">' + PAGE_TEXT.themeLight + '</span>'
    if (s.mode === 'field') renderGallery()
  })

  /** 원본의 "origen 해제" 사이드이펙트. origenOn 자체는 호출자의 uiStore 액션이 내린다. */
  function leaveOrigenClasses(): void {
    document.body.classList.remove('origen', 'origen-in', 'org-zoom')
    origenLaidOut = false
    origenEntering = false
  }
  function goHome(): void {
    const s = U()
    if (s.origenOn) leaveOrigenClasses()
    // fieldSel/regionMode/focusSet/galMode/galNode/origenOn (+activeId, mode) 를 액션이 담당한다.
    s.goHome()
    sim.userZoom = 1; sim.viewRot = 0; sim.viewTiltX = 0; userInteracted = false
    setCrumb(); setTabsOn(); renderGallery(); setHash(ENTRY_ID)
  }
  function setFieldFocus(id: string): void {
    if (U().origenOn) leaveOrigenClasses()
    // selectNode 가 원본 setFieldFocus 의 세 분기(진입 / 영역 / 노드)를 그대로 재현한다.
    U().selectNode(id)
    setCrumb(); setTabsOn(); renderGallery(); setHash(id)
  }
  /** hoverId 는 이산 상태다. 값이 실제로 바뀔 때만 액션을 부른다. */
  function setHoverId(id: string | null): void { if (U().hoverId !== id) U().setHover(id) }
  function selRegion(): Region {
    const s = U()
    return byId[s.fieldSel] ? byId[s.fieldSel].region : 'entry'
  }

  // ── 미니맵 (engine/renderers/minimap.ts) ──
  const mini = canvases.mini
  miniResize(); on(window, 'resize', miniResize)
  const minimap = createMinimap({ sim, projection, canvas: mini, uiLive: U })

  function frame(ts: number): void {
    ui = U()
    const t = (ts || 0) / 1000
    const dt = Math.min(0.05, ((ts || 0) - sim.lastTs) / 1000 || 0)
    sim.lastTs = ts || 0
    if (ui.origenOn) { origen.draw(ui, t, dt); return }
    if (sim.playing) {
      sim.P += sim.transDir * dt / 0.95
      if (sim.P >= 1) {
        sim.P = 1; sim.playing = false
        // 라우트성 상태 변화. 전이당 한 번만 발생한다 (매 프레임이 아니다).
        if (ui.mode === 'trans' && sim.transDir > 0) { U().setMode('page'); ui = U() }
      }
      if (sim.P <= 0) {
        sim.P = 0; sim.playing = false
        if (sim.transDir < 0) {
          if (pendingHome) { pendingHome = false; goHome() } else { U().returnField() }
          ui = U()
          gid('doc').innerHTML = ''; setCrumb()
        }
      }
    }
    if (ui.mode === 'cold') {
      sim.coldP += dt / 2.8
      if (sim.coldP >= 1) { sim.coldP = 1; U().setMode('field'); setFieldFocus(ENTRY_ID); ui = U() }
      sim.camZoom = lerp(0.6, 1.0, ease(sim.coldP))
    } else sim.camZoom = 1
    if ((ui.mode === 'field' || ui.mode === 'cold') && !userInteracted) sim.curRot += dt * 0.10
    else if (ui.mode === 'page') sim.curRot += dt * 0.03
    sim.curBr = 1 + Math.sin(t * 0.5) * 0.02
    gate += ((ui.regionMode ? 1 : 0) - gate) * 0.08
    {
      const _gEl = gid('gallery')
      const _galShown = (ui.mode === 'field') && !!ui.galMode && innerWidth > 760
      fieldCXt = _galShown ? ((sim.W - _gEl.offsetWidth) / (2 * sim.W)) : 0.5
      sim.fieldCX += (fieldCXt - sim.fieldCX) * 0.08
    }
    // selIdx/aIdx/eViz/fieldLike 유도와 그 값을 만드는 per-node CX/CY/R/AL/DF 루프는
    // engine/layout.ts 의 compute() 로 옮겼다(Task 6). camZoom/fieldCX 같은 카메라 값의
    // 시간 진행은 위에서 이미 끝났고, compute() 는 그 결과를 읽기만 한다.
    const lf = layoutPass.compute(ui, t)
    const LITE = (ui.theme === 'light')
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = LITE ? '#EFE7D4' : '#100E1A'
    ctx.fillRect(0, 0, sim.W, sim.H)
    ctx.globalCompositeOperation = LITE ? 'source-over' : 'lighter'
    // 2D 필드 렌더러(Task 7)에 넘길 컨텍스트. stars/haze 는 이 객체 하나를 그대로 받는다
    // (engine/renderers/types.ts 의 FieldRenderCtx). eng 는 engineStore 의 미러 스냅샷이다 —
    // stepFrame() 이 프레임 끝에서만 갱신하므로 이 시점엔 "이전 프레임" 값이지만, 현재
    // 어떤 필드 렌더러도 rc.eng 를 읽지 않으므로 무해하다(향후 렌더러가 읽게 되면 이
    // staleness 를 재검토할 것).
    const rc: FieldRenderCtx = {
      ctx, W: sim.W, H: sim.H, t, dt, ui, eng: engineStore.getState(),
      eViz: lf.eViz, selIdx: lf.selIdx, aIdx: lf.aIdx,
    }
    starsRenderer(rc)
    hazeRenderer(rc)
    for (const [a, b] of E) {
      const ia = idIndex[a], ib = idIndex[b]
      if (lf.fieldLike) {
        const lit = ui.focusSet.has(ia) || ui.focusSet.has(ib)
        const al = lit ? 0.5 : 0.1
        if (al <= 0.005) continue
        links.curveDots(ui, sim.CX[ia], sim.CY[ia], sim.CX[ib], sim.CY[ib], al, lit ? 8 : 5, lit ? 1.5 : 1.1, t, lit ? 0.13 : 0.04,
          lit ? COLOR[selRegion()] : null)
      } else {
        const on = (a === ui.activeId || b === ui.activeId)
        const al = on ? (0.10 + 0.42 * lf.eViz) : (0.05 + 0.03 * lf.eViz)
        links.curveDots(ui, sim.CX[ia], sim.CY[ia], sim.CX[ib], sim.CY[ib], al, on ? 7 : 5, on ? 1.5 : 1.1, t, on ? 0.13 : 0.04,
          on ? COLOR[ui.activeId ? byId[ui.activeId].region : 'entry'] : null)
      }
    }
    for (let i = 0; i < N.length; i++) {
      if (sim.AL[i] <= 0.01) continue
      clusters.drawCluster(ui, N[i].region, clouds[i], sim.CX[i], sim.CY[i], sim.R[i], sim.AL[i], sim.DF[i], t)
    }
    if (lf.fieldLike) {
      for (let i = 0; i < N.length; i++) {
        if (i === lf.selIdx) continue
        if (childrenIdx[i] && childrenIdx[i].length && sim.AL[i] > 0.05) clusters.drawMicroNodes(ui, i, sim.CX[i], sim.CY[i], sim.R[i], sim.AL[i], t)
      }
    }
    if (lf.fieldLike && !(ui.galMode && ui.theme === 'dark')) {
      ctx.globalCompositeOperation = 'source-over'
      for (const aid of AREAS) {
        const i = idIndex[aid]
        const foc = ui.focusSet.has(i) || i === lf.selIdx
        const aa = Math.max(sim.AL[i], 0.5)
        rings.drawAreaRing(sim.CX[i], sim.CY[i], sim.R[i], COLOR[N[i].region], aa * (foc ? 1 : 0.65))
        if (!ui.regionMode) {
          ctx.font = '600 ' + (10.5 * sim.LBL) + 'px ui-monospace,Menlo,monospace'
          const A = rgb(COLOR[N[i].region])
          ctx.fillStyle = `rgba(${A[0]},${A[1]},${A[2]},${(foc ? 0.96 : 0.6) * aa})`
          ctx.fillText(N[i].name.toUpperCase(), sim.CX[i] + sim.R[i] * 1.5 + 6, sim.CY[i] + 3)
        }
      }
    }
    bubbleShape = null
    if (ui.mode !== 'field' && lf.aIdx >= 0) {
      bubble.drawBubble(ui, sim.CX[lf.aIdx], sim.CY[lf.aIdx], sim.R[lf.aIdx] * 1.5, lf.eViz)
      bubbleShape = { cx: sim.CX[lf.aIdx], cy: sim.CY[lf.aIdx], r: sim.R[lf.aIdx] * 1.5, a: lf.eViz }
    } else if (lf.fieldLike) {
      bubble.drawBubble(ui, sim.CX[lf.selIdx], sim.CY[lf.selIdx], sim.R[lf.selIdx] * 1.5, 1)
      bubbleShape = { cx: sim.CX[lf.selIdx], cy: sim.CY[lf.selIdx], r: sim.R[lf.selIdx] * 1.5, a: 1 }
    }
    if (!lf.fieldLike && lf.aIdx >= 0 && lf.eViz > 0.45) {
      ctx.globalCompositeOperation = 'source-over'
      ctx.font = '600 ' + (10.5 * sim.LBL) + 'px ui-monospace,Menlo,monospace'
      for (const ix of pageNeighbors) {
        if (sim.AL[ix] < 0.2) continue
        ctx.fillStyle = (ui.theme === 'light') ? `rgba(28,30,40,${0.66 * lf.eViz})` : `rgba(255,255,255,${0.6 * lf.eViz})`
        ctx.fillText('· ' + N[ix].name, sim.CX[ix] + sim.R[ix] * 1.1 + 5, sim.CY[ix] + 3)
      }
    }
    if (lf.fieldLike && ui.regionMode && gate > 0.25) {
      ctx.globalCompositeOperation = 'source-over'
      for (const i of ui.focusSet) {
        const isRoot = i === lf.selIdx
        ctx.font = ((isRoot ? 12 : 11) * sim.LBL) + 'px ui-monospace,Menlo,monospace'
        ctx.fillStyle = (ui.theme === 'light')
          ? `rgba(28,30,40,${(isRoot ? 0.92 : 0.66) * gate})`
          : `rgba(255,255,255,${(isRoot ? 0.85 : 0.6) * gate})`
        ctx.fillText((isRoot ? '> ' : '· ') + N[i].name,
          sim.CX[i] + sim.R[i] * (isRoot ? 1.25 : 1.05) + 4, sim.CY[i] + (isRoot ? 0 : 3))
      }
    }
    if (ui.mode === 'field' && ui.galMode) {
      const gEl = gid('gallery')
      if (gEl.classList.contains('show')) {
        const si = lf.selIdx; const col = COLOR[selRegion()]
        ctx.globalCompositeOperation = (ui.theme === 'light') ? 'source-over' : 'lighter'
        gEl.querySelectorAll('.gdot').forEach((dt) => {
          const dr = dt.getBoundingClientRect()
          if (dr.width === 0) return
          const ex = dr.left + dr.width / 2, ey = dr.top + dr.height / 2
          links.curveDots(ui, sim.CX[si], sim.CY[si], ex, ey, 0.55, 8, 1.4, t, 0.12, col)
        })
      }
    }
    if (ui.mode === 'field' && ui.hoverId && idIndex[ui.hoverId] !== lf.selIdx) {
      const i = idIndex[ui.hoverId]
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = (ui.theme === 'light') ? 'rgba(28,30,40,.5)' : 'rgba(255,255,255,.45)'
      ctx.lineWidth = 1.1
      ctx.beginPath(); ctx.arc(sim.CX[i], sim.CY[i], sim.R[i] * 1.2, 0, 6.283); ctx.stroke()
    }
    if ((ui.mode === 'field' || ui.mode === 'page') && ui.hoverId) {
      const i = idIndex[ui.hoverId]; const tipEl = gid('tip')
      tipEl.style.left = sim.CX[i] + 'px'; tipEl.style.top = (sim.CY[i] - sim.R[i] * 0.85) + 'px'
    }
    // DOM
    const pageEl = gid('page'), docEl = gid('doc'), topEl = gid('pagetop')
    const isPage = (ui.mode === 'trans' || ui.mode === 'page')
    const pop = isPage ? sat((sim.P - 0.25) / 0.55) : 0
    pageEl.style.opacity = String(pop)
    pageEl.style.pointerEvents = (isPage && sim.P > 0.55) ? 'auto' : 'none'
    docEl.style.transform = `translateY(${(1 - ease(sat((sim.P - 0.3) / 0.7))) * 70}px)`
    const chO = isPage ? sat((sim.P - 0.5) / 0.4) : 0
    topEl.style.opacity = String(chO); topEl.style.pointerEvents = chO > 0.5 ? 'auto' : 'none'
    const uiOp = (ui.mode === 'cold') ? sat((sim.coldP - 0.55) / 0.4) : 1
    const tabsElF = gid('tabs')
    tabsElF.style.opacity = String((ui.mode === 'cold') ? uiOp : 1)
    tabsElF.style.pointerEvents = (ui.mode === 'field' || ui.mode === 'page') ? 'auto' : 'none'
    gid('wordmark').style.opacity = String((ui.mode === 'cold') ? sat((sim.coldP - 0.62) / 0.3) : 1)
    const miniO = (ui.mode === 'cold') ? uiOp : 0.69
    mini.style.opacity = String(miniO); gid('minilbl').style.opacity = String(miniO)
    gid('crumb').style.opacity = String((ui.mode === 'cold') ? uiOp : (ui.mode === 'field' ? 1 : 0))
    gid('gallery').classList.toggle('show', ui.mode === 'field' && !!ui.galMode)
    gid('hint').style.opacity =
      String((ui.mode === 'field' && !ui.hoverId && !ui.regionMode && !ui.galMode) ? 1 : 0)
    const ct = gid('coldtitle')
    ct.style.opacity = String((ui.mode === 'cold')
      ? (sim.coldP < 0.12 ? sim.coldP / 0.12 : 1 - sat((sim.coldP - 0.5) / 0.4))
      : 0)
    const home = (ui.mode === 'field' && ui.fieldSel === ENTRY_ID && !ui.regionMode && !ui.galMode)
    for (const id of CAM) {
      const ch = camChips[id]; if (!ch) continue
      const i = idIndex[id]
      const ox = sim.CX[i] - sim.W / 2, oy = sim.CY[i] - sim.H / 2
      const L = Math.hypot(ox, oy) || 1
      const off = sim.R[i] + 16
      ch.style.left = (sim.CX[i] + ox / L * off) + 'px'; ch.style.top = (sim.CY[i] + oy / L * off) + 'px'
      ch.style.opacity = home ? '1' : '0'; ch.style.pointerEvents = home ? 'auto' : 'none'
    }
    minimap.draw(ui, t)
    const _shapes: GlassShape[] = []
    galA += (((ui.mode === 'field' && ui.galMode) ? 1 : 0) - galA) * 0.16
    if (galA > 0.012) {
      const r = gid('gallery').getBoundingClientRect()
      const EXT = 420
      let rx = r.left, ry = r.top, rw = r.width, rh = r.height
      if (innerWidth <= 760) { rx -= EXT; rw += 2 * EXT; rh += EXT } else { ry -= EXT; rh += 2 * EXT; rw += EXT }
      _shapes.push({ x: rx, y: ry, w: rw, h: rh, rad: (innerWidth <= 760 ? 22 : 2), amt: ease(galA) })
    }
    if (bubbleShape && bubbleShape.a > 0.45 && ui.mode !== 'cold') {
      const b = bubbleShape
      _shapes.push({ x: b.cx - b.r, y: b.cy - b.r, w: b.r * 2, h: b.r * 2, rad: b.r, amt: 0.55 })
    }
    glass.render(_shapes, ui.theme === 'light' ? 1.0 : 0.0)
  }

  /** frame() 을 감싸 모든 종료 경로에서 engineStore 로 미러링한다.
   *  sim.CX/CY/R/AL/DF 는 스토어의 Float64Array 를 그대로 별칭해 제자리에 쓰고 있으므로
   *  넘기지 않는다 (참조가 동일해서 setState 에 실어도 무의미하고, 매 프레임 할당만
   *  늘어난다). */
  function stepFrame(ts: number): void {
    frame(ts)
    engineStore.setState({
      P: sim.P,
      coldP: sim.coldP,
      transDir: sim.transDir,
      playing: sim.playing,
      curRot: sim.curRot,
      curBr: sim.curBr,
      camZoom: sim.camZoom,
      userZoom: sim.userZoom,
      viewRot: sim.viewRot,
      viewTiltX: sim.viewTiltX,
      fieldCX: sim.fieldCX,
      PQ: sim.PQ,
    })
  }

  // ── BREADCRUMB / TABS ──
  function setCrumb(): void {
    const s = U()
    const cp = gid('cpath'), cn = gid('cnum')
    if (s.activeId) {
      const n = byId[s.activeId]
      cp.innerHTML = '~/' + SLUG[n.region] + '/<b>' + n.id + '</b>'
      cn.textContent = '· ' + esc(RLAB[n.region])
      return
    }
    if (s.fieldSel === ENTRY_ID && !s.regionMode) {
      cp.innerHTML = `~/<b>${esc(ENTRY_ID)}</b>`; cn.textContent = UI_TEXT.homeCrumb; return
    }
    const n = byId[s.fieldSel]
    if (s.regionMode) {
      cp.innerHTML = '~/<b>' + SLUG[n.region] + '</b>'
      cn.textContent = '· ' + (childrenIdx[idIndex[s.fieldSel]] || []).length + PAGE_TEXT.projectsSuffix
    } else {
      cp.innerHTML = '~/' + SLUG[n.region] + '/<b>' + n.id + '</b>'
      cn.textContent = '· ' + esc(RLAB[n.region])
    }
  }
  const tabsEl = gid('tabs')
  function setTabsOn(): void {
    const s = U()
    let r: Region
    if (s.activeId && byId[s.activeId] && (s.mode === 'page' || (s.mode === 'trans' && sim.transDir === 1))) {
      r = byId[s.activeId].region
    } else {
      r = s.regionMode
        ? selRegion()
        : (s.fieldSel === ENTRY_ID ? 'entry' : selRegion())
    }
    Array.from(tabsEl.children).forEach((x) => {
      const el = x as HTMLElement
      if (!el.dataset.r) return
      const on = el.dataset.r === r
      el.classList.toggle('on', on)
      el.style.background = on ? COLOR[el.dataset.r as Region] : ''
    })
  }
  // 컨테이너는 React 가 렌더한 자리표시자다. 재마운트 때 중복 append 되지 않게 비운다.
  tabsEl.innerHTML = ''
  const tlead = document.createElement('div')
  tlead.id = 'tabslead'; tlead.textContent = PAGE_TEXT.tabsLead; tabsEl.appendChild(tlead)
  REG.forEach(([r, lab]) => {
    const d = document.createElement('div')
    d.className = 't'; d.dataset.r = r; d.title = TABDESC[r] || ''
    d.innerHTML = `<i style="background:${COLOR[r]}"></i>${lab}`
    d.onclick = () => {
      if (U().mode !== 'field') returnField()
      setHoverId(null); hideTip()
      if (r === 'entry') setFieldFocus(ENTRY_ID)
      else setFieldFocus(r)
    }
    tabsEl.appendChild(d)
  })
  const caminosEl = gid('caminos')
  caminosEl.innerHTML = ''
  const camChips: Record<string, HTMLElement> = {}
  CAM.forEach((id) => {
    const a = document.createElement('div')
    a.className = 'camino'; a.style.setProperty('--cc', COLOR[byId[id].region])
    a.innerHTML = `<i></i>${byId[id].name}<span class="ca">${PAGE_TEXT.explore}</span>`
    a.onclick = () => { setHoverId(null); hideTip(); setFieldFocus(id) }
    caminosEl.appendChild(a); camChips[id] = a
  })
  const tip = gid('tip')
  function showTip(n: ENode): void {
    const s = U()
    const col = COLOR[n.region]
    const nm = tip.querySelector('.nm') as HTMLElement
    nm.innerHTML = '<span class="tdot" style="background:' + col + ';box-shadow:0 0 8px ' + col + '"></span>' + esc(n.name)
    ;(tip.querySelector('.kc') as HTMLElement).textContent = n.kicker || ''
    const isP = PARENTS.has(n.region) && n.id === n.region
    const drilled = s.regionMode && s.fieldSel === n.id
    let go: string
    if (n.id === ENTRY_ID) go = UI_TEXT.homeCrumb
    else if (isP) go = drilled ? PAGE_TEXT.areaOpen : PAGE_TEXT.areaExplore
    else go = PAGE_TEXT.projectEnter
    const tc = (s.theme === 'light' && col === '#CFFF04') ? '#067a70' : col
    const goEl = tip.querySelector('.go') as HTMLElement
    goEl.textContent = go; goEl.style.color = tc
    tip.style.borderColor = tc; tip.style.opacity = '1'
  }
  function hideTip(): void { tip.style.opacity = '0' }
  // ── PÁGINA editorial ──
  /** 노드별 인라인 임베드 URL. 필요해지면 여기에 추가한다. */
  const EMBED: Record<string, string> = {}
  /** 임베드의 전체보기 URL. */
  const EMBED_FULL: Record<string, string> = {}
  let galOrig = '', galPos = 0
  function media(n: ENode): string {
    let inner: string, figCls = 'mediaframe', figAttrs = '', cap = ''
    if (EMBED[n.id]) {
      inner = `<iframe src="${EMBED[n.id]}" loading="lazy" title="${esc(n.name)}" allow="autoplay; encrypted-media; fullscreen"></iframe>`
      figCls += ' emb'
      cap = `<span class="cap">${esc(n.cap || n.name)} · ${PAGE_TEXT.embedHint}</span>`
        + (EMBED_FULL[n.id] ? `<a class="embfull" href="${EMBED_FULL[n.id]}" target="_blank">${PAGE_TEXT.embedFull}</a>` : '')
    } else if (VID[n.id]) {
      inner = `<video src="/assets/${n.id}.mp4" autoplay loop muted playsinline poster="/assets/${n.id}.jpg" onerror="this.parentNode.classList.add('noimg');this.remove()"></video>`
      cap = n.cap ? `<span class="cap">${esc(n.cap)}</span>` : ''
    } else {
      inner = `<img src="${imgSrc(n.id)}" alt="" onerror="this.parentNode.classList.add('noimg');this.remove()">`
      cap = n.cap ? `<span class="cap">${esc(n.cap)}</span>` : ''
    }
    if (!EMBED[n.id] && n.url) {
      figCls += ' clk'
      figAttrs = n.url.charAt(0) === '#'
        ? ` onclick="location.hash='${n.url.slice(1)}'" title="${esc(n.urlLabel || PAGE_TEXT.openFallback)}"`
        : ` onclick="window.open('${n.url}','_blank')" title="${PAGE_TEXT.openProject}"`
    }
    galOrig = inner; galPos = 0
    const nav = (MULTI[n.id] >= 2)
      ? `<button class="gnav gprev" onclick="galGo(event,-1)" aria-label="anterior">‹</button><button class="gnav gnext" onclick="galGo(event,1)" aria-label="siguiente">›</button>`
      : ''
    return `<figure class="${figCls}"${figAttrs}><div class="gview">${inner}</div>${nav}</figure>${cap}`
  }
  function galGo(ev: Event, d: number): void {
    ev.stopPropagation(); ev.preventDefault()
    const activeId = U().activeId
    const n = activeId ? byId[activeId] : undefined
    if (!n) return
    const total = MULTI[n.id] || 1
    galPos = (galPos + d + total) % total
    galShow(n)
  }
  const GVID: Record<string, Record<number, string>> = {
    ess: { 2: 'soundcheck-10s.mp4' },
    soundcheck: { 2: 'soundcheck-10s.mp4' },
  }
  function galShow(n: ENode): void {
    const v = document.querySelector('#doc .gview')
    if (!v) return
    const gv = GVID[n.id] && GVID[n.id][galPos + 1]
    v.innerHTML = (galPos === 0)
      ? galOrig
      : (gv
        ? '<video src="/assets/' + gv + '" autoplay loop muted playsinline></video>'
        : '<img src="/assets/' + n.id + '-' + (galPos + 1) + '.jpg" alt="" onerror="this.remove()">')
    document.querySelectorAll('#doc .imgstrip .it').forEach(function (x, k) {
      x.classList.toggle('on', k === galPos - 1)
    })
  }
  function cardMedia(id: string): string {
    return VID[id]
      ? `<video src="/assets/${id}.mp4" autoplay loop muted playsinline poster="/assets/${id}.jpg" onerror="this.remove()"></video>`
      : `<img src="${cardImgSrc(id)}" alt="" onerror="this.remove()">`
  }
  function ncard(m: ENode): string {
    const isA = AREAS.has(m.id)
    const thumb = isA ? '' : `<div class="cthumb"><div class="cph">${esc(m.name)}</div>${cardMedia(m.id)}</div>`
    return `<a class="ncard${isA ? ' ncardA' : ''}" data-go="${m.id}" style="--cc:${COLOR[m.region]};--ag:${areaGrad(m.region)}">
   ${thumb}
   <div class="cbody"><div class="ct"><i></i>${isA ? PAGE_TEXT.areaWord : esc(RLAB[m.region])}</div>
   <div class="cn">${esc(m.name)}</div><div class="ck">${esc(m.sum || m.kicker || '')}</div>
   <div class="cgo">${isA ? PAGE_TEXT.openArea : PAGE_TEXT.open}</div></div></a>`
  }
  function projectDetail(n: ENode): string {
    // 원본은 project 필드가 노드 최상위에 있었다. data/nodes.ts 는 n.project 로 중첩한다.
    const pj = n.project
    if (!pj) return ''
    const hasG = pj.role || pj.duration || pj.impact || (pj.skills && pj.skills.length)
    const hasD = pj.scope || (pj.objectives && pj.objectives.length) || (pj.impacts && pj.impacts.length) || pj.story
    if (!hasG && !hasD) return ''
    const LV: Record<string, [string, string]> = {
      ...SKILL_LEVEL,
    }
    let out = ''
    if (hasG) {
      const rows: [string, string][] = []
      if (pj.role) rows.push([PAGE_TEXT.glance.role, pj.role])
      if (pj.duration) rows.push([PAGE_TEXT.glance.duration, pj.duration])
      if (pj.impact) rows.push([PAGE_TEXT.glance.impact, pj.impact])
      const rh = rows.map((r) => '<div class="gl-row"><div class="k">' + esc(r[0]) + '</div><div class="v">' + esc(r[1]) + '</div></div>').join('')
      let sh = ''
      if (pj.skills && pj.skills.length) {
        sh = '<div class="gl-skills"><div class="gl-sklab">Skills</div>' + pj.skills.map((s) => {
          const lv = (s[1] || 'core'); const L = LV[lv] || LV.core
          return '<span class="sk sk-' + lv + '" title="' + L[1] + '">' + esc(s[0]) + '<i>' + L[0] + '</i></span>'
        }).join('') + '</div>'
      }
      out += '<div class="glance"><div class="gl-rows">' + rh + '</div>' + sh + '</div>'
    }
    if (hasD) {
      let sec = ''
      if (pj.scope) sec += '<div class="dv-sec"><div class="dv-h">' + PAGE_TEXT.section.scope + '</div><p>' + esc(pj.scope) + '</p></div>'
      if (pj.objectives && pj.objectives.length) {
        sec += '<div class="dv-sec"><div class="dv-h">' + PAGE_TEXT.section.objectives + '</div><ul>'
          + pj.objectives.map((o) => '<li>' + esc(o) + '</li>').join('') + '</ul></div>'
      }
      if (pj.impacts && pj.impacts.length) {
        sec += '<div class="dv-sec"><div class="dv-h">' + PAGE_TEXT.section.impacts + '</div><ul>'
          + pj.impacts.map((o) => '<li>' + esc(o) + '</li>').join('') + '</ul></div>'
      }
      if (pj.story) sec += '<div class="dv-sec"><div class="dv-h">' + PAGE_TEXT.section.story + '</div><p>' + esc(pj.story) + '</p></div>'
      out += '<button class="dv-toggle" data-dive>' + PAGE_TEXT.detailToggle + ' <i>↓</i></button><div class="dive" hidden>' + sec + '</div>'
    }
    return out
  }
  function buildPage(n: ENode): void {
    const acc = COLOR[n.region]
    document.documentElement.style.setProperty('--acc', acc)
    const _pg = gid('page')
    _pg.style.setProperty('--ag', areaGrad(n.region))
    _pg.style.setProperty('--cc', acc)
    
    const cta = n.url
      ? (n.url.charAt(0) === '#'
        ? `<a class="cta" href="${n.url}">${esc(n.urlLabel || PAGE_TEXT.open)}</a>`
        : `<a class="cta" href="${n.url}" target="_blank">${esc(n.urlLabel || PAGE_TEXT.openExternal)}</a>`)
      : ''
    const metaItems: [string, string][] = [[PAGE_TEXT.metaOnMap, RLAB[n.region] + ' · ' + numOf(n.id) + ' / ' + TOTAL]]
    if (n.kicker) metaItems.push([PAGE_TEXT.metaContext, n.kicker])
    if (n.cap) metaItems.push([PAGE_TEXT.metaPiece, n.cap])
    const meta = `<div class="meta">${metaItems.map(([k, v]) => `<div><div class="k">${esc(k)}</div><div class="v">${esc(v)}</div></div>`).join('')}</div>`
    const _pa = REG2AREA[n.region]
    let nbs = relatedNodes(n)
    if (_pa && _pa !== n.id && byId[_pa]) nbs = [byId[_pa]].concat(nbs)
    const cards = nbs.map(ncard).join('')
    const pa = REG2AREA[n.region]
    const seclab = (pa && pa !== n.id) ? (RLAB[n.region] + ' ' + PAGE_TEXT.moreOf) : PAGE_TEXT.followThread
    const secl2 = (pa && pa !== n.id)
      ? PAGE_TEXT.relatedNote
      : PAGE_TEXT.relatedNoteAll
    const links = n.links
      ? `<div class="links">${n.links.map(([t, u]) => (u.charAt(0) === '#' || u.charAt(0) === '/')
        ? `<a class="lk" href="${u}">${esc(t)} →</a>`
        : `<a class="lk" href="${u}" target="_blank">${esc(t)} ↗</a>`).join('')}</div>`
      : ''
    const foot = `<div class="pgfoot">${n.id !== 'contact' ? `<span class="lk" data-go="contact">↦ ${esc(byId['contact']?.name ?? '')}</span>` : ''}<span class="lk" data-go="${ENTRY_ID}">↑ 지도의 중심으로</span></div>`
    gid('doc').innerHTML = `
   <div class="kicker">${esc(n.kicker || '')}</div>
   <h1 class="title">${esc(n.sum || '')}</h1>
   <p class="lead">${esc(n.body || '')}</p>
   ${cta}${links}
   ${meta}
   ${projectDetail(n)}
   <div class="media">${media(n)}${imgStrip(n)}</div>
   <div class="seclab">${esc(seclab)}</div><div class="seclab2">${secl2}</div>
   <div class="cardgrid">${cards}</div>
   ${foot}
   <div class="treelab2">${PAGE_TEXT.treeFull}</div>${siteTreeHTML()}`
    ;(function () {
      const dv = document.querySelector('#doc [data-dive]') as HTMLElement | null
      if (!dv) return
      dv.onclick = function () {
        const d = dv.nextElementSibling as HTMLElement
        const i = dv.querySelector('i') as HTMLElement
        if (d.hasAttribute('hidden')) {
          d.removeAttribute('hidden'); dv.classList.add('on'); i.textContent = '↑'
          setTimeout(function () { dv.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, 40)
        } else { d.setAttribute('hidden', ''); dv.classList.remove('on'); i.textContent = '↓' }
      }
    })()
    // 원본(<id>-full.jpg)이 있는 노드만 이미지를 눌러 모달로 볼 수 있다.
    // 있는지 없는지는 목록으로 들고 있지 않고 실제로 불러 보고 판단한다 —
    // 이미지를 추가하면 데이터를 고치지 않아도 따라온다.
    ;(function () {
      const mf = document.querySelector('#doc .mediaframe') as HTMLElement | null
      if (!mf) return
      const src = '/assets/' + n.id + '-full.jpg'
      const probe = new Image()
      probe.onload = function () {
        mf.classList.add('zoomable')
        mf.onclick = function () { openLightbox(src, n.name) }
      }
      probe.src = src
    })()
    gid('doc').querySelectorAll('[data-go]').forEach((p) => {
      (p as HTMLElement).onclick = (ev) => { ev.preventDefault(); navigate((p as HTMLElement).dataset.go as string) }
    })
    gid('chnum').textContent = ''
    gid('page').scrollTop = 0
  }
  function openPage(id: string, fromPage?: boolean): void {
    const n = byId[id]; if (!n) return
    if (MANIFESTO_ID && id === MANIFESTO_ID) { openOrigen(); return }
    if (U().origenOn) leaveOrigenClasses()
    if (id === 'substack') { window.open(n.url, '_blank'); return }
    // openNode 가 activeId 를 세우고 origenOn 을 내린다. mode 는 'page' 로 올라가므로
    // 아래에서 원본의 'trans' 를 복원한다 (전이 완료 시 frame() 이 다시 'page' 로 올린다).
    U().openNode(id)
    setHoverId(null); hideTip()
    pageNeighbors = [...adj[idIndex[id]]]; nbRank = {}
    pageNeighbors.forEach((ix, k) => { nbRank[ix] = k })
    buildPage(n); setCrumb()
    U().setMode('trans'); sim.transDir = 1; sim.playing = true; sim.P = fromPage ? 0.5 : 0
    setTabsOn(); setHash(id)
  }
  function navigate(id: string): void {
    const n = byId[id]; if (!n) return
    if (id === 'substack') { window.open(n.url, '_blank'); return }
    const isArea = (PARENTS.has(n.region) && id === n.region) || id === ENTRY_ID
    if (isArea) { if (U().mode !== 'field') returnField(); setFieldFocus(id); return }
    openPage(id, U().mode === 'page')
  }
  function returnField(): void {
    const s = U()
    if (s.mode === 'field') return
    // 전이가 끝나는 프레임에서 uiStore.returnField() 가 mode='field'/activeId=null 을 내린다.
    s.setMode('trans'); sim.transDir = -1; sim.playing = true
    setHash(s.galNode || s.fieldSel || ENTRY_ID)
  }
  function returnHome(): void {
    setHoverId(null); hideTip()
    if (U().mode !== 'field') {
      // 원본은 여기서 goHome()을 즉시 불렀지만 uiStore.goHome()은 activeId 까지 지운다.
      // 지우면 되돌아가는 애니메이션(버블/줌아웃)이 사라지므로 전이 완료 시점으로 미룬다.
      U().setMode('trans'); sim.transDir = -1; sim.playing = true; pendingHome = true
    } else goHome()
  }
  on(gid('back'), 'click', returnHome)

  // ── 원본 이미지 모달 ─────────────────────────────────────────────────
  // 노드 페이지의 이미지는 16:10 으로 잘라 놓은 것이라 원본에서 빠진 부분이
  // 있다. 눌러서 잘리지 않은 원본을 보게 한다.
  function openLightbox(src: string, alt: string): void {
    const im = gid('lbimg') as HTMLImageElement
    im.src = src
    im.alt = alt
    gid('lbscroll').scrollTop = 0
    gid('lightbox').removeAttribute('hidden')
  }
  function closeLightbox(): void {
    const lb = gid('lightbox')
    if (lb.hasAttribute('hidden')) return
    lb.setAttribute('hidden', '')
    // 큰 이미지를 물고 있지 않도록 비운다
    ;(gid('lbimg') as HTMLImageElement).removeAttribute('src')
  }
  on(gid('lbclose'), 'click', closeLightbox)
  on(gid('lightbox'), 'click', function (ev: MouseEvent) {
    // 이미지 자체가 아니라 배경을 눌렀을 때만 닫는다
    const t = ev.target as HTMLElement
    if (t.id === 'lightbox' || t.id === 'lbscroll') closeLightbox()
  })
  on(document, 'keydown', function (ev: KeyboardEvent) {
    if (ev.key === 'Escape') closeLightbox()
  })
  // 워드마크는 장식이다. 진입 노드는 페이지를 열지 않고 갤러리로 간다 —
  // 지도의 중심을 누르면 지도로 돌아가는 것이 맞고, 프로필은 갤러리가 보여준다.
  // ── 갤러리 · 중간 상태(미리보기) ──
  function galCard(m: ENode): string {
    const isA = AREAS.has(m.id)
    if (isA) {
      return `<div class="gcard gcardA" data-go="${m.id}" style="--cc:${COLOR[m.region]};--ag:${areaGrad(m.region)}" title="${esc(m.name)}">
   <span class="gdot"></span>
   <div class="gcc"><span class="gcn">${esc(m.name)}</span><span class="gcs">${PAGE_TEXT.areaWord} · ${esc(RLAB[m.region])}</span></div>
   <span class="gco">→</span></div>`
    }
    return `<div class="gcard" data-go="${m.id}" style="--cc:${COLOR[m.region]};--ag:${areaGrad(m.region)}" title="${esc(m.name)}">
   <span class="gdot"></span>
   <div class="gth">${cardMedia(m.id)}</div>
   <div class="gcc"><span class="gcn">${esc(m.name)}</span><span class="gcs">${esc(m.sum || m.kicker || '')}</span></div>
   <span class="gco">→</span></div>`
  }
  function cardClick(id: string): void {
    const n = byId[id]; if (!n) return
    if (id === 'substack') { window.open(n.url, '_blank'); return }
    const isArea = PARENTS.has(n.region) && id === n.region
    if (isArea || id === ENTRY_ID) setFieldFocus(id); else openPage(id)
  }
  // 모든 비-entry 리전이 자기 자신을 area 노드로 갖는다 (data/regions.ts 의 AREAS).
  const REG2AREA: Record<string, string> = Object.fromEntries([...AREAS].map((r) => [r, r]))
  function areaGrad(r: Region): string {
    const g = AGRAD[r] ?? AGRAD.entry
    return 'linear-gradient(118deg,' + g[0] + ' 0%,' + g[1] + ' 100%)'
  }
  function siteTreeHTML(): string {
    return '<nav class="sitetree">' + TREECOLS.map(function (col) {
      const reg = col[0], slug = col[1]
      const ids = false
        ? []
        : (childrenIdx[idIndex[reg]] || []).map(function (ix) { return N[ix].id })
      const links = ids.map(function (id, i, a) {
        const mani = (MANIFESTO_ID !== null && id === MANIFESTO_ID)
        return '<a data-go="' + id + '"' + (mani ? ' class="st-mani"' : '') + '><span class="br">'
          + (i === a.length - 1 ? '└─' : '├─') + '</span> ' + (mani ? 'π ' : '') + esc(byId[id].name) + '</a>'
      }).join('')
      return '<div class="stc" style="--cc:' + COLOR[reg] + '"><div class="stc-h"><i></i>~/' + slug + '</div>' + links + '</div>'
    }).join('') + '</nav>'
  }
  function imgSrc(id: string): string { return '/assets/' + id + ((THEMED[id] && U().theme === 'light') ? '-light' : '') + '.jpg' }
  function cardImgSrc(id: string): string { return CARD_IMG[id] ? '/assets/' + CARD_IMG[id] + '.jpg' : imgSrc(id) }
  function imgStrip(n: ENode): string {
    const cnt = MULTI[n.id]
    if (!cnt) return ''
    let s = ''
    for (let i = 2; i <= cnt; i++) {
      s += '<div class="it" onclick="stripView(this,\'' + n.id + '\',' + i + ')"><img src="/assets/'
        + n.id + '-' + i + '.jpg" alt="" loading="lazy" onerror="this.parentNode.remove()"></div>'
    }
    return s ? '<div class="imgstrip">' + s + '</div>' : ''
  }
  function stripView(el: Element, nid: string, i: number): void { galPos = i - 1; galShow(byId[nid]) }
  function relatedNodes(n: ENode): ENode[] {
    const pa = REG2AREA[n.region]
    if (pa && pa !== n.id) {
      return (childrenIdx[idIndex[pa]] || []).map((ix) => N[ix]).filter((m) => m.id !== n.id)
    }
    let items = [...adj[idIndex[n.id]]].map((ix) => N[ix])
    if (AREAS.has(n.id)) items = items.filter((m) => !AREAS.has(m.id))
    return items.sort((a, b) => (AREAS.has(a.id) ? 1 : 0) - (AREAS.has(b.id) ? 1 : 0))
  }
  function renderGallery(): void {
    const s = U()
    const g = gid('gallery')
    if (!s.galMode || !s.galNode) { g.innerHTML = ''; return }
    const n = byId[s.galNode]
    const acc = COLOR[n.region]
    g.style.setProperty('--cc', acc)
    g.style.setProperty('--ag', areaGrad(n.region))
    const heroSrc = '/assets/' + n.id + '.jpg'
    const isNode = (s.galMode === 'node')
    const heroEnter = isNode
      ? (n.url
        ? '<div class="henter">↦ ' + esc(n.urlLabel || PAGE_TEXT.launch) + '</div>'
        : '<div class="henter">' + PAGE_TEXT.enterPage + '</div>')
      : ''
    const hero = `<div class="${isNode ? 'ghero clickable' : 'ghero'}"${isNode ? ' data-enter="' + n.id + '"' : ''}><div class="hph">${PAGE_TEXT.imageLabel} · ${esc(n.cap || PAGE_TEXT.pending)}</div><img src="${heroSrc}" alt="" onerror="this.remove()">${heroEnter}</div>`
    const desc = `<div class="gdesc">${esc(n.body || n.sum || '')}</div>`
    let tag: string, items: ENode[], caplab: string
    if (s.galMode === 'area') {
      if (n.id === ENTRY_ID) {
        items = HOME_ITEMS.map((id) => byId[id]).filter(Boolean)
        tag = UI_TEXT.homeCrumb
        caplab = '5개 영역 · 지도의 중심'
      } else {
        items = (childrenIdx[idIndex[n.id]] || []).map((ix) => N[ix])
        tag = RLAB[n.region] + ' · ' + PAGE_TEXT.areaWord + ' · ' + items.length + PAGE_TEXT.projectsSuffix
        caplab = '이 영역의 작업들'
      }
    } else {
      const pa = REG2AREA[n.region]
      items = relatedNodes(n)
      tag = (AREAS.has(n.id) ? PAGE_TEXT.areaWord : PAGE_TEXT.projectWord) + ' · ' + RLAB[n.region]
      caplab = (pa && pa !== n.id) ? (RLAB[n.region] + '의 다른 작업') : '이어지는 노드'
    }
    const parentArea: string | undefined =
      REG2AREA[n.region]
    const headInner = (isNode && parentArea && parentArea !== n.id)
      ? `<button class="gpill" data-go="${parentArea}">${esc(RLAB[n.region])} ↑</button>`
      : `<span class="gtag">${esc(tag)}</span>`
    const enterCTA = isNode
      ? `<button class="genter" data-enter="${n.id}">${n.url ? esc(n.urlLabel || PAGE_TEXT.launch) : PAGE_TEXT.enterProject}</button>`
      : ''
    g.innerHTML = `<button class="gback" data-back="1">↖ 지도로 돌아가기</button>${MANIFESTO_ENTRY_IDS.indexOf(n.id) >= 0 ? '<button class="gpi" data-origen="1">π · 소개</button>' : ''}
  <div class="ghead"><i style="background:${acc}"></i>${headInner}</div>
  <div class="gname">${esc(n.name)}</div>${hero}${desc}${enterCTA}
  <div class="gcaplab">${caplab}</div>${items.map(galCard).join('')}<div class="treelab2">${PAGE_TEXT.tree}</div>${siteTreeHTML()}`
    ;(g.querySelector('[data-back]') as HTMLElement).onclick = () => goHome()
    g.querySelectorAll('[data-origen]').forEach((el) => { (el as HTMLElement).onclick = openOrigen })
    g.querySelectorAll('[data-go]').forEach((el) => {
      (el as HTMLElement).onclick = () => cardClick((el as HTMLElement).dataset.go as string)
    })
    g.querySelectorAll('[data-enter]').forEach((el) => {
      (el as HTMLElement).onclick = () => openPage((el as HTMLElement).dataset.enter as string)
    })
    g.scrollTop = 0
  }
  on<MouseEvent>(gid('spacer'), 'click', (e) => {
    const s = U()
    if (s.mode !== 'page' && s.mode !== 'trans') return
    const i = (s.mode === 'page') ? pick(e.clientX, e.clientY) : null
    if (i != null) navigate(N[i].id); else returnHome()
  })
  on<PointerEvent>(gid('spacer'), 'pointermove', (e) => {
    if (U().mode !== 'page') return
    const i = pick(e.clientX, e.clientY)
    setHoverId(i != null ? N[i].id : null)
    ;(e.currentTarget as HTMLElement).style.cursor = i != null ? 'pointer' : ''
    if (i != null && N[i].id !== U().activeId) showTip(byId[N[i].id]); else hideTip()
  })
  on(gid('spacer'), 'pointerleave', () => { if (U().mode === 'page') { setHoverId(null); hideTip() } })
  on<MouseEvent>(qs('#spacer .ret'), 'click', (e) => { e.stopPropagation(); returnHome() })
  // ── INTERACCIÓN canvas ──
  function pick(mx: number, my: number): number | null {
    const s = U()
    const ai = s.activeId ? idIndex[s.activeId] : -1
    let best: number | null = null, bd = 1e9
    for (let i = 0; i < N.length; i++) {
      if (s.mode !== 'field' && (sim.AL[i] < 0.06 || i === ai)) continue
      const x = sim.CX[i], y = sim.CY[i]
      const d = (mx - x) ** 2 + (my - y) ** 2
      const rr = ((s.mode === 'field') ? Math.max(sim.R[i], N[i].r * sim.SC) * 1.3 : sim.R[i] * 1.15) ** 2
      if (d < rr && d < bd) { bd = d; best = i }
    }
    return best
  }
  function fieldClick(i: number): void {
    const n = N[i]; const id = n.id
    if (id === 'substack') { window.open(byId[id].url, '_blank'); return }
    const isArea = (PARENTS.has(n.region) && id === n.region) || id === ENTRY_ID
    if (isArea) setFieldFocus(id); else openPage(id)
  }
  on<PointerEvent>(c, 'pointermove', (e) => {
    const s = U()
    if (s.origenOn) {
      c.style.cursor = oWordDrag ? 'grabbing' : (oPickWord(e.clientX, e.clientY) ? 'grab' : 'default')
      return
    }
    if (s.mode !== 'field') { setHoverId(null); return }
    const i = pick(e.clientX, e.clientY)
    const hid = i != null ? N[i].id : null
    setHoverId(hid)
    c.style.cursor = hid ? 'pointer' : 'crosshair'
    if (hid) showTip(byId[hid]); else hideTip()
  })
  on<MouseEvent>(c, 'click', (e) => {
    const s = U()
    if (s.origenOn) return
    if (s.mode !== 'field') return
    if (dragMoved) { dragMoved = false; return }
    const i = pick(e.clientX, e.clientY)
    if (i != null) fieldClick(i); else goHome()
  })
  // ── GESTOS naturales (drag = perspectiva, pinch/rueda = zoom) ──
  const ptrs = new Map<number, { x: number; y: number }>()
  let dragMoved = false
  let lastPan: { x: number; y: number } | null = null
  let pinchD = 0
  const clampZ = (v: number): number => Math.max(0.45, Math.min(3.4, v))
  on<PointerEvent>(c, 'pointerdown', (e) => {
    if (U().origenOn) {
      const w = oPickWord(e.clientX, e.clientY)
      if (w) {
        oWordDrag = w; w.drag = true
        oGrabSX = w._sx - e.clientX; oGrabSY = w._sy - e.clientY
        c.style.cursor = 'grabbing'
        return
      }
    }
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); dragMoved = false
    if (ptrs.size === 1) lastPan = { x: e.clientX, y: e.clientY }
    if (ptrs.size === 2) {
      const p = [...ptrs.values()]
      pinchD = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y)
    }
  })
  on<PointerEvent>(c, 'pointermove', (e) => {
    if (!ptrs.has(e.pointerId)) return
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const s = U()
    if (s.mode !== 'field' && !s.origenOn) return
    if (ptrs.size >= 2) {
      const p = [...ptrs.values()]
      const d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y)
      if (pinchD) sim.userZoom = clampZ(sim.userZoom * (d / pinchD))
      pinchD = d; dragMoved = true; userInteracted = true
      return
    }
    if (ptrs.size === 1 && lastPan) {
      const dx = e.clientX - lastPan.x, dy = e.clientY - lastPan.y
      if (Math.abs(dx) + Math.abs(dy) > 2) { dragMoved = true; userInteracted = true }
      if (s.origenOn) {
        sim.curRot += dx * 0.006
        sim.viewTiltX = Math.max(-0.6, Math.min(0.6, sim.viewTiltX + dy * 0.0016))
      } else {
        sim.viewRot = Math.max(-0.95, Math.min(0.95, sim.viewRot + dx * 0.004))
        sim.viewTiltX = Math.max(-0.8, Math.min(0.8, sim.viewTiltX + dy * 0.0024))
      }
      lastPan = { x: e.clientX, y: e.clientY }
    }
  })
  function endPtr(e: PointerEvent): void {
    ptrs.delete(e.pointerId)
    const left = [...ptrs.values()]
    lastPan = left.length === 1 ? { x: left[0].x, y: left[0].y } : null
    if (ptrs.size < 2) pinchD = 0
  }
  on<PointerEvent>(c, 'pointerup', endPtr)
  on<PointerEvent>(c, 'pointercancel', endPtr)
  on<PointerEvent>(c, 'lostpointercapture', endPtr)
  on<WheelEvent>(c, 'wheel', (e) => {
    const s = U()
    if (s.mode !== 'field' && !s.origenOn) return
    e.preventDefault(); userInteracted = true
    sim.userZoom = clampZ(sim.userZoom * (1 - e.deltaY * 0.0013))
  }, { passive: false })
  function miniNearest(e: { clientX: number; clientY: number }): { best: number; bd: number } {
    const r = mini.getBoundingClientRect()
    const mx = (e.clientX - r.left) / r.width * sim.MW, my = (e.clientY - r.top) / r.height * sim.MH
    let best = -1, bd = 1e9
    for (let i = 0; i < N.length; i++) {
      const [x, y] = minimap.mpos(N[i])
      const d = (mx - x) ** 2 + (my - y) ** 2
      if (d < bd) { bd = d; best = i }
    }
    return { best, bd }
  }
  on<MouseEvent>(mini, 'click', (e) => {
    const { best, bd } = miniNearest(e)
    if (bd < 2600) navigate(N[best].id)
  })
  const mtip = gid('mtip')
  on<PointerEvent>(mini, 'pointermove', (e) => {
    const { best, bd } = miniNearest(e)
    if (best >= 0 && bd < 2600) {
      const n = N[best]; const here = idIndex[n.id] === minimap.rootIdx()
      ;(mtip.querySelector('.nm') as HTMLElement).textContent = (here ? PAGE_TEXT.youAreHere : '') + n.name
      ;(mtip.querySelector('.mr') as HTMLElement).textContent =
        (AREAS.has(n.id) ? PAGE_TEXT.areaWord : PAGE_TEXT.projectWord) + ' · ' + RLAB[n.region]
      mtip.style.left = e.clientX + 'px'; mtip.style.top = e.clientY + 'px'
      mtip.style.opacity = '1'; mini.style.cursor = 'pointer'
    } else { mtip.style.opacity = '0'; mini.style.cursor = 'default' }
  })
  on(mini, 'pointerleave', () => { mtip.style.opacity = '0'; mini.style.cursor = 'default' })
  on<KeyboardEvent>(window, 'keydown', (e) => {
    const s = U()
    if (s.mode === 'cold') { sim.coldP = 1; return }
    if (e.key === 'Escape') { if (s.mode !== 'field') returnField(); else goHome() }
  })
  on(window, 'pointerdown', () => { if (U().mode === 'cold') sim.coldP = 1 }, { capture: true })
  /* ===== MANIFESTO · ORIGEN — render through the main organism engine ===== */
  // oHubs/oWords/oB 상태 + oLayout/drawOrigen 은 Task 8이 engine/renderers/origen.ts로
  // 옮겼다. 진입 줌인(zin, 아래 openOrigen())은 rAF로 loop을 도는 오케스트레이션이라
  // Task 9까지 여기 남는다. origen.ts 상단 주석에 deps/반환값이 브리프를 넘어 확장된
  // 이유(clusters/bubble/links/minimap/glass/mouseLive 주입, words()/hubs()/getB()/
  // setB() 접근자)를 자세히 남겼다.
  let oWordDrag: OWord | null = null
  let oGrabSX = 0, oGrabSY = 0
  /** origen.layout() 이 이미 한 번 돌았는지. 엔진 밖에서 origenOn 이 켜졌을 때만 준비를
   *  대신한다. origen.layout() 자신은 더 이상 이 플래그를 세우지 않는다(예전 oLayout()의
   *  마지막 줄이었다) — 아래 네 호출부 전부가 호출 직후 이 줄을 대신 실행해, 호출
   *  횟수·순서·그 안에서 소비하는 rng() 시퀀스 위치가 이관 전과 완전히 같다
   *  (origen.ts 상단 주석 참고 — 7-origen-cloud 골든이 이 정확한 횟수에 의존한다). */
  let origenLaidOut = false
  // origenEntering — 줌인 440ms 구간(=body.origen 은 붙었지만 origenOn 은 아직 false)의
  // 재진입 가드. 원본은 body 클래스 존재 여부로 이를 대신했지만, 이제 그 클래스는
  // BodyClassSync 도 쓰고 dispose 를 넘어 살아남는다 — StrictMode 이중 마운트에서
  // #/manifesto 로 직접 들어오면 두 번째 엔진이 클래스만 보고 진입을 포기해 origen 이
  // 켜지지 않았다. 선언은 생성 초반(리뷰 Fix 5, dispose() 가 TDZ 없이 항상 완주하도록)
  // 으로 옮겼다.
  const origen = createOrigen({
    sim, projection, rng, gauss, ctx,
    stars, haze, clusters, bubble, links, minimap, glass,
    mouseLive: () => ({ x: mouseX, y: mouseY }),
  })
  function oPickWord(cx: number, cy: number): OWord | null {
    const oWords = origen.words()
    let best: OWord | null = null, bd = 1e9
    for (let i = 0; i < oWords.length; i++) {
      const w = oWords[i]
      if (!w.placed) continue
      const d = Math.hypot(cx - w._sx, cy - w._sy)
      const rad = Math.max(24, (w.fpx * 0.7 + w.w * 0.5) * sim.userZoom)
      if (d < rad && d < bd) { bd = d; best = w }
    }
    return best
  }
  function oWordMove(e: PointerEvent): void {
    if (!oWordDrag || !U().origenOn) return
    const w = oWordDrag, h = origen.hubs()[w.hub], k = sim.userZoom * origen.getB() || 1
    w.clx = (e.clientX + oGrabSX - h._x) / k
    w.cly = (e.clientY + oGrabSY - h._y) / k
    w.vx = 0; w.vy = 0
  }
  on<PointerEvent>(window, 'pointermove', oWordMove)
  on(window, 'pointerup', () => {
    if (oWordDrag) { oWordDrag.drag = false; oWordDrag = null; c.style.cursor = '' }
  })
  function openOrigen(): void {
    if (U().origenOn || origenEntering) return
    origenEntering = true
    // 원본: mode='field';P=0;playing=false;activeId=null;galMode=null;galNode=null
    // returnField() 가 mode='field' + activeId=null 을 담당한다. galMode/galNode 는
    // origen 중에 읽히지 않고 종료 시 setFieldFocus(ENTRY_ID) 가 덮어쓴다.
    U().returnField()
    sim.P = 0; sim.playing = false
    const _d = document.getElementById('doc'); if (_d) _d.innerHTML = ''
    sim.viewRot = 0; sim.viewTiltX = 0; userInteracted = true; origen.layout(); origenLaidOut = true
    origen.setB(0.05)
    // origen 클래스는 즉시 필요하다 (줌인 440ms 동안 UI 를 숨긴다). origenOn 플래그는
    // 원본과 동일하게 줌인이 끝나는 순간에 올린다 — 그 사이에는 필드를 계속 그린다.
    document.body.classList.add('origen')
    if (location.hash !== '#/manifesto') { _routing = true; location.hash = '#/manifesto' }
    const z0 = sim.userZoom, zT = Math.max(1.7, sim.userZoom * 1.7), t0 = performance.now()
    const zin = (): void => {
      if (disposed || U().origenOn) return
      const k = Math.min(1, (performance.now() - t0) / 440)
      sim.userZoom = z0 + (zT - z0) * ease(k)
      if (k < 1) { zinRaf = requestAnimationFrame(zin) } else { zinRaf = 0; origenEntering = false; U().openOrigen() }
    }
    zin()
  }
  function closeOrigen(): void {
    U().closeOrigen()
    leaveOrigenClasses()
    sim.viewRot = 0; sim.viewTiltX = 0; sim.userZoom = 1; userInteracted = false
    setFieldFocus(ENTRY_ID)
  }
  on(window, 'resize', () => { if (U().origenOn) { origen.layout(); origenLaidOut = true } })
  on(gid('origenback'), 'click', closeOrigen)
  /* ── routing: cada nodo su propia URL (#/id) ── */
  function curHash(): string { return decodeURIComponent((location.hash || '').replace(/^#\/?/, '')) }
  let _routing = false
  function setHash(id: string): void {
    const h = '#/' + id
    if (location.hash !== h) { _routing = true; location.hash = h }
  }
  function applyHash(): void {
    const id = curHash()
    if (!id || !byId[id]) { returnHome(); return }
    const n = byId[id]
    const isArea = (PARENTS.has(n.region) && id === n.region) || id === ENTRY_ID
    if (isArea) { if (U().mode !== 'field') returnField(); setFieldFocus(id) } else { openPage(id) }
  }
  on(window, 'hashchange', () => {
    if (_routing) { _routing = false; return }
    applyHash()
  })
  if (curHash()) applyHash()

  // ── 생성된 마크업의 인라인 핸들러가 요구하는 전역 (원본에서는 스크립트 스코프가
  //    곧 전역이었다). dispose 에서 되돌린다. `win` 선언은 생성 초반으로 옮겼다
  //    (리뷰 Fix 5) — 아래는 그 참조에 값을 채우기만 한다. ──
  win.galGo = galGo
  win.stripView = stripView
  if (process.env.NODE_ENV !== 'production') {
    // 원본 L738 의 window.__open / __focus. Task 7 의 4-trans·5-page 는 openPage 경로를
    // 타야 pageNeighbors/nbRank 가 채워지고 이웃 노드의 AL 값이 골든과 맞는다.
    // uiStore.openNode() 만으로는 그 두 테이블이 비어 있어 AL 이 달라진다.
    win.__open = openPage
    win.__focus = (id: string) => setFieldFocus(id)
  }

  // ── 생명주기 (unsubscribeUI 선언도 생성 초반으로 옮겼다 — 리뷰 Fix 5) ──
  unsubscribeUI = uiStore.subscribe((s, prev) => {
    // 엔진 밖(React 컴포넌트/테스트)에서 origen 을 켠 경우에만 셋업을 대신한다.
    // 엔진의 openOrigen 은 이미 origen.layout() 을 돌렸으므로 여기서 중복 실행되지 않는다.
    if (s.origenOn && !prev.origenOn && !origenLaidOut) { origen.layout(); origenLaidOut = true }
  })

  function loop(ts: number): void {
    if (disposed) return
    stepFrame(ts)
    rafId = requestAnimationFrame(loop)
  }

  return {
    start() { if (!disposed && !rafId) rafId = requestAnimationFrame(loop) },
    stop() { if (rafId) { cancelAnimationFrame(rafId); rafId = 0 } },
    step(ts: number) { stepFrame(ts) },
    resetTime() { sim.lastTs = 0 },
    setTransition(p: number, dir: 1 | -1) { sim.P = p; sim.transDir = dir; sim.playing = false },
    setColdProgress(v: number) { sim.coldP = v },
    // 골든 추출기 run() 의 리셋 집합과 동일하다. sim.fieldCX 와 sim.CX/sim.CY/sim.R/sim.AL 은
    // 의도적으로 남긴다.
    resetView() {
      sim.curRot = 0; sim.viewRot = 0; sim.viewTiltX = 0; sim.userZoom = 1; userInteracted = false
      origen.reset(); mouseX = -999; mouseY = -999
    },
    layoutOrigen() { origen.layout(); origenLaidOut = true },
    setQuality(v: number) { sim.PQ = v; qualityPinned = true },
    dispose,
  }
  } catch (err) {
    // 리뷰 Fix 5: 위 try 어디서 던져도 dispose() 로 등록된 걸 전부 되돌린 뒤 원래 에러를
    // 그대로 다시 던진다 (핸들을 못 받은 호출자가 원인을 알 수 있도록).
    dispose()
    throw err
  }
}
