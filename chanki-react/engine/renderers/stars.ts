// createStars — frame() 안의 인라인 별 루프(원본 index.html L634 부근)를 그대로 옮긴 것.
// stars 배열은 engine/particles.ts 가 만든다(rng 시드 기반, 생성 순서 고정 — Task 6).
//
// stars/haze 둘 다 자기 데이터(stars[])를 스스로 순회하는 완결된 루프라 FieldRenderer
// 모양(rc 하나만 받아 프레임당 1회 호출)에 그대로 들어맞는다 — links/rings/bubble/clusters
// 와 달리 별도 취급이 필요 없었다 (engine/renderers/types.ts 상단 메모 참고).
//
// ctx 상태 주의(Fact #2): 이 렌더러는 ctx.globalCompositeOperation 을 스스로 설정하지
// 않는다. 원본에서 이 값(`LITE ? 'source-over' : 'lighter'`)은 별 루프 *앞*에서 한 번
// 설정되고 haze 루프까지 그대로 이어진다 — 호출자(engine/legacy.ts 의 frame())가 두 렌더러를
// 부르기 직전에 여전히 그 한 줄을 설정한다. haze.ts 도 동일하게 이 설정을 물려받는다.
import type { Star } from '../particles'
import type { Sim } from '../sim'
import type { FieldRenderer } from './types'

export function createStars(deps: { sim: Sim; stars: Star[] }): FieldRenderer {
  const { sim, stars } = deps
  return (rc) => {
    const { ctx, t, ui, eViz } = rc
    const LITE = (ui.theme === 'light')
    const bgA = sim.curRot * 0.0105, cb = Math.cos(bgA), sb = Math.sin(bgA)
    for (const s of stars) {
      const a = (0.16 + s.b * 0.74) * (0.55 + 0.45 * Math.sin(t * 0.6 + s.tw)) * (1 - eViz * 0.4)
      let sz = s.b > 0.55 ? 2.3 : (s.b > 0.25 ? 1.6 : 1)
      if (s.b > 0.5) { const sc = ((t * 10) + s.tw) % 1; if (sc < 0.2) sz *= 1 + 0.25 * Math.sin(sc / 0.2 * Math.PI) }
      const dx = s.x - 0.5, dy = s.y - 0.5
      const rx = (dx * cb - dy * sb) + 0.5, ry = (dx * sb + dy * cb) + 0.5
      ctx.fillStyle = LITE ? `rgba(58,64,84,${a})` : `rgba(216,224,244,${Math.min(1, a * 1.15)})`
      ctx.fillRect(rx * rc.W, ry * rc.H, sz, sz)
    }
  }
}
