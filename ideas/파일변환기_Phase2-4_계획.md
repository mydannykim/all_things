# 파일변환기 Phase 2-4 기술 계획

목표: DOCX / HWP / PPTX ↔ PDF 변환 추가.
역방향(PDF → DOCX/HWP/PPTX)은 구조 복원이 불가능해 제외. 단방향만 구현.

---

## Phase 2 — DOCX → PDF (지금 바로 시작)

### 기술 스택
| 역할 | 라이브러리 | 로드 방식 |
|---|---|---|
| DOCX → HTML 파싱 | `mammoth.js` (mammoth.browser.min.js) | `<script src>` → `window.mammoth` |
| HTML → PDF 렌더링 | `html2pdf.js` (html2pdf.bundle.min.js) | `<script src>` → `window.html2pdf` |

### 동작 흐름
```
.docx 파일 업로드
  → mammoth.convertToHtml({ arrayBuffer })
  → HTML 문자열 생성
  → html2pdf().from(html).save()
  → PDF 다운로드
```

### 한계 (반드시 UI에 명시)
- 표, 복잡한 서식, 특수 폰트는 깨질 수 있음
- 출력 PDF는 이미지 기반(텍스트 검색 불가)
- "완벽 변환을 보장하지 않습니다" 문구 필수

### 설치 & 파일 배치
```bash
npm install mammoth html2pdf.js
# node_modules/mammoth/mammoth.browser.min.js → assets/js/mammoth.browser.min.js
# node_modules/html2pdf.js/dist/html2pdf.bundle.min.js → assets/js/html2pdf.bundle.min.js
```

### index.html 추가
- 탭: `docx2pdf`
- 패널: .docx 파일 업로드 + 변환 버튼 + 진행률 바 + 다운로드

### 예상 소요
- 반나절 ~ 1일

---

## Phase 3 — HWP → PDF (스파이크 먼저)

### 기술 스택 후보
| 라이브러리 | 특징 | 리스크 |
|---|---|---|
| `@ohah/hwpjs` | WASM 기반, 최근 업데이트 있음 | 신생, 브라우저 검증 부족 |
| `hwp.js` | 구버전, 2020 이후 유지보수 중단 | 최신 HWP 포맷 미지원 가능성 |

### 스파이크 계획 (1주)
1. `@ohah/hwpjs` npm 설치 → 브라우저에서 실제 HWP 파일 파싱 테스트
2. 파싱 결과(텍스트, 표, 이미지)를 HTML로 변환 가능한지 확인
3. 가능하면 → mammoth과 동일하게 html2pdf로 PDF 출력
4. 불가능하면 → Phase 3 보류

### 한계 (예상)
- 한글 전용 폰트(HY헤드라인M 등) 브라우저에서 렌더링 불가
- 표/그림 포함 복잡한 문서는 깨질 가능성 높음
- "기본 텍스트/단순 서식만 변환 가능" 명시 필요

### 가치
- "HWP PDF 변환 무료" 검색량 높음 — SEO 차별화 포인트 최강

### 예상 소요
- 스파이크 1주 → 가능하면 구현 1~2주

---

## Phase 4 — PPTX → PDF (서버 필요, 나중에)

### 왜 클라이언트사이드가 안 되나
- 슬라이드 레이아웃, 애니메이션, 폰트 임베딩을 브라우저에서 재현할 무료 라이브러리 없음
- 유료 SDK(Aspose, GroupDocs 등)만 존재

### 기술 스택 (서버)
| 역할 | 기술 |
|---|---|
| 변환 엔진 | LibreOffice headless (`libreoffice --headless --convert-to pdf`) |
| 서버 | Cloudflare Workers + R2 (파일 임시 저장) 또는 소형 VPS |
| 클라이언트 | multipart/form-data로 PPTX 업로드 → PDF 다운로드 |

### 학습 목표
- Cloudflare Workers / 소형 VPS 배포 경험
- Docker + LibreOffice headless 환경 구성
- 이 단계부터 서버 처리 비용 발생 → 파일 크기 제한 필수

### 예상 소요
- 서버 배포 공부 포함 2~4주

---

## 역방향 (PDF → *)은 왜 안 하나

| 방향 | 이유 |
|---|---|
| PDF → DOCX | PDF는 레이아웃 정보만 있음. 문단 구조 복원 불가. OCR도 완벽하지 않음 |
| PDF → HWP | 라이브러리 자체가 존재하지 않음 |
| PDF → PPTX | 슬라이드 구조 복원 불가. Adobe도 유료로만 제공 |

---

## 진행 상황

- [x] Phase 1: 이미지→PDF, PDF→이미지, PDF 합치기, PDF 분할
- [x] Phase 2: DOCX → PDF
- [x] Phase 3: HWP → PDF
- [ ] Phase 4: PPTX → PDF (서버)
