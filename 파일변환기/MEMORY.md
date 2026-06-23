# 파일변환기 개발 로그

---

## 세션 1 — 2026-06-23

### 한 일 (순서대로)

**1. 저장소 정리**
- `CLAUDE.md` 대폭 확장 → 이후 사용자가 직접 간결하게 재편집 (현재 버전: 스택·원칙·현재상태만)
- `README.md` 정리: 프로젝트 표 + Phase 1~4 로드맵 추가
- `ideas/동아리자동화_사업계획.md` 삭제 (보류 확정)
- commit `2ee2cdc` → push 완료

**2. 파일변환기 Phase 1 MVP 구현**

라이브러리 설치:
```
npm install pdf-lib pdfjs-dist
→ dist 파일을 assets/js/에 복사 (움짤메이커와 동일 패턴)
```

생성된 파일:
```
파일변환기/
├── index.html          탭 4개 (이미지→PDF / PDF→이미지 / PDF 합치기 / PDF 분할)
├── assets/
│   ├── style.css       다크 테마, 움짤메이커 동일 스타일
│   ├── app.js          ES module — 4가지 기능 전부
│   └── js/
│       ├── pdf-lib.min.js       UMD 빌드, window.PDFLib로 접근
│       ├── pdf.min.mjs          pdfjs-dist legacy ES module
│       └── pdf.worker.min.mjs   pdfjs worker
├── .gitignore          node_modules 제외
└── MEMORY.md           이 파일
```

핵심 기술 결정:
- `pdf-lib`: UMD 빌드를 `<script src>` 로 로드 → `window.PDFLib` 전역 노출
- `pdfjs-dist`: `<script type="module">` 안에서 `import * as pdfjsLib from './js/pdf.min.mjs'` 로 사용
- 두 방식 혼합 가능한 이유: 일반 script는 동기 실행, module script는 항상 defer → 순서 보장됨

**3. 버그 수정**

- 문제: CSS `display: flex`가 HTML `hidden` 속성의 `display: none`을 덮어써서 변환 전에도 진행률 바가 보임
- 수정: `style.css` 첫 줄에 `[hidden] { display: none !important; }` 추가

**4. 테스트 (Playwright 헤드리스 브라우저)**

| 항목 | 결과 |
|---|---|
| 페이지 로드, 탭 4개 | ✅ |
| 탭 전환 (패널 1개만 활성) | ✅ |
| JS 콘솔 에러 | ✅ 없음 |
| 이미지→PDF 변환 및 다운로드 | ✅ (982 bytes PDF 생성) |
| 파일 없을 때 버튼 비활성화 | ✅ |
| 초기 진행률 바 숨김 (버그 수정 후) | ✅ |

- commit `0db5c94` → push 완료

---

## 다음 세션 시작 전 목표 & 할 일

### 즉시 해야 할 것 (Phase 1 마무리)

1. **애드센스 필수 페이지** 추가
   - `privacy.html` — 움짤메이커 것 복사 후 서비스명만 "파일변환기"로 변경
   - `contact.html` — 동일
   - `robots.txt`, `sitemap.xml` — 동일

2. **`파일변환기/README.md`** 작성
   - 기능 설명, 로컬 실행 방법(`python3 -m http.server 8080`), Cloudflare Pages 배포 방법

3. **Cloudflare Pages 배포**
   - GitHub 연동 or 폴더 드래그앤드롭
   - 배포 후 URL 확인

### 이후 단계 (Phase 2~4)

- Phase 2: DOCX → PDF (`mammoth.js` + `jsPDF`) — 서식 깨짐 한계 명시 필수
- Phase 3: HWP → PDF — 라이브러리 스파이크(1주) 먼저, 가능 여부 확인 후 착수
- Phase 4: PPTX → PDF — 서버 필요 (VPS + LibreOffice headless), 배포 경험 쌓으면서

### 움짤메이커도 남은 일

- Cloudflare Pages 배포 + 애드센스 신청 (코드는 이미 완성)
