import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png',
  '.woff2': 'font/woff2', '.txt': 'text/plain', '.mp4': 'video/mp4',
}

/** 정적 파일을 서빙하는 서버를 띄운다. 호출자가 server.close()로 정리한다. */
export function serve(root, port) {
  const server = createServer(async (req, res) => {
    const path = decodeURIComponent(req.url.split('?')[0])
    const file = join(root, path === '/' ? '/index.html' : path)
    try {
      const buf = await readFile(file)
      res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' })
      res.end(buf)
    } catch {
      res.writeHead(404).end('not found')
    }
  })
  return new Promise((ok, reject) => {
    server.once('error', reject)
    server.listen(port, '127.0.0.1', () => {
      server.removeListener('error', reject)
      // listen 성공 후의 런타임 에러는 조용히 사라지지 않게 로그만 남긴다.
      server.on('error', (err) => console.error('[static-server]', err))
      ok(server)
    })
  })
}
