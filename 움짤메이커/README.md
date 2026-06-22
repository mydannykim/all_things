# 무료 움짤(GIF) 변환기 — 배포 가이드

서버 없이 브라우저(클라이언트)에서만 영상→GIF 변환을 처리하는 정적 웹앱. 호스팅 비용 0원.

## 폴더 구조

```
움짤메이커/
├── index.html        메인 페이지 (업로드 + 변환 UI)
├── privacy.html       개인정보처리방침 (애드센스 승인 필수)
├── contact.html        문의 페이지 (애드센스 승인 필수)
├── robots.txt
├── sitemap.xml          배포 후 도메인 주소로 REPLACE-WITH-YOUR-DOMAIN 치환 필요
└── assets/
    ├── style.css
    ├── app.js           핵심 로직 (프레임 캡처 + GIF 인코딩)
    └── js/
        ├── gif.js        GIF 인코딩 라이브러리
        └── gif.worker.js  GIF 인코딩용 웹워커
```

## 1. 로컬에서 먼저 확인하기

터미널에서 이 폴더로 이동 후:

```bash
python3 -m http.server 8080
```

브라우저로 `http://localhost:8080` 접속해서 영상 업로드 → 구간 선택 → 변환 → 다운로드까지 한 번 직접 테스트해볼 것. (모바일 영상 코덱에 따라 일부 브라우저에서 video 태그가 재생 안 되는 경우가 있으니 mp4(H.264)로 먼저 테스트 추천.)

## 2. Cloudflare Pages 배포 (둘 중 하나)

### 방법 A — GitHub 연동 (추천, 이후 업데이트가 쉬움)

1. 이 폴더를 새 GitHub 저장소로 push
2. [Cloudflare 대시보드](https://dash.cloudflare.com) → Workers & Pages → Create → Pages → "Connect to Git"
3. 저장소 선택, 빌드 설정은 비워두기 (정적 파일이라 빌드 커맨드 없음, Build output directory: `/`)
4. Deploy 클릭 → 몇 분 내 `*.pages.dev` 주소로 배포 완료

### 방법 B — 드래그 앤 드롭 (가장 빠름, GitHub 없이 바로 배포)

1. Cloudflare 대시보드 → Workers & Pages → Create → Pages → "Upload assets"
2. 이 폴더 전체를 드래그해서 업로드
3. Deploy → 즉시 `*.pages.dev` 주소 발급

배포 후 무료 `pages.dev` 서브도메인으로 바로 운영 가능. 커스텀 도메인을 쓰려면 도메인 구매(연 1만원대~) 후 Cloudflare에 연결.

## 3. 배포 후 꼭 할 일

1. `sitemap.xml`의 `REPLACE-WITH-YOUR-DOMAIN`을 실제 배포 주소로 수정 후 재배포
2. [Google Search Console](https://search.google.com/search-console)에 사이트 등록 + sitemap.xml 제출
3. 직접 여러 번 사용해보면서 버그 체크 (특히 모바일 브라우저, 긴 영상 업로드 시 메모리 문제)

## 4. 애드센스 신청 전 체크리스트

- [ ] 실제로 잘 작동하는 핵심 기능이 있는가 (완료)
- [ ] 개인정보처리방침 페이지 (완료: privacy.html)
- [ ] 문의 페이지 (완료: contact.html)
- [ ] 충분한 사용 설명/콘텐츠가 있는가 — 필요시 "움짤 만드는 법" 같은 설명 섹션을 index.html에 추가하면 승인 확률이 올라감
- [ ] 일정 기간 실제 트래픽이 있는 상태에서 신청 (만든 직후 바로 신청하지 말 것)
- [ ] [google.com/adsense](https://www.google.com/adsense)에서 신청, 사이트에 발급된 코드 스니펫을 `index.html`의 `<head>`에 추가

## 5. 알아둘 점 (한계)

- 정적 사이트라 회원가입, DB 저장 같은 기능은 없음 (이번 프로�트 범위 밖)
- 영상이 길거나 고해상도면 브라우저 메모리/처리 속도 한계로 느려지거나 멈출 수 있음 → 현재 최대 10초 구간 제한 걸어둠
- GIF 인코딩(gif.js)은 멀티스레드 워커를 쓰지만 CPU 성능에 따라 변환 시간이 다름 (10초 영상 기준 보통 수초~수십초)
- 트래픽이 거의 없으면 애드센스 수익은 매우 작음 — 이건 빌드 문제가 아니라 SEO/홍보의 문제. "움짤 만들기", "GIF 변환 무료" 같은 키워드로 검색 유입을 늘리는 게 핵심 과제.

## 다음 개선 아이디어 (여유 있을 때)

- 워터마크 없음/속도 등 차별점을 메인 화면에 명시
- 같은 영상에서 여러 구간을 한 번에 GIF로 뽑는 기능
- 다크모드 토글, 결과 GIF 용량 표시
