// createOrigen — oLayout/drawOrigen(원본 index.html "MANIFESTO · ORIGEN" 절)와 그 상태
// (oHubs/oWords/oB)를 그대로 옮긴 것. 진입 줌인 애니메이션(zin)은 rAF로 loop을 도는
// 오케스트레이션이라 legacy.ts에 남는다(Task 9 소관 — 태스크 지시 Ambiguity #4).
//
// ── Fact #1: drawOrigen()은 계산과 그리기가 뒤섞여 있다 ──
// Task 6이 이미 보고했고(task-6-report.md §5) 이 태스크에서도 그대로 확인했다: oHubs/
// oWords의 화면좌표 유도(순수 계산 — `h._x = pp[0]`, `w._sx = h._x + w.clx*...` 등)가
// 실제 드로잉 호출(`ctx.fillRect`/`clusters.drawCluster`/`links.curveDots`/`ctx.fillText`)과
// 한 줄 간격으로 섞여 있어 깔끔한 계산/그리기 경계가 없다. 풀어내려 하지 않고 함수
// 전체를 한 덩어리로 옮겼다 — 브리프도, Task 6의 사전 보고도 이를 예견하고 있었다.
//
// ── 브리프를 벗어난 deps 확장 (Ambiguity #2) ──
// 브리프의 deps는 { sim, projection, rng, gauss, ctx } 다섯뿐이지만, drawOrigen()의 실제
// 본문은 이보다 훨씬 많이 참조한다 — 옮기며 실측한 목록:
//  - stars/haze: drawOrigen 자신의 별/haze 배경 루프(frame()의 것과는 다른, eViz 감쇠가
//    없는 별도 코드 — Task 7 보고서 §6이 이미 확인함)가 이 두 배열을 직접 순회한다.
//  - clusters/bubble/links: 허브 클라우드(drawCluster)·코어 버블(drawBubble)·코어→허브/
//    허브→단어 선(curveDots)을 부른다 — legacy.ts가 이미 갖고 있던 그 인스턴스를 그대로
//    주입받는다(Task 7이 drawOrigen 호출부를 이 모듈들로 이미 rewiring해뒀다 —
//    clusters.ts/bubble.ts/links.ts 상단 주석 참고).
//  - minimap: drawOrigen()은 자기 본문 맨 앞에서 drawMini()를 부른다(origen 모드에서도
//    미니맵을 계속 갱신하기 위해서다). Task 8 Step 1이 만든 minimap 인스턴스의 draw()만
//    받는다.
//  - glass: drawOrigen()은 맨 끝에서 renderGlass([코어 도형])를 부른다. Task 8 Step 2가
//    만든 glass 인스턴스의 render()만 받는다.
//  - mouseLive: 코어 색이 가장 가까운 허브 색으로 물드는 계산이 읽는 mouseX/mouseY는
//    legacy.ts의 전역 pointermove 리스너가 매 이벤트마다 갱신하는 모듈 지역 변수다
//    (프레임 스냅샷이 아니다) — minimap의 rootIdx()/uiLive()와 같은 이유로 라이브
//    콜백을 주입받는다(의미를 바꾸지 않는다).
//
// ── 브리프를 벗어난 반환 타입 확장 (Ambiguity #2) ──
// 브리프의 반환 타입은 { layout, draw, reset } 셋뿐이지만, legacy.ts에는 이 태스크의
// 이동 대상이 아닌 포인터 드래그 상호작용 코드(oPickWord/oWordMove와 그 호출부인
// pointerdown/pointermove 핸들러, openOrigen()의 진입 시퀀스)가 남아있고, 이들이
// oWords/oHubs/oB를 직접 읽거나(oPickWord/oWordMove) 쓴다(openOrigen()의 `oB = 0.05`).
// 그 상호작용 함수들 자체를 이 태스크 범위(oHubs/oWords 상태 + oLayout/drawOrigen)
// 밖으로 끌어들여 재작성하는 대신, 이미 갖고 있던 바로 그 배열/스칼라에 대한 최소
// 접근자만 추가로 노출했다 — legacy.ts 쪽은 `oWords`→`origen.words()`,
// `oHubs`→`origen.hubs()`, `oB`(읽기)→`origen.getB()`, `oB = v`(쓰기)→`origen.setB(v)`로
// 식별자만 바뀐다(로직은 한 글자도 안 바뀐다).
//
// origenLaidOut(oLayout이 이미 한 번 돌았는지)도 브리프 범위 밖이라 legacy.ts에
// 남는다 — layout()은 더 이상 그 플래그를 스스로 세우지 않는다(원본 oLayout()의 마지막
// 줄이었다). legacy.ts가 origen.layout()을 부르는 4곳(uiStore.subscribe 콜백/resize
// 핸들러/openOrigen()/layoutOrigen() 테스트 핸들) 전부에서 호출 직후 origenLaidOut = true
// 를 대신 세운다 — 호출 횟수·순서·rng 소비 시점은 원본과 완전히 동일하다(7-origen-cloud
// 골든이 이 정확한 횟수에 의존한다: oLayout은 6-origen에서 구독 반응으로 1회,
// 7-origen-cloud에서는 origenLaidOut이 이미 true라 구독은 스킵되고 명시적
// layoutOrigen() 호출로만 1회 — 이 순서가 바뀌면 hub 파티클 cl[]의 rng 시퀀스 위치가
// 바뀌어 픽셀이 달라진다).
import { COLOR } from '@/data/regions'
import type { Region } from '@/data/types'
import type { UISnapshot } from '@/stores/uiStore'
import type { CloudPt, HazePt, Star } from '../particles'
import type { Projection } from '../projection'
import type { Rng } from '../random'
import type { Sim } from '../sim'
import type { GlassShape } from './glass'
import { MANIFESTO_LAYOUT } from '@/data/site'

