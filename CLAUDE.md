# CLAUDE.md

이 저장소(`all_things`)에서 작업할 때 참고할 컨텍스트. 새 세션(Claude Code 포함)을 시작하면 이 파일을 가장 먼저 읽을 것 — 사전 설명 없이 바로 작업 들어갈 수 있도록 작성됨.

GitHub: https://github.com/mydannykim/all_things (origin 연결됨, main 브랜치)

---

## 1. 누구를 위한 저장소인가

- 김성현, 컴퓨터공학과 3학년, 25세. 이메일 mydannykim@gmail.com
- 목표: 바이브 코딩(AI 코딩 도구 활용)으로 작더라도 실제 수익을 내는 프로젝트를 직접 만들어보며 포트폴리오를 쌓는 것
- 학업과 병행하므로 주당 투입 가능 시간은 보통 5~15시간. 이 시간 안에 끝낼 수 있는 단위로 작업을 쪼갤 것
- 서버 배포(Cloudflare Workers, VPS, Docker 등)도 직접 배우면서 해보고 싶어함 — 너무 다 대신 해주지 말고 배울 수 있게 설명 포함해서 진행

## 2. 저장소 구조 (현재 실제 상태)

```
all_things/ (= 로컬 폴더 "3학년 방학")
├── README.md              전체 프로젝트 목록 (사람이 보는 인덱스)
├── CLAUDE.md               이 파일
├── ideas/                  아직 코드로 옮기지 않았거나 보류된 아이디어 문서
│   ├── 동아리자동화_사업계획.md     (보류됨 — 아래 3번 참고)
│   └── 파일변환기_계획.md          (다음 작업 — 아래 4번 참고, Phase별 로드맵)
└── 움짤메이커/              완성된 프로젝트 #1 (아래 3번 참고)
    ├── README.md            프로젝트별 설명 + 로컬실행/배포 방법
    ├── index.html / privacy.html / contact.html / robots.txt / sitemap.xml
    └── assets/ (style.css, app.js, js/gif.js, js/gif.worker.js)
```

**컨벤션**: 새 프로젝트는 루트에 새 폴더로 추가하고, 루트 `README.md`의 프로젝트 목록 표에 한 줄 추가. 각 프로젝트 폴더는 자체 `README.md`를 가지며 최소한 다음을 포함: 무엇을 하는 도구인지, 로컬 실행/테스트 방법, 배포 방법, 알려진 한계. 아직 구현 전이거나 보류된 아이디어는 `ideas/`에만 markdown으로 남기고, 실제로 만들기로 정하면 그때 프로젝트 폴더로 옮김.

## 3. 완료된 프로젝트 — 움짤메이커

영상을 업로드해서 구간을 골라 GIF로 변환하는 정적 웹앱. **서버 없이 브라우저 안에서만 처리**(영상이 서버로 전송되지 않음).

- 기술: Vanilla HTML/CSS/JS + `gif.js`(GIF 인코딩, Web Worker 사용) + Canvas로 video 프레임 캡처
- 상태: 코드 완성, 로컬 동작 검증 완료. **아직 Cloudflare Pages에 배포는 안 함**
- 다음 행동: 한가할 때 `움짤메이커/README.md`의 배포 가이드대로 Cloudflare Pages에 올리고 애드센스 신청
- 동아리 자동화(회비·출석 관리 SaaS) 아이디어는 검토했지만 "실용성이 떨어진다"는 판단으로 보류, 대신 파일 변환기 방향으로 전환함

## 4. 다음 작업 — 파일변환기 Phase 1 (지금 바로 시작할 것)

전체 로드맵은 `ideas/파일변환기_계획.md`에 Phase 1~4로 정리되어 있음 (Phase 3 HWP, Phase 4 PPTX/서버 필요 부분은 나중 단계). **지금 할 일은 Phase 1만.**

### 목표
이미지 ↔ PDF 변환, PDF 합치기, PDF 분할을 클라이언트사이드(서버비 0원)로 처리하는 정적 웹앱.

### 새 폴더
`파일변환기/` — 루트에 새로 생성 (움짤메이커와 같은 레벨)

### 기능 (전부 단일 페이지에서, 탭이나 섹션으로 구분)
1. 이미지(JPG/PNG) → PDF: 여러 장 업로드 시 한 PDF에 페이지별로 들어가도록
2. PDF → 이미지: PDF 업로드 시 각 페이지를 PNG로 추출/다운로드
3. PDF 합치기: 여러 PDF 업로드 → 순서 조정(드래그 가능하면 좋음, 필수는 아님) → 합쳐서 다운로드
4. PDF 분할: PDF 업로드 → 페이지 범위 지정 → 분할해서 다운로드

