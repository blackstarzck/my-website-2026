// createHaze — frame() 안의 인라인 haze 루프(원본 index.html L636 부근)를 그대로 옮긴 것.
// haze 배열은 engine/particles.ts 가 만든다(rng 시드 기반, 생성 순서 고정 — Task 6).
//
// 원본은 `if (lf.eViz < 0.98) { for (const p of haze) {...} }` 로 프레임당 조건부 실행이었다.
// FieldRenderer 가 이미 rc.eViz 를 받으므로 그 가드를 렌더러 안으로 접었다 — 호출자는
// 무조건 부르고 판단은 렌더러가 한다. 효과는 동일하다(eViz>=0.98 이면 이전과 똑같이
// 루프를 전혀 안 돈다 — 조기 return 한 줄일 뿐 계산이나 순서가 달라지지 않는다).
//
// ctx 상태 주의(Fact #2): stars.ts 와 동일하게 ctx.globalCompositeOperation 을 스스로
// 설정하지 않는다 — 별 루프 앞에서 frame() 이 설정한 값(`LITE ? 'source-over' : 'lighter'`)을
// 그대로 물려받는다. 이 렌더러가 stars 다음으로 호출되는 한 안전하다(호출 순서는
// engine/legacy.ts 의 frame() 이 그대로 보존한다).
import type { HazePt } from '../particles'
import type { Projection } from '../projection'
import type { FieldRenderer } from './types'

export function createHaze(deps: { projection: Projection; haze: HazePt[] }): FieldRenderer {
  const { projection, haze } = deps
  return (rc) => {
    if (rc.eViz >= 0.98) return
    const { ctx, t, ui, eViz } = rc
    const LITE = (ui.theme === 'light')
    for (const p of haze) {
      const pr = projection.proj(p.x, p.y, p.z); const X = pr[0], Y = pr[1]
      const tw = 0.6 + 0.4 * Math.sin(t * p.sp + p.ph)
      const a = (0.04 + p.b * 0.4) * tw * (1 - eViz) * 0.7
      if (a <= 0.004) continue
      ctx.fillStyle = LITE ? `rgba(88,94,118,${a * 1.2})` : `rgba(150,160,185,${a})`
      ctx.beginPath(); ctx.arc(X, Y, p.sz, 0, 6.283); ctx.fill()
    }
  }
}
