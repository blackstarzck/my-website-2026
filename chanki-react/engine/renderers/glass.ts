// createGlass — initGlass/renderGlass(원본 index.html의 GLASS · refracción WebGL 절)를
// 그대로 옮긴 것. #glass 캔버스에 WebGL 컨텍스트를 만들어 #c(필드 캔버스)를 텍스처로
// 읽어 굴절시킨다.
//
// 리뷰 Fix 3/4(legacy.ts 주석 원문의 취지 유지): createShader/createProgram은 컨텍스트
// 유실 시 null을 반환할 수 있어 null이면 GL을 비우고 noglass 폴백으로 떨어진다(자기유발
// 컨텍스트 유실 버그 재발 방지). 링크 직후 셰이더를 detach+delete하는 것도 원본 그대로다
// (StrictMode 이중 마운트·HMR에서 셰이더 오브젝트가 계속 쌓이는 걸 막는다).
//
// dispose()는 Plan 1에서 이미 확립된 계약을 그대로 지킨다(태스크 지시 Fact #4): 우리가
// 만든 프로그램/버퍼/텍스처만 해제하고 loseContext()는 절대 부르지 않는다 — #glass
// 캔버스는 React가 소유하고 리마운트에서 재사용되므로, 컨텍스트를 잃게 만들면 다음
// 엔진의 getContext('webgl')가 "잃은" 같은 컨텍스트를 돌려주고 createShader()가 null이
// 되어 StrictMode 이중 마운트의 두 번째 엔진이 매번 'glass null' 경고로 죽는다(Plan 1에서
// 실제로 재현·확인됨).
//
// resize 리스너 추적: 원본은 legacy.ts의 공용 on()(리스너를 legacy.ts의 dispose()가 도는
// 배열에 등록)으로 걸었다. initGlass()가 이 모듈로 옮겨오면서 그 공용 배열에 더는 접근할
// 수 없으므로, 이 모듈이 자기 리스너를 직접 추적하고 자기 dispose()에서 직접 해제한다 —
// 관찰 가능한 결과(엔진 dispose 시 이 리스너가 제거된다)는 동일하다, 등록/해제 위치만
// legacy.ts 배열에서 이 모듈 자신으로 바뀐다.
//
// 브리프 이탈 1 (Ambiguity #2): createGlass(canvas)는 브리프에 단일 인자로 적혀 있지만,
// renderGlass 본문은 #c(필드 캔버스)도 WebGL 텍스처 소스로 읽는다
// (gl.texImage2D(...,c)). 브리프에 없던 이 두 번째 캔버스가 실제로 필요해 인자를
// 추가했다 — createGlass(canvas, field)로, field는 텍스처 소스로만 쓰인다.
//
// 브리프 이탈 2 (Ambiguity #2): 브리프가 준 GlassShape.amt는 필수(number)지만, 원본
// render 본문은 `s.amt === undefined ? 1.0 : s.amt`로 방어한다. amt를 필수로 좁히면
// strictNullChecks 아래서 이 비교가 TS2367("no overlap")로 컴파일 에러가 난다. 검사
// 로직 자체를 지우면 컴파일은 되지만(현재 모든 호출부가 amt를 채워 넘겨 관찰 가능한
// 차이는 없다, grep으로 확인) 이관 범위를 넘는 손질이 된다고 판단해, amt를 원본 그대로
// 옵셔널(amt?: number)로 두어 방어 로직을 한 글자도 안 건드렸다.
export type GlassShape = {
  x: number; y: number; w: number; h: number; rad: number; amt?: number
}