### 라이브러리 (확정)
- [`pdf-lib`](https://github.com/Hopding/pdf-lib): PDF 생성/합치기/분할 (이미지 삽입, 페이지 추출 등)
- [`pdf.js`](https://mozilla.github.io/pdf.js/) (`pdfjs-dist`): PDF → 이미지 렌더링(페이지를 canvas에 그려서 PNG로 추출할 때 필요)
- 둘 다 npm 패키지를 받아서 `assets/js/`에 dist 파일을 복사해 쓰는 방식 (움짤메이커에서 gif.js 받았던 것과 동일한 패턴: `npm install pdf-lib pdfjs-dist` → dist 파일 복사)

### 참고할 기존 패턴 (움짤메이커에서 그대로 가져올 것)
- `index.html` 구조: 업로드 영역 → 옵션 컨트롤 → 진행률 표시 → 결과+다운로드 링크 (움짤메이커 `index.html` 참고)
- `privacy.html`, `contact.html`, `robots.txt`, `sitemap.xml` — 애드센스 승인용, 움짤메이커 파일을 거의 그대로 복사해서 서비스명만 바꾸면 됨
- 모든 처리는 클라이언트사이드, 파일은 서버로 전송 안 됨 — 이 문구를 메인 페이지와 privacy.html에 명시 (차별점/마케팅 포인트)
- README.md에 로컬 테스트 방법(`python3 -m http.server`) + Cloudflare Pages 배포 방법(GitHub 연동 또는 드래그앤드롭) 포함

### 완료 기준 (이 정도면 Phase 1 끝)
- [ ] 이미지 여러 장 → 하나의 PDF로 합쳐서 다운로드 가능
- [ ] PDF → 페이지별 PNG 다운로드 가능
- [ ] PDF 여러 개 → 순서대로 합쳐서 다운로드 가능
- [ ] PDF → 지정 범위로 분할해서 다운로드 가능
- [ ] privacy.html / contact.html / robots.txt / sitemap.xml 존재
- [ ] 로컬에서 `python3 -m http.server`로 직접 4가지 기능 다 테스트해봄
- [ ] README.md에 배포 가이드 작성
- [ ] git commit (push는 사용자가 직접, 5번 참고)

## 5. Git / 배포

- 로컬에 git 저장소 있음, `origin` = `https://github.com/mydannykim/all_things.git`, 브랜치 `main`
- 현재까지 커밋 2개 (`13e91bb`, `24bfe9b`)
- **push는 사용자가 본인 터미널에서 직접**: `git push -u origin main` (이미 한 번 했으면 `git push`만). 인증은 Personal Access Token 필요(GitHub이 비밀번호 push 막음, 2021년부터)
- Cloudflare Pages 배포: 각 프로젝트 폴더의 README.md에 GitHub 연동/드래그앤드롭 두 가지 방법 적어둠

## 6. 기술적 기본 방향 (전체 공통 원칙)

- 가능하면 서버 비용이 들지 않는 구조를 우선 시도: 정적 사이트 + 클라이언트사이드 처리, 또는 Supabase/Vercel/Cloudflare 무료 티어
- 배포는 기본적으로 Cloudflare Pages (GitHub 연동 시 push할 때마다 자동 배포)
- 결제/회원 기능처럼 사업자등록·법적 요건이 걸리는 부분은 MVP 단계에서 최대한 피하고, 수요 검증 이후 검토
- 광고 수익화(애드센스 등)를 고려하는 프로젝트는 개인정보처리방침/문의 페이지를 기본 포함 (승인 요건)
- 새 기능을 한 번에 만들지 말고 검증 가능한 가장 작은 단위(단일 기능)부터 배포
- "완벽하게 된다"고 과장하지 말 것 — 특히 DOCX/HWP 변환처럼 서식이 깨질 수 있는 기능은 한계를 명시

## 7. 수익화 공통 방향

- 애드센스(트래픽 기반) — SEO 키워드 예: "PDF 합치기", "이미지 PDF 변환", "움짤 만들기" 등
- 차별점: "파일/영상이 서버에 업로드되지 않음" (프라이버시) — 클라이언트사이드 처리 프로젝트의 공통 마케팅 포인트
- Freemium 가능성: 무료는 파일 크기/개수 제한, 유료는 제한 해제 + 광고 제거
- 서버가 필요해지는 단계(파일변환기 Phase 4 등)부터는 실제 처리 비용이 생기므로 구독/크레딧 모델 검토 필요
