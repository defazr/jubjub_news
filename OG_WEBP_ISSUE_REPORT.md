# OG WebP 배포 이슈 분석 보고서

**작성일**: 2026-03-12
**상태**: ✅ 해결 완료 — 문제 없음 확인

---

## 1. 현상 (초기 보고)

- Netlify Clear cache and deploy 5회 실행 후에도 홈페이지에서 PNG로 이미지 다운로드됨
- 다른 기사 이미지는 정상적으로 WebP로 제공됨
- fallback OG 이미지만 PNG로 인식됨

### 사용자 테스트 결과 (2026-03-12 확인)

- **이미지 → 포토에 바로 저장**: PNG로 저장됨
- **이미지 → 새로 열기**: WebP로 표시됨

---

## 2. 최종 원인: iOS Photos 자동 변환

**이 현상은 버그가 아니었음.**

iOS Safari에서 이미지를 Photos에 저장할 때, iOS가 WebP를 자동으로 PNG로 변환하여 저장함. 이것은 Apple의 의도된 동작임.

| 동작 | 결과 | 이유 |
|------|------|------|
| 브라우저에서 렌더링 | WebP | 브라우저가 WebP 디코딩 |
| 이미지 새로 열기 | WebP | 원본 URL 그대로 로드 |
| Photos에 저장 | PNG | iOS가 호환성을 위해 자동 변환 |

즉, 서버는 정상적으로 WebP를 전송하고 있었으나, iOS Photos 저장 과정에서 WebP → PNG 변환이 발생하여 PNG로 오인한 것.

---

## 3. 코드 상태 (이상 없음)

| 파일 | 값 | 상태 |
|------|---|------|
| `src/lib/articles.ts:45` | `FALLBACK_IMAGE = "...webp"` | ✅ WebP |
| `src/components/SafeImage.tsx:3` | `FALLBACK = "/...webp"` | ✅ WebP |
| `src/app/layout.tsx:64,76` | `openGraph/twitter images` | ✅ WebP |
| `src/app/news/[slug]/page.tsx:25` | `og fallback` | ✅ WebP |
| `src/app/digest/page.tsx:33` | `og images` | ✅ WebP |
| `src/app/api/og-image/route.ts:3` | `FALLBACK_URL` | ✅ WebP |

**코드에 `.png` 직접 참조 없음. 모든 경로 WebP 정상.**

---

## 4. 수행한 작업 및 결과

### 작업 1: articles.ts FALLBACK_IMAGE 변경
- **변경**: `.png` → `.webp`
- **결과**: ✅ 정상 — thumbnail 없는 기사가 WebP fallback 사용

### 작업 2: .png 파일 복원 (pngquant 최적화)
- **이전**: `.png` 파일이 WebP 바이너리로 덮어써진 비표준 상태
- **복원**: `dwebp` → `pngquant --quality=70-85`로 진짜 PNG 생성
- **결과**: ✅ `.png` = 진짜 PNG (303KB), `.webp` = WebP (105KB)

### 최종 public 폴더 상태

```
public/
 ├ Headlines_Fazr_OG_image.webp   105KB  ← 사이트 fallback (코드 사용)
 └ Headlines_Fazr_OG_image.png    303KB  ← OG crawler 호환용 (진짜 PNG)
```

---

## 5. 이미지 크기 변화

| 시점 | .png | .webp | 코드 참조 |
|------|------|-------|----------|
| 최초 | 2.1MB (원본) | 없음 | .png |
| WebP 추가 후 | 2.1MB | 105KB | .webp |
| PNG 덮어쓰기 (실수) | 105KB (WebP 바이너리) | 105KB | .webp |
| **최종 (현재)** | **303KB (진짜 PNG)** | **105KB** | **.webp** |

**성능 개선**: 사이트 fallback 2.1MB → 105KB (95% 감소)

---

## 6. 교훈

1. **iOS Photos의 WebP → PNG 자동 변환**은 서버 문제가 아닌 클라이언트 동작
2. 파일 확장자와 실제 바이너리 포맷이 불일치하면 MIME type 문제 발생 가능 — 확장자는 반드시 실제 포맷과 일치시킬 것
3. 이미지 디버깅 시 다운로드 파일이 아닌 **Network 탭의 Content-Type 헤더**를 확인해야 정확

---

## 7. 현재 상태 요약

| 항목 | 상태 |
|------|------|
| 코드 PNG 참조 | ❌ 없음 (모두 .webp) |
| `.png` 파일 | ✅ 진짜 PNG (303KB, pngquant) |
| `.webp` 파일 | ✅ WebP (105KB) |
| 사이트 fallback | ✅ WebP 사용 |
| OG/crawler 호환 | ✅ 진짜 PNG 제공 |
| MIME type | ✅ 정상 (확장자 = 실제 포맷) |
| 성능 개선 | ✅ 2.1MB → 105KB |

**결론: 문제 없음. WebP 전환 완료. 배포 정상.**
