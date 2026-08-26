# 김찬기 — 포트폴리오

Next.js 16 + TypeScript + Zustand 로 만든 캔버스 기반 포트폴리오입니다.
30개 노드를 6개 영역으로 나눠 지도처럼 탐색합니다. TypeScript 는 strict 모드로
돌고 `any` 는 어디에도 쓰지 않습니다 — 새 코드에서도 유지해 주세요.

렌더링 엔진과 인터랙션 구조는 [nicoborja.com](https://nicoborja.com) 을 분석해
이식한 것입니다 (자세한 내용은 저장소 루트 README 참고). 원본의 서체와 이미지는
포함하지 않았고, 콘텐츠는 전부 교체했습니다.

콘텐츠는 `tools/gen-content.py` 가 `data/*.ts` 를 생성합니다. 노드를 고칠 때는
생성기를 고치고 다시 돌려야 합니다 — `data/*.ts` 를 직접 고치면 다음 생성 때
덮어써집니다.

## Package manager: pnpm, always

This project uses **pnpm exclusively** — never `npm`, `yarn`, or `bun`. There is no
`package-lock.json` or `yarn.lock`; running another package manager will create one
and drift out of sync with `pnpm-lock.yaml`. If `pnpm` isn't installed, run
`corepack enable` — the exact version is pinned via `packageManager` in
`package.json`.

## Commands

| Command             | What it does                                              |
|----------------------|------------------------------------------------------------|
| `pnpm dev`           | Dev server at `http://localhost:3000`                     |
| `pnpm build`         | Production build                                           |
| `pnpm start`         | Serve the production build                                 |
| `pnpm lint`          | ESLint (`eslint-config-next`)                              |
| `pnpm typecheck`     | `tsc --noEmit`                                              |
| `pnpm test:unit`     | Vitest — content-migration fidelity + store logic (18 tests) |
| `pnpm test:e2e`      | Playwright — 792-value layout regression vs. the golden    |

## Layer map

```
app/        Next.js App Router — routes, root layout, global CSS
components/ React — mounts the engine, syncs DOM classes to store state
stores/     Zustand state (two stores, split by update frequency — see below)
engine/     Ported vanilla canvas/WebGL engine
data/       Typed content, mostly generated from the original mirror
```

Dependencies flow one way, top to bottom: `app` → `components` → `stores` →
`engine` → `data`. **`engine/` must never import from `components/`.** It is a
self-contained port that talks to the rest of the app only through `engine/types.ts`
(`EngineHandle`) and the two stores — that boundary is what makes the engine testable
and mountable without dragging React into it.

## Two stores, split by how often they change

- **`stores/uiStore.ts`** — discrete state that changes on user action: mode, active
  node, theme, hover. An ordinary Zustand React store; components subscribe via the
  `useUIStore` hook.
- **`stores/engineStore.ts`** — continuous per-frame values (camera, particle arrays,
  transition progress) written by the render loop roughly 60 times a second. It's
  built on `zustand/vanilla` and **exports no React hook, deliberately**. A component
  subscribing to a value that changes every frame would re-render every frame, which
  would undo the entire point of keeping the engine's hot path outside React. Read it
  with `engineStore.getState()`, never a hook.

## Generated data — do not hand-edit

`data/nodes.ts`, `data/edges.ts`, `data/spine.ts`, `data/zmap.ts`, and
`data/regions.ts` are generated from the original mirror (`contenido.js` and its
runtime constants); each carries a "generated — do not edit by hand" banner.
Regenerate with:

```
node tools/convert-content.mjs      # nodes.ts, edges.ts, spine.ts, zmap.ts
node tools/extract-constants.mjs    # regions.ts (boots the mirror in a headless browser)
```

`data/config.ts` and `data/types.ts` are hand-written and not generated.

## The layout golden is the answer key

`tests/goldens/layout-golden.json` holds 792 values (33 nodes × 4 arrays × 6 UI
states) measured from the original site. `tests/layout.spec.ts` drives the ported
engine through the same 6 states and asserts an exact match. **Never edit the golden
to make a failing test pass** — a mismatch means the port's math diverged from the
original. The golden is regenerated only from the mirror, by
`tools/extract-golden.mjs`, and has only ever been produced once (the commit that
introduced it).

## `engine/legacy.ts` is intentionally one large file

`engine/legacy.ts` (~1,900 lines) is a deliberately undecomposed port of the
original's imperative canvas engine — closures, mutable locals, direct DOM/WebGL
calls, kept close to the original's shape so it could be checked byte-for-byte
against the mirror before any restructuring. `components/MapCanvas.tsx` mounts it and
owns the static DOM skeleton the engine reaches into by element id. A later phase
decomposes the engine into smaller, independently testable pieces; until then, treat
it as a single unit — the layout golden only checks node positions, not rendering, so
a partial refactor can silently break drawing while every test stays green.