export function createGlass(canvas: HTMLCanvasElement, field: HTMLCanvasElement): {
  ok(): boolean
  render(shapes: GlassShape[], dark: number): void
  dispose(): void
} {
  const gcanvas = canvas
  let GL: WebGLRenderingContext | null = null
  let glassProg: WebGLProgram | null = null
  let glassTex: WebGLTexture | null = null
  let glassQuad: WebGLBuffer | null = null
  let glassLoc: {
    p: number
    uField: WebGLUniformLocation | null
    uRes: WebGLUniformLocation | null
    uRect: WebGLUniformLocation | null
    uRadius: WebGLUniformLocation | null
    uAmt: WebGLUniformLocation | null
    uDark: WebGLUniformLocation | null
  } | null = null
  let resizeHandler: (() => void) | null = null

  function initGlass(): void {
    const gl = gcanvas.getContext('webgl', { premultipliedAlpha: false, alpha: true, antialias: true })
    if (!gl) { document.body.classList.add('noglass'); return }
    GL = gl
    const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}'
    const FS = `precision highp float;
 uniform sampler2D uField;uniform vec2 uRes;uniform vec4 uRect;uniform float uRadius;uniform float uAmt;uniform float uDark;
 float sdRR(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return min(max(q.x,q.y),0.0)+length(max(q,0.0))-r;}
 void main(){
  vec2 fp=gl_FragCoord.xy;vec2 ctr=uRect.xy+uRect.zw*0.5;vec2 hf=uRect.zw*0.5;vec2 p=fp-ctr;
  float d=sdRR(p,hf,uRadius);
  if(d>1.5)discard;
  float e=2.0;
  vec2 g=vec2(sdRR(p+vec2(e,0.0),hf,uRadius)-sdRR(p-vec2(e,0.0),hf,uRadius),
             sdRR(p+vec2(0.0,e),hf,uRadius)-sdRR(p-vec2(0.0,e),hf,uRadius));
  g=normalize(g+1e-5);
  float bw=min(uRect.z,uRect.w)*0.55;
  float t=clamp(-d/bw,0.0,1.0);
  float slope=cos(t*1.5708);
  vec2 uv=fp/uRes;vec2 cuv=ctr/uRes;
  vec2 magUv=cuv+(uv-cuv)*mix(1.0,0.96,uAmt);
  vec2 sUv=magUv+(-g*slope*58.0*uAmt)/uRes;
  float ca=(slope*2.0+0.25)*uAmt*uAmt;vec2 cUv=(g*ca)/uRes;
  vec3 col;
  col.r=texture2D(uField,sUv+cUv).r;
  col.g=texture2D(uField,sUv).g;
  col.b=texture2D(uField,sUv-cUv).b;
  vec3 bl=vec3(0.0);float tot=0.0;
  for(int i=-2;i<=2;i++){for(int j=-2;j<=2;j++){vec2 o=vec2(float(i),float(j))*1.6/uRes;bl+=texture2D(uField,sUv+o).rgb;tot+=1.0;}}
  bl/=tot;col=mix(col,bl,0.4*uAmt);
  col=col*mix(1.0,0.9,uAmt)+vec3(0.04,0.038,0.03)*uAmt;
  col=mix(col,mix(col,vec3(0.52,0.85,0.79),0.4),uDark);
  float rim=pow(slope,11.0);
  float lt=clamp(dot(g,normalize(vec2(-0.7,0.72))),0.0,1.0);
  col+=rim*lt*(0.08*uAmt+0.05*uDark);
  float aMode=step(0.8,uAmt);
  float a=clamp(1.0-smoothstep(-1.5,1.0,d),0.0,1.0)*mix(pow(slope,1.6)*mix(1.0,0.82,uDark)+0.1*uDark,1.0,aMode);
  gl_FragColor=vec4(col,a*0.97);
 }`
    function sh(t: number, s: string): WebGLShader | null {
      const o = gl!.createShader(t)
      if (!o) return null
      gl!.shaderSource(o, s); gl!.compileShader(o)
      if (!gl!.getShaderParameter(o, gl!.COMPILE_STATUS)) console.warn('glass', gl!.getShaderInfoLog(o))
      return o
    }
    const prog = gl.createProgram()
    const vs = sh(gl.VERTEX_SHADER, VS)
    const fs = sh(gl.FRAGMENT_SHADER, FS)
    // 리뷰 Fix 4: createShader/createProgram은 컨텍스트 유실 시 null을 반환할 수 있다.
    // 예전에는 `as WebGLShader`/`as WebGLProgram`로 그 null을 지우고 진행해 자기유발
    // 컨텍스트 유실 버그가 getShaderParameter(null,...) 경고 2개로만 드러났다(이미 고침).
    // 자기유발 버그는 없어졌지만 진짜 컨텍스트 유실(GPU 리셋·드라이버 재시작)은 여전히
    // 가능하므로, null이면 조용히 기존 noglass 폴백으로 떨어진다.
    if (!prog || !vs || !fs) { GL = null; document.body.classList.add('noglass'); return }
    gl.attachShader(prog, vs); gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    // 리뷰 Fix 3: attachShader 이후에는 프로그램이 이미 셰이더를 참조하므로 링크 직후
    // detach+delete 해도 무방하다(WebGL 표준 관용구). 안 하면 엔진을 새로 만들 때마다
    // (StrictMode 이중 마운트·HMR) 셰이더 오브젝트 2개가 컨텍스트에 계속 쌓인다.
    // dispose()의 deleteProgram은 프로그램만 해제하고 이미 분리된 셰이더는 건드리지
    // 않으므로 여기서 지운다.
    gl.detachShader(prog, vs); gl.deleteShader(vs)
    gl.detachShader(prog, fs); gl.deleteShader(fs)
    glassProg = prog
    glassQuad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, glassQuad)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    glassTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, glassTex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    glassLoc = {
      p: gl.getAttribLocation(prog, 'p'),
      uField: gl.getUniformLocation(prog, 'uField'),
      uRes: gl.getUniformLocation(prog, 'uRes'),
      uRect: gl.getUniformLocation(prog, 'uRect'),
      uRadius: gl.getUniformLocation(prog, 'uRadius'),
      uAmt: gl.getUniformLocation(prog, 'uAmt'),
      uDark: gl.getUniformLocation(prog, 'uDark'),
    }
    gcanvas.width = innerWidth; gcanvas.height = innerHeight
    resizeHandler = () => { gcanvas.width = innerWidth; gcanvas.height = innerHeight }
    window.addEventListener('resize', resizeHandler)
  }

  function render(shapes: GlassShape[], dark: number): void {
    if (!GL || !glassLoc) return
    const gl = GL, loc = glassLoc
    gl.viewport(0, 0, gcanvas.width, gcanvas.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT)
    if (!shapes || !shapes.length) return
    gl.useProgram(glassProg)
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, glassTex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, field)
    gl.uniform1i(loc.uField, 0)
    gl.uniform2f(loc.uRes, gcanvas.width, gcanvas.height)
    gl.uniform1f(loc.uDark, dark)
    gl.bindBuffer(gl.ARRAY_BUFFER, glassQuad); gl.enableVertexAttribArray(loc.p)
    gl.vertexAttribPointer(loc.p, 2, gl.FLOAT, false, 0, 0)
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    for (const s of shapes) {
      if (s.w < 2) continue
      const yb = gcanvas.height - (s.y + s.h)
      gl.uniform4f(loc.uRect, s.x, yb, s.w, s.h); gl.uniform1f(loc.uRadius, s.rad)
      gl.uniform1f(loc.uAmt, s.amt === undefined ? 1.0 : s.amt)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
  }

  function ok(): boolean { return GL !== null }

  function dispose(): void {
    if (resizeHandler) { window.removeEventListener('resize', resizeHandler); resizeHandler = null }
    const gl = GL
    if (gl) {
      if (glassProg) gl.deleteProgram(glassProg)
      if (glassQuad) gl.deleteBuffer(glassQuad)
      if (glassTex) gl.deleteTexture(glassTex)
      glassProg = null; glassQuad = null; glassTex = null; glassLoc = null; GL = null
    }
  }

  initGlass()

  return { ok, render, dispose }
}
