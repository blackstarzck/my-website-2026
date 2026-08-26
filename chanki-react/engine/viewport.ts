// resize()/miniResize() — 원본(index.html) 의 캔버스 크기 계산을 그대로 옮긴 것.
// canvases 는 인자로 주입받는다: 팩토리이지 클래스도 싱글턴도 아니어서, 엔진 인스턴스마다
// (React StrictMode 이중 마운트 포함) 각자 자기 canvases 로 새로 만든다.
import type { EngineCanvases } from './types'
import type { Sim } from './sim'

export function createViewport(
  sim: Sim,
  canvases: EngineCanvases,
): { resize(): void; miniResize(): void } {
  const c = canvases.field
  function resize(): void {
    sim.W = c.width = innerWidth; sim.H = c.height = innerHeight
    const span = (sim.W <= 760) ? 1.6 : 2.35
    sim.SC = Math.min(sim.W, sim.H) / (sim.orgR * span)
    sim.LBL = (sim.W <= 760) ? 1.5 : 1
  }

  const mini = canvases.mini
  function miniResize(): void {
    sim.MW = mini.width = mini.clientWidth * 2
    sim.MH = mini.height = mini.clientHeight * 2
  }

  return { resize, miniResize }
}
