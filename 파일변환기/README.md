# 무료 PDF 변환기 — 배포 가이드

서버 없이 브라우저(클라이언트)에서만 변환을 처리하는 정적 웹앱. 호스팅 비용 0원.
배포 URL: https://all-things-4ch.pages.dev/

## 현재 기능 (탭 6개)

- 이미지(JPG, PNG) → PDF
- PDF → 이미지(PNG) 추출 (해상도 배율 선택)
- PDF 합치기 (여러 PDF → 하나로)
- PDF 분할 (페이지 범위 지정)
- DOCX → PDF (서식 깨짐 가능, 경고 명시)
- HWP → PDF (기본 텍스트 문서 최적화, 서식 깨짐 가능, 경고 명시)

## 폴더 구조

```
파일변환기/
├── index.html        메인 페이지
├── privacy.html      개인정보처리방침
├── contact.html      문의 페이지
├── robots.txt
├── sitemap.xml
└── assets/
    ├── style.css
    ├── app.js
    └── js/
        ├── pdf-lib.min.js          PDF 생성/합치기/분할
        ├── pdf.min.mjs             PDF→이미지 렌더링
        ├── pdf.worker.min.mjs      pdfjs 워커
        ├── mammoth.browser.min.js  DOCX→HTML 파싱
        ├── html2pdf.bundle.min.js  HTML→PDF 렌더링
        ├── hwpjs-bundle.js         HWP 파싱 (WASM)
        ├── wasi-worker-browser.mjs WASM 워커
        └── hwpjs.wasm32-wasi.wasm  HWP 파서 바이너리 (889KB)
```

## 로컬 테스트

HWP → PDF 기능은 SharedArrayBuffer가 필요해 COOP/COEP 헤더를 지원하는 서버로 실행해야 함.

```bash
cd 파일변환기
python3 -c "
import http.server, os
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cross-Origin-Opener-Policy','same-origin')
        self.send_header('Cross-Origin-Embedder-Policy','require-corp')
        self.send_header('Cross-Origin-Resource-Policy','cross-origin')
        super().end_headers()
http.server.HTTPServer(('',8080),H).serve_forever()
"
# http://localhost:8080 접속
```

## 배포

Cloudflare Pages (GitHub 연동, push 시 자동 배포).

## 애드센스 신청 전 체크리스트

- [x] 핵심 기능 동작
- [x] privacy.html
- [x] contact.html
- [ ] 트래픽 어느 정도 쌓인 후 신청 (바로 신청 금지)
- [x] sitemap.xml 도메인 확정 + Google Search Console 등록 완료

## 다음 단계

- Phase 4: PPTX → PDF — 서버 필요 (Cloudflare Workers + LibreOffice headless)
- 애드센스 신청 (트래픽 쌓인 후)
