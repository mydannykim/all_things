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
- 움짤메이커: `gif.js` + Canvas + Web Worker
- 파일변환기: `pdf-lib` (PDF 생성/합치기/분할) + `pdfjs-dist` (PDF→이미지 렌더링)
- 배포: Cloudflare Pages (GitHub 연동, push 시 자동 배포)

## 로컬 테스트
```bash
python3 -m http.server 8080
```

## 현재 상태
- 움짤메이커/: 완성, 미배포 — Cloudflare Pages 배포 + 애드센스 신청 필요
- 파일변환기/: **개발 중** — ideas/파일변환기_계획.md 참고
