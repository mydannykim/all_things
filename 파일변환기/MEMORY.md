# 파일변환기 개발 로그

## v0.1 — Phase 1 MVP (2026-06-23)

### 구현된 기능
- 이미지(JPG/PNG) → PDF: 여러 장 업로드, 한 PDF로 합치기
- PDF → 이미지: 각 페이지를 PNG로 추출, 개별 다운로드
- PDF 합치기: 여러 PDF를 순서대로 병합
- PDF 분할: 페이지 범위 입력(예: `1-3, 5, 7-9`) → 범위별 PDF 개별 다운로드

### 파일 구조
```
파일변환기/
├── index.html          단일 페이지, 탭 4개
├── assets/
│   ├── style.css       다크 테마, 움짤메이커 동일 스타일
│   ├── app.js          ES module, 4가지 기능 전부
│   └── js/
│       ├── pdf-lib.min.js       pdf-lib 2.x UMD 번들 (window.PDFLib)
│       ├── pdf.min.mjs          pdfjs-dist legacy 빌드
│       └── pdf.worker.min.mjs   pdfjs worker
├── .gitignore          node_modules 제외
└── MEMORY.md           이 파일
```

### 라이브러리
- `pdf-lib`: PDF 생성/합치기/분할 (UMD, 글로벌 `window.PDFLib`)
- `pdfjs-dist`: PDF→이미지 렌더링 (ES module, legacy/build/ 사용)

### 미완료 (다음 단계)
- [ ] privacy.html / contact.html / robots.txt / sitemap.xml
- [ ] 로컬 테스트 직접 검증 (`python3 -m http.server 8080`)
- [ ] README.md 작성 (배포 가이드 포함)
- [ ] Cloudflare Pages 배포
- [ ] Phase 2: DOCX → PDF (mammoth.js)
