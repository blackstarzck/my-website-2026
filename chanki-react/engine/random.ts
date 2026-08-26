export type Rng = () => number

/** 표준 mulberry32. 같은 시드 → 같은 수열. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 원본 gauss() 의 Box–Muller 공식 그대로, Math.random 만 rng 로 치환. */
export function makeGauss(rng: Rng): () => number {
  return () => {
    let u = 0
    let v = 0
    while (!u) u = rng()
    while (!v) v = rng()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.283 * v)
  }
}