export type OHub = {
  region: Region; col: string; hx: number; hy: number; z: number
  R: number; fpx: number; cl: CloudPt[]
  _x: number; _y: number; _sc: number
}
export type OWord = {
  t: string; lx: number; ly: number; clx: number; cly: number
  vx: number; vy: number; col: string; fpx: number; wt: string
  sub: boolean; white: boolean; w: number; hub: number
  drag: boolean; placed: boolean; _sx: number; _sy: number
}

/** '#RRGGBB' → [r,g,b]. engine/legacy.ts의 rgb()와 같은 정의 — 렌더러 간 중복은
 *  의도적이다(태스크 지시: 색상 계산 스니펫은 합치지 않는다). */
const rgb = (hex: string): number[] => (hex.match(/\w\w/g) ?? []).map((h) => parseInt(h, 16))

const OSTZ = MANIFESTO_LAYOUT

export function createOrigen(deps: {
  sim: Sim; projection: Projection; rng: Rng; gauss: () => number
  ctx: CanvasRenderingContext2D
  stars: Star[]; haze: HazePt[]
  clusters: {
    drawCluster(
      ui: UISnapshot, region: Region, cl: CloudPt[], cx: number, cy: number,
      R: number, alpha: number, dof: number, t: number,
    ): void
  }
  bubble: { drawBubble(ui: UISnapshot, cx: number, cy: number, R: number, alpha: number): void }
  links: {
    curveDots(
      ui: UISnapshot, x1: number, y1: number, x2: number, y2: number, al: number,
      nd: number, sz: number, t: number, spd: number, col?: string | null,
    ): void
  }
  minimap: { draw(ui: UISnapshot, t: number): void }
  glass: { render(shapes: GlassShape[], dark: number): void }
  mouseLive: () => { x: number; y: number }
}): {
  layout(): void
  draw(ui: UISnapshot, t: number, dt: number): void
  reset(): void
  words(): OWord[]
  hubs(): OHub[]
  getB(): number
  setB(v: number): void
} {
  const {
    sim, projection, rng, gauss, ctx, stars, haze, clusters, bubble, links, minimap, glass, mouseLive,
  } = deps
  const { proj, cx0, cy0, orgR } = projection

  let oB = 1
  const oCoreCol = [207, 255, 4]
  let oHubs: OHub[] = []
  let oWords: OWord[] = []

  function layout(): void {
    oHubs = []; oWords = []
    const Rw = orgR * 0.66, nS = OSTZ.length, S = Math.min(sim.W, sim.H)
    const meas = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D
    OSTZ.forEach(function (st, si) {
      const col = COLOR[st.c]
      const big = (si === 0)
      const fpx = S * 0.029 * st.w * (big ? 2 : 1)
      const hx = cx0 + st.o[0] * Rw, hy = cy0 - st.o[1] * Rw
      const z = (si - (nS - 1) / 2) / nS * 1.05 + 0.4
      const hub: OHub = {
        region: st.c, col, hx, hy, z, R: 0, fpx, _x: 0, _y: 0, _sc: 1,
        cl: Array.from({ length: 64 }, function () {
          return {
            a: rng() * 6.283, rr: Math.pow(rng(), 0.5), b: Math.pow(rng(), 1.7),
            ph: rng() * 6.283, sp: 0.2 + rng() * 0.6, jz: gauss() * 0.22,
            sz: 0.5 + Math.pow(rng(), 2) * 1.4,
          }
        }),
      }
      oHubs.push(hub)
      const hi = oHubs.length - 1
      let maxr = 0
      const sizes = st.lines.map(function (l, li) { return li === 0 ? fpx : fpx * 0.68 })
      const ys: number[] = []
      let yc = 0
      st.lines.forEach(function (l, li) {
        if (li > 0) yc += (li === 1 ? fpx * 0.78 : sizes[li] * 0.55)
        ys.push(yc); yc += sizes[li] * 1.28
      })
      const mid = yc / 2
      st.lines.forEach(function (line, li) {
        const fl = sizes[li], wt = (li === 0 ? '700' : '400'), spaceW = fl * 0.5
        meas.font = wt + ' ' + fl + 'px "JetBrains Mono",monospace'
        const ws = line.map(function (wd) { return meas.measureText(wd).width })
        const lw = ws.reduce(function (a, b) { return a + b }, 0) + spaceW * (line.length - 1)
        let x = -lw / 2
        const ly = ys[li] - mid + fl / 2
        line.forEach(function (wd, i) {
          const lx = x + ws[i] / 2
          oWords.push({
            t: wd, lx, ly, clx: lx, cly: ly, vx: 0, vy: 0, col, fpx: fl, wt,
            sub: li > 0, white: big, w: ws[i], hub: hi, drag: false, placed: false, _sx: 0, _sy: 0,
          })
          const dr = Math.hypot(lx, ly) + ws[i] * 0.5
          if (dr > maxr) maxr = dr
          x += ws[i] + spaceW
        })
      })
      hub.R = maxr
    })
  }

  function draw(ui: UISnapshot, t: number, dt: number): void {
    const LITE = (ui.theme === 'light')
    sim.curRot += dt * 0.02; sim.curBr = 1 + Math.sin(t * 0.5) * 0.02; sim.camZoom = 1
    sim.fieldCX += (0.5 - sim.fieldCX) * 0.1; oB += (1 - oB) * 0.045; sim.userZoom += (1 - sim.userZoom) * 0.05
    minimap.draw(ui, t)
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = LITE ? '#EFE7D4' : '#100E1A'
    ctx.fillRect(0, 0, sim.W, sim.H)
    ctx.globalCompositeOperation = LITE ? 'source-over' : 'lighter'
    {
      const bgA = sim.curRot * 0.0105, cb = Math.cos(bgA), sb = Math.sin(bgA)
      for (let si = 0; si < stars.length; si++) {
        const s = stars[si]
        const a = (0.16 + s.b * 0.74) * (0.55 + 0.45 * Math.sin(t * 0.6 + s.tw))
        let sz = s.b > 0.55 ? 2.3 : (s.b > 0.25 ? 1.6 : 1)
        if (s.b > 0.5) {
          const scp = ((t * 10) + s.tw) % 1
          if (scp < 0.2) sz *= 1 + 0.25 * Math.sin(scp / 0.2 * Math.PI)
        }
        const dx = s.x - 0.5, dy = s.y - 0.5
        const rx = (dx * cb - dy * sb) + 0.5, ry = (dx * sb + dy * cb) + 0.5
        ctx.fillStyle = LITE ? 'rgba(58,64,84,' + a + ')' : 'rgba(216,224,244,' + Math.min(1, a * 1.15) + ')'
        ctx.fillRect(rx * sim.W, ry * sim.H, sz, sz)
      }
    }
    for (let hz = 0; hz < haze.length; hz++) {
      const p = haze[hz]
      const pr = proj(p.x, p.y, p.z)
      const tw = 0.6 + 0.4 * Math.sin(t * p.sp + p.ph)
      const ha = (0.04 + p.b * 0.4) * tw * 0.7
      if (ha > 0.004) {
        ctx.fillStyle = LITE ? 'rgba(88,94,118,' + (ha * 1.2) + ')' : 'rgba(150,160,185,' + ha + ')'
        ctx.beginPath(); ctx.arc(pr[0], pr[1], p.sz, 0, 6.283); ctx.fill()
      }
    }
    const cp = proj(cx0, cy0, -0.5), coreX = cp[0], coreY = cp[1], Zc = sim.camZoom * sim.userZoom * cp[2]
    oHubs.forEach(function (h) {
      const hwx = cx0 + (h.hx - cx0) * oB, hwy = cy0 + (h.hy - cy0) * oB
      const pp = proj(hwx, hwy, h.z * oB)
      h._x = pp[0]; h._y = pp[1]; h._sc = sim.camZoom * sim.userZoom * pp[2]
    })
    oWords.forEach(function (w) {
      const h = oHubs[w.hub]
      if (!w.drag) {
        w.vx += (w.lx - w.clx) * 0.012; w.vy += (w.ly - w.cly) * 0.012
        w.vx *= 0.86; w.vy *= 0.86; w.clx += w.vx; w.cly += w.vy
      }
      w._sx = h._x + w.clx * sim.userZoom * oB; w._sy = h._y + w.cly * sim.userZoom * oB; w.placed = true
    })
    oHubs.forEach(function (h) {
      clusters.drawCluster(ui, h.region, h.cl, h._x, h._y, Math.max(h.R * sim.userZoom * oB, h.fpx * 2), 0.5 * oB, 0.22, t)
    })
    let tcol = [207, 255, 4]
    if (oHubs.length) {
      const m = mouseLive()
      let bd = 1e9
      for (let qi = 0; qi < oHubs.length; qi++) {
        const hh = oHubs[qi]
        const dd = Math.hypot((m.x < 0 ? sim.W / 2 : m.x) - hh._x, (m.y < 0 ? sim.H / 2 : m.y) - hh._y)
        if (dd < bd) { bd = dd; tcol = rgb(hh.col) }
      }
    }
    oCoreCol[0] += (tcol[0] - oCoreCol[0]) * 0.08
    oCoreCol[1] += (tcol[1] - oCoreCol[1]) * 0.08
    oCoreCol[2] += (tcol[2] - oCoreCol[2]) * 0.08
    const cR = orgR * 0.225 * Zc * sim.SC
    const ccr = Math.round(oCoreCol[0]) + ',' + Math.round(oCoreCol[1]) + ',' + Math.round(oCoreCol[2])
    const cg = ctx.createRadialGradient(coreX, coreY, 0, coreX, coreY, cR)
    cg.addColorStop(0, 'rgba(' + ccr + ',' + (0.2 * oB) + ')')
    cg.addColorStop(0.55, 'rgba(' + ccr + ',' + (0.07 * oB) + ')')
    cg.addColorStop(1, 'rgba(' + ccr + ',0)')
    ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(coreX, coreY, cR, 0, 6.283); ctx.fill()
    ctx.fillStyle = 'rgba(' + ccr + ',' + (0.3 * oB) + ')'
    ctx.beginPath(); ctx.arc(coreX, coreY, cR * 0.16, 0, 6.283); ctx.fill()
    bubble.drawBubble(ui, coreX, coreY, cR, 0.92 * oB)
    oHubs.forEach(function (h) { links.curveDots(ui, coreX, coreY, h._x, h._y, 0.5 * oB, 2, 1.6, t, 0.24, h.col) })
    oWords.forEach(function (w) {
      const h = oHubs[w.hub]
      links.curveDots(ui, h._x, h._y, w._sx, w._sy, (w.drag ? 0.55 : 0.36) * oB, 1, 1.2, t, 0.3, w.col)
    })
    ctx.globalCompositeOperation = LITE ? 'source-over' : 'lighter'
    oHubs.forEach(function (h) {
      const A = rgb(h.col)
      ctx.fillStyle = 'rgba(' + A[0] + ',' + A[1] + ',' + A[2] + ',' + (0.7 * oB) + ')'
      ctx.beginPath(); ctx.arc(h._x, h._y, 2.4, 0, 6.283); ctx.fill()
    })
    ctx.globalCompositeOperation = 'source-over'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    oWords.forEach(function (w) {
      const fs = Math.max(8, w.fpx * sim.userZoom)
      ctx.font = w.wt + ' ' + fs + 'px "JetBrains Mono",monospace'
      const A = rgb(w.col)
      const lime = (w.col === '#CFFF04'), al = (w.sub ? 0.78 : 0.97) * oB
      ctx.fillStyle = w.white
        ? (LITE ? '#0A0A0A' : 'rgba(245,245,242,' + al + ')')
        : (LITE ? (lime ? '#003A3A' : 'rgba(' + A[0] + ',' + A[1] + ',' + A[2] + ',' + al + ')')
          : 'rgba(' + A[0] + ',' + A[1] + ',' + A[2] + ',' + al + ')')
      ctx.fillText(w.t, w._sx, w._sy)
    })
    glass.render([{ x: coreX - cR, y: coreY - cR, w: cR * 2, h: cR * 2, rad: cR, amt: 0.55 }], LITE ? 1.0 : 0.0)
  }

  function reset(): void { oB = 1 }
  function words(): OWord[] { return oWords }
  function hubs(): OHub[] { return oHubs }
  function getB(): number { return oB }
  function setB(v: number): void { oB = v }

  return { layout, draw, reset, words, hubs, getB, setB }
}
