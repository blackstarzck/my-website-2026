# 김찬기 — 포트폴리오

캔버스 위에 경력을 지도로 그린 개인 포트폴리오입니다. 30개 노드가 6개 영역
(입구 · 프론트엔드 · 서버 · AI · 제품 · 실험실)으로 나뉘어 있고, 노드를 따라가며
어떤 일을 해왔는지 볼 수 있습니다.

- **앱**: [`chanki-react/`](chanki-react)
- **스택**: Next.js 16 · TypeScript (strict) · Zustand · Canvas 2D

## 실행

```bash
cd chanki-react
pnpm install
pnpm dev
```

## 검증

```bash
pnpm exec tsc --noEmit && pnpm lint && pnpm test:unit && pnpm test:e2e
```

## 출처

이 사이트의 렌더링 엔진과 인터랙션 구조는 [nicoborja.com](https://nicoborja.com)
을 분석해 이식한 것입니다. 원본은 단일 HTML 문서의 vanilla Canvas 구현이고,
이 저장소는 그것을 Next.js · TypeScript · Zustand 구조로 옮기면서 콘텐츠를
전부 제 것으로 교체한 결과물입니다.

원본의 서체(상용 라이선스)와 이미지는 포함하지 않았습니다. 본문 서체는
[Pretendard](https://github.com/orioncactus/pretendard) (OFL 1.1) 를 씁니다.

원본 저작자의 디자인에 경의를 표합니다. 상업적 사용 계획은 없습니다.
