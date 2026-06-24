# CLAUDE.md

GitHub: https://github.com/mydannykim/all_things (main 브랜치)

## 원칙
- 서버비 0원: Vanilla JS + 클라이언트사이드 처리 → Cloudflare Pages 배포
- 수익화: 애드센스 (승인 요건: privacy.html + contact.html 필수)
- 마케팅: "파일이 서버에 전송되지 않음" 모든 프로젝트에 명시
- 새 프로젝트 → 루트 폴더 + README.md 표에 한 줄 추가

## 스택
- Vanilla HTML / CSS / JS (프레임워크 없음)
- 라이브러리: `npm install` 후 dist 파일만 `assets/js/`에 복사해서 `<script>` 로 로드
- 파일변환기: `pdf-lib` + `pdfjs-dist` + `mammoth.js` + `html2pdf.js` + `@ohah/hwpjs` (WASM)
- 배포: Cloudflare Pages (GitHub 연동, push 시 자동 배포)
- HWP 기능은 SharedArrayBuffer 필요 → `_headers`에 COOP/COEP 설정

## 로컬 테스트
```bash
# HWP 기능 포함 (COOP/COEP 헤더 필요)
python3 -c "
import http.server
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cross-Origin-Opener-Policy','same-origin')
        self.send_header('Cross-Origin-Embedder-Policy','require-corp')
        self.send_header('Cross-Origin-Resource-Policy','cross-origin')
        super().end_headers()
http.server.HTTPServer(('',8080),H).serve_forever()
"
```

## 현재 상태
- 파일변환기/: **개발 중 (Phase 4 예정)** — 배포완료
  - 배포 URL: https://change-file.mydannykim.workers.dev/
  - 완료: Phase 1 (PDF 4종), Phase 2 (DOCX→PDF), Phase 3 (HWP→PDF)
  - 로드맵: ideas/파일변환기_계획.md 참고
