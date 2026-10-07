# 로컬 미리보기용 서버 — 캐시를 끄고 항상 최신 파일을 보냅니다.
import http.server, sys

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

port = int(sys.argv[1]) if len(sys.argv) > 1 else 5179
http.server.ThreadingHTTPServer(("", port), NoCacheHandler).serve_forever()
