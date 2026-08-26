import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, isAbsolute, join, relative, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '../..')

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) return name === 'node_modules' ? [] : walk(p)
    return /\.(ts|tsx)$/.test(name) ? [p] : []
  })
}

const rel = (p: string) => relative(ROOT, p).replace(/\\/g, '/')

// ── 리뷰 Fix 2: 정규식 하나로 "from '@/...'" 문자열만 잡던 방식은 두 우회를 놓친다 —
// 동적 import('...')는 `from` 키워드가 없고, 상대경로(../stores/engineStore)는 `@/`
// 접두사가 없다. 그래서 (1) 정적 from 과 동적 import() 양쪽에서 지정자 문자열을 뽑고,
// (2) 그 지정자를 (별칭이든 상대경로든) 저장소 루트 기준 실제 파일 경로로 정규화한 뒤,
// (3) 그 파일 경로가 감시 대상 파일/디렉터리를 실제로 가리키는지 비교한다.
// ESLint import-path 규칙(예: no-restricted-imports)이 없는 상황에서 별도 AST 파서를
// 새로 들이지 않고도 두 우회 형태를 정확히 잡을 수 있는 가장 가벼운 방법이라 골랐다 —
// 이 파일의 기존 스타일(정규식 기반 구조 테스트)과도 일관된다. 남는 한계는 원래
// 정규식판과 동일하게 공유한다: 주석/문자열 안에 우연히 `from '...'`/`import('...')`
// 패턴이 그대로 나타나면 오탐할 수 있다 — 완전한 TS AST 파싱(예: 이미 devDependency인
// `typescript` 컴파일러 API)이면 이것도 없앨 수 있지만, 이 저장소의 다른 구조 테스트가
// 전부 텍스트 기반이라 굳이 무거운 파서를 새로 들이지 않았다.
const IMPORT_RE = /\bfrom\s+['"]([^'"]+)['"]|\bimport\(\s*['"]([^'"]+)['"]\s*\)/g

function importSpecifiers(src: string): string[] {
  return [...src.matchAll(IMPORT_RE)].map((m) => (m[1] ?? m[2])!)
}

/** 지정자를 파일시스템 절대경로로 정규화한다. 로컬 파일을 가리키지 않는 bare 패키지
 * 지정자(react, zustand, zustand/vanilla 등)는 null — 이 테스트들은 로컬 경계만 본다. */
function resolveSpecifier(spec: string, fromFile: string): string | null {
  if (spec.startsWith('@/')) return resolve(ROOT, spec.slice(2))
  if (spec.startsWith('.')) return resolve(dirname(fromFile), spec)
  return null
}

const stripExt = (p: string) => p.replace(/\.(ts|tsx|js|jsx|mjs|cjs)$/, '')

/** resolved 가 targetFile(확장자 없이 준 절대경로)을 가리키는가. */
function pointsAtFile(resolved: string, targetFileNoExt: string): boolean {
  return stripExt(resolved) === targetFileNoExt
}

/** resolved 가 targetDir 내부(자기 자신 포함)를 가리키는가. */
function pointsIntoDir(resolved: string, targetDir: string): boolean {
  const r = relative(targetDir, resolved)
  return r === '' || (!r.startsWith('..') && !isAbsolute(r))
}

/** 파일이 특정 지점을 가리키는 import/동적 import 를 하나라도 갖는가. */
function importsTarget(path: string, matches: (resolved: string) => boolean): boolean {
  return importSpecifiers(readFileSync(path, 'utf8')).some((spec) => {
    const resolved = resolveSpecifier(spec, path)
    return resolved !== null && matches(resolved)
  })
}

describe('구조 경계', () => {
  it('engineStore 를 import 하는 app/components 파일은 MapCanvas 뿐이다', () => {
    const engineStoreFile = resolve(ROOT, 'stores/engineStore')
    const offenders = [...walk(join(ROOT, 'app')), ...walk(join(ROOT, 'components'))]
      .filter((p) => importsTarget(p, (resolved) => pointsAtFile(resolved, engineStoreFile)))
      .map(rel)
    expect(offenders).toEqual(['components/MapCanvas.tsx'])
  })

  it('engine/ 은 components/ 를 import 하지 않는다', () => {
    const componentsDir = resolve(ROOT, 'components')
    const offenders = walk(join(ROOT, 'engine'))
      .filter((p) => importsTarget(p, (resolved) => pointsIntoDir(resolved, componentsDir)))
      .map(rel)
    expect(offenders).toEqual([])
  })

  // 리뷰 Fix 1 을 구조로 고정한다: uiStore.ts 가 다시 React-바인딩 'zustand' 엔트리를
  // import 하면(엔진이 다시 React 를 모듈 그래프에 끌어들이면) 여기서 즉시 빨간불이
  // 켜진다. 'zustand/vanilla' 는 계속 허용 — bare 지정자 'zustand' 와 문자열이 다르므로
  // 아래 비교가 둘을 정확히 가른다.
  it('uiStore 는 React 바인딩 zustand 엔트리를 import 하지 않는다', () => {
    const src = readFileSync(resolve(ROOT, 'stores/uiStore.ts'), 'utf8')
    const specs = importSpecifiers(src)
    expect(specs).not.toContain('zustand')
    expect(specs).toContain('zustand/vanilla')
  })

  it('uiStore 는 vanilla 스토어다 — 호출하면 컴파일 밖에서도 실패한다', async () => {
    const store = await import('../uiStore')
    const hook = await import('../useUIStore')
    expect(typeof store.uiStore).toBe('object')          // 훅이면 function
    expect(typeof hook.useUIStore).toBe('function')       // 래퍼는 함수
    expect(typeof store.uiStore.getState).toBe('function')
    expect(typeof store.uiStore.subscribe).toBe('function')
  })
})
