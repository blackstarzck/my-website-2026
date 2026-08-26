import { fileURLToPath } from 'node:url'
import { configDefaults, defineConfig } from 'vitest/config'

// tsconfig.json 의 "@/*": ["./*"] 매핑을 그대로 미러링한다.
// Vitest(Vite)는 tsconfig paths를 기본으로 읽지 않으므로 별도 alias가 필요하다.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  test: {
    // tests/ 는 Task 7 의 Playwright E2E 스위트 전용이다. Vitest 의 기본 include 패턴이
    // *.spec.ts 도 줍는데, Playwright 전용 API(test.describe.configure 등)를 Vitest
    // 러너 밖에서 실행하면 깨진다 — 명시적으로 제외한다.
    exclude: [...configDefaults.exclude, 'tests/**'],
  },
})
