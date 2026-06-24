# 파일변환기 개발 로그

---

## 세션 1 — 2026-06-23

### 한 일

**1. 저장소 정리**
- `CLAUDE.md` 확장 → 사용자가 간결하게 재편집
- `README.md` 정리: 프로젝트 표 + 로드맵 추가

**2. Phase 1 MVP 구현**

라이브러리: `pdf-lib`, `pdfjs-dist`

생성된 파일:
```
파일변환기/
├── index.html          탭 4개 (이미지→PDF / PDF→이미지 / PDF 합치기 / PDF 분할)
├── assets/
│   ├── style.css
│   ├── app.js
│   └── js/
│       ├── pdf-lib.min.js
│       ├── pdf.min.mjs
│       └── pdf.worker.min.mjs
└── MEMORY.md
```

핵심 기술 결정:
- `pdf-lib`: UMD 빌드 → `window.PDFLib` 전역 노출
- `pdfjs-dist`: `<script type="module">` 안에서 ES module로 import
- 두 방식 혼합: 일반 script는 동기, module은 defer → 순서 보장됨

**3. 버그 수정**
- CSS `display: flex`가 `hidden` 속성 덮어써 진행률 바가 미리 보임
- 수정: `[hidden] { display: none !important; }` 추가

**4. 테스트 결과**

| 항목 | 결과 |
|---|---|
| 페이지 로드, 탭 4개 | ✅ |
| 탭 전환 | ✅ |
| JS 콘솔 에러 없음 | ✅ |
| 이미지→PDF 변환 및 다운로드 | ✅ |
| 파일 없을 때 버튼 비활성화 | ✅ |
| 초기 진행률 바 숨김 | ✅ |

---

## 세션 2 — 2026-06-24

### 한 일

**1. 배포 준비 파일 추가**
- `privacy.html`, `contact.html` — 애드센스 필수
- `robots.txt`, `sitemap.xml` — SEO
- `README.md` — 배포 가이드

**2. Cloudflare Pages 배포 완료**
- URL: https://change-file.mydannykim.workers.dev/
- GitHub 연동, push 시 자동 배포

**3. 움짤메이커 폴더 삭제**
- 파일변환기에 집중하기 위해 제거 (Git 히스토리에는 남아있음)

**4. Phase 2 — DOCX → PDF 구현**

추가 라이브러리:
- `mammoth.browser.min.js` — DOCX → HTML 파싱
- `html2pdf.bundle.min.js` — HTML → PDF 렌더링 (html2canvas + jsPDF 번들)

흐름:
```
.docx 업로드
  → mammoth.convertToHtml({ arrayBuffer })
  → HTML 문자열
  → html2pdf().set(opt).from(container).outputPdf('blob')
  → PDF 다운로드
```

한계 명시: 표/복잡한 서식/특수 폰트는 깨질 수 있음 → UI에 경고 박스 추가

탭 구성: 5개 (이미지→PDF / PDF→이미지 / PDF 합치기 / PDF 분할 / DOCX→PDF)

**5. ideas/파일변환기_Phase2-4_계획.md 작성**
- DOCX/HWP/PPTX 기술 스택, 한계, 순서 문서화

---

---

## 세션 3 — 2026-06-24

### 한 일

**Phase 3 — HWP → PDF 구현 완료**

라이브러리: `@ohah/hwpjs` (Rust 기반 WASM, 브라우저 지원)

흐름:
```
.hwp 파일 업로드 (Uint8Array)
  → hwpjsModule.toHtml(hwpBuffer)      # HWP → 완전한 HTML 문서 (DEBUG 줄 제거)
  → DOMParser로 파싱
  → <style> 추출 → document.head 주입  # html2canvas가 스타일 인식
  → .hpa 요소 추출 (A4 페이지 단위)
  → .hcD, .hcI에 width/height 부여     # 핵심 버그 수정
  → document.body에 추가 + 2×rAF 대기
  → html2pdf().from(hpa).outputPdf()   # HTML → PDF
  → Blob URL 다운로드
```

핵심 버그 및 해결:
- `toHtml()` 반환값이 완전한 HTML 문서 → `container.innerHTML`에 넣으면 `<style>` 유실
  → DOMParser로 파싱 후 `<style>`을 `document.head`에 따로 주입
- `.hcD`, `.hcI`가 `position:absolute` + 크기 없음 → html2canvas가 0×0으로 보고 내용 건너뜀 → 백지 PDF
  → `width:210mm; height:297mm` 강제 부여로 해결
- WASM `SharedArrayBuffer` 필요 → `_headers` 파일로 COOP/COEP 헤더 적용

추가 파일:
- `assets/js/hwpjs-bundle.js` (472KB) — HWP 파서 번들
- `assets/js/wasi-worker-browser.mjs` (434KB) — WASM 워커
- `assets/js/hwpjs.wasm32-wasi.wasm` (889KB) — HWP 파서 바이너리
- `_headers` — Cloudflare Pages COOP/COEP 설정

구현 방식: 첫 사용 시 lazy import (`await import('./js/hwpjs-bundle.js')`) — 탭 진입 전엔 WASM 미로딩

한계 (UI에 명시):
- 복잡한 서식, 표, 그림 깨질 수 있음
- 기본 텍스트 문서에 최적화

---

## 다음 세션 목표

### Phase 4 — PPTX → PDF (서버 필요)
- Cloudflare Workers + LibreOffice headless 학습
- 또는 VPS 배포 경험 쌓기
- 클라이언트사이드 불가 확인됨 (유료 SDK 없이는 어려움)

### SEO / 수익화
- sitemap.xml 도메인 업데이트 (`REPLACE-WITH-YOUR-DOMAIN` → 실제 URL)
- Google Search Console 등록
- 애드센스 신청 (트래픽 어느 정도 쌓인 후)
