# 파일변환기 개발 로그

## 완료 요약 (세션 1~3, 2026-06-23~24)

- **Phase 1**: 이미지→PDF, PDF→이미지, PDF 합치기, PDF 분할 (`pdf-lib` + `pdfjs-dist`)
- **Phase 2**: DOCX→PDF (`mammoth.js` + `html2pdf.js`). 표/복잡 서식 깨짐 → UI 경고 명시
- **Phase 3**: HWP→PDF (`@ohah/hwpjs` WASM). 핵심 버그: `.hcD/.hcI`가 크기 없어 html2canvas 백지 → `width:210mm; height:297mm` 강제 부여로 해결. COOP/COEP 필요 → `_headers` 적용
- 배포: Cloudflare Pages (GitHub 연동) — `https://all-things-4ch.pages.dev/`
- 애드센스 필수 파일: `privacy.html`, `contact.html` 추가

---

## 세션 4 — 2026-06-25

### 한 일

1. **Cloudflare Workers → Pages 이전**
   - 기존 URL `change-file.mydannykim.workers.dev` (계정명 노출) → `all-things-4ch.pages.dev` 로 변경
   - 전체 MD/XML 파일 URL 일괄 교체

2. **sitemap.xml 도메인 확정**
   - `REPLACE-WITH-YOUR-DOMAIN` → `https://all-things-4ch.pages.dev/` 교체

3. **Google Search Console 등록 완료**
   - 소유권 확인 메타태그 `index.html` `<head>`에 추가
   - `sitemap.xml` 제출 완료

---

## 다음 목표

### Phase 4 — PPTX → PDF (서버 필요)
- LibreOffice headless + Cloudflare Workers 또는 소형 VPS
- 파일 크기 제한 필수 (서버 비용 발생)
- 예상 소요: 2~4주 (서버 배포 공부 포함)

### 수익화
- 애드센스 신청 (트래픽 쌓인 후)
- SEO 키워드: "PDF 합치기", "DOCX PDF 변환", "HWP PDF 변환 무료"
