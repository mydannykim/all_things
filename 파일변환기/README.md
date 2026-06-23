# 무료 PDF 변환기 — 배포 가이드

서버 없이 브라우저(클라이언트)에서만 PDF/이미지 변환을 처리하는 정적 웹앱. 호스팅 비용 0원.

## 기능

- 이미지(JPG, PNG) → PDF 변환
- PDF → 이미지(PNG) 추출 (해상도 배율 선택 가능)
- PDF 합치기 (여러 PDF → 하나로)
- PDF 분할 (페이지 범위 지정 → 별도 파일로)

## 폴더 구조

```
파일변환기/
├── index.html        메인 페이지 (탭 4개)
├── privacy.html      개인정보처리방침 (애드센스 승인 필수)
├── contact.html      문의 페이지 (애드센스 승인 필수)
├── robots.txt
├── sitemap.xml       배포 후 도메인 주소로 REPLACE-WITH-YOUR-DOMAIN 치환 필요
└── assets/
    ├── style.css
    ├── app.js        핵심 로직 (4가지 변환 기능)
    └── js/
        ├── pdf-lib.min.js      PDF 생성/합치기/분할 (UMD, window.PDFLib)
        ├── pdf.min.mjs         pdfjs-dist — PDF→이미지 렌더링
        └── pdf.worker.min.mjs  pdfjs 워커
```

## 1. 로컬에서 먼저 확인하기

```bash
cd 파일변환기
python3 -m http.server 8080
```

브라우저로 `http://localhost:8080` 접속 후 각 탭의 기능을 직접 테스트할 것.

## 2. Cloudflare Pages 배포 (둘 중 하나)

### 방법 A — GitHub 연동 (추천, 이후 업데이트가 쉬움)

1. [Cloudflare 대시보드](https://dash.cloudflare.com) → Workers & Pages → Create → Pages → "Connect to Git"
2. 저장소 선택, **Root directory를 `파일변환기/`로 설정**
3. 빌드 커맨드 비워두기, Build output directory: `/`
4. Deploy → 몇 분 내 `*.pages.dev` 주소로 배포 완료

### 방법 B — 드래그 앤 드롭 (가장 빠름)

1. Cloudflare 대시보드 → Workers & Pages → Create → Pages → "Upload assets"
2. `파일변환기/` 폴더 전체를 드래그해서 업로드
3. Deploy → 즉시 `*.pages.dev` 주소 발급

## 3. 배포 후 꼭 할 일

1. `sitemap.xml`의 `REPLACE-WITH-YOUR-DOMAIN`을 실제 배포 주소로 수정 후 재배포
2. [Google Search Console](https://search.google.com/search-console)에 사이트 등록 + sitemap.xml 제출
3. 각 탭 기능을 실제 파일로 테스트 (특히 큰 PDF, 다페이지 PDF)

## 4. 애드센스 신청 전 체크리스트

- [ ] 실제로 잘 작동하는 핵심 기능이 있는가 (완료)
- [ ] 개인정보처리방침 페이지 (완료: privacy.html)
- [ ] 문의 페이지 (완료: contact.html)
- [ ] 일정 기간 실제 트래픽이 있는 상태에서 신청 (만든 직후 바로 신청하지 말 것)
- [ ] [google.com/adsense](https://www.google.com/adsense)에서 신청, 발급된 코드 스니펫을 `index.html`의 `<head>`에 추가

## 5. 알아둘 점 (한계)

- 매우 큰 PDF(수백 MB)는 브라우저 메모리 한계로 느려지거나 실패할 수 있음
- PDF→이미지 추출 시 고해상도(3×)는 페이지 수가 많을수록 시간이 오래 걸림
- 정적 사이트라 회원가입, 파일 저장 같은 기능은 없음

## 다음 단계 (Phase 2~4)

- Phase 2: DOCX → PDF (`mammoth.js` + `jsPDF`) — 서식 깨짐 한계 명시 필수
- Phase 3: HWP → PDF — 라이브러리 스파이크(1주) 먼저, 가능 여부 확인 후 착수
- Phase 4: PPTX → PDF — 서버 필요 (VPS + LibreOffice headless)
