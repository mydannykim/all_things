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

## 다음 세션 목표

### Phase 3 — HWP → PDF 스파이크

1. `@ohah/hwpjs` npm 설치
2. 실제 HWP 파일로 브라우저 파싱 테스트
3. 텍스트/표/이미지 추출 가능 여부 확인
4. 가능 → 구현 / 불가능 → 보류

### 그 외
- sitemap.xml 도메인 업데이트 (`REPLACE-WITH-YOUR-DOMAIN` → 실제 URL)
- Google Search Console 등록
- 애드센스 신청 (트래픽 쌓인 후)
