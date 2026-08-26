import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Task 7 의 Playwright 스위트가 http://127.0.0.1:3000 으로 접속한다(webServer.url).
  // Next 16 은 기본적으로 dev 리소스(HMR, 정적 청크)에 대한 cross-origin 요청을 막으므로
  // 이 오리진을 명시적으로 허용해야 테스트가 페이지를 로드할 수 있다. 프로덕션 빌드에는
  // 영향이 없다.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
