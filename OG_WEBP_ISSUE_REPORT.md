# OG WebP 배포 이슈 분석 보고서

**작성일**: 2026-03-12
**상태**: 원인 분석 완료, 수정 필요

---

## 1. 현상

- Netlify Clear cache and deploy 5회 실행 후에도 홈페이지에서 PNG로 이미지 다운로드됨
- 다른 기사 이미지는 정상적으로 WebP로 제공됨
- fallback OG 이미지만 PNG로 인식됨

### 사용자 테스트 결과 (2026-03-12 확인)

- **이미지 → 포토에 바로 저장**: PNG로 저장됨
- **이미지 → 새로 열기**: WebP로 표시됨

이 동작이 MIME type 불일치를 100% 증명함:
- 브라우저가 URL 확장자(`.png`)와 `Content-Type: image/png` 헤더를 보고 저장 시 PNG로 분류
- 하지만 실제 바이너리를 디코딩하면 WebP로 인식
- 즉, **파일 내용은 이미 WebP이나 전달 방식(MIME type)이 PNG**

---

## 2. 코드 상태 (이상 없음)

| 파일 | 값 | 상태 |
|------|---|------|
| `src/lib/articles.ts:45` | `FALLBACK_IMAGE = "...webp"` | ✅ WebP |
| `src/components/SafeImage.tsx:3` | `FALLBACK = "/...webp"` | ✅ WebP |
| `src/app/layout.tsx:64,76` | `openGraph/twitter images` | ✅ WebP |
| `src/app/news/[slug]/page.tsx:25` | `og fallback` | ✅ WebP |
| `src/app/digest/page.tsx:33` | `og images` | ✅ WebP |
| `src/app/api/og-image/route.ts:3` | `FALLBACK_URL` | ✅ WebP |

**결론: 코드에 `.png` 직접 참조 없음.**

모든 컴포넌트(HeadlineSection, CategorySection, HomeContent)가 SafeImage를 통해 이미지를 렌더링하며, SafeImage fallback도 `.webp`로 설정됨.

---

## 3. 근본 원인: 2가지

### 원인 A: `.png` 파일이 WebP 내용으로 덮어써졌으나, MIME type이 잘못됨

```
$ file public/Headlines_Fazr_OG_image.png
RIFF (little-endian) data, Web/P image, VP8 encoding, 1200x630
```

`.png` 파일의 **실제 바이너리 내용은 WebP**이지만, Netlify는 파일 확장자(`.png`)를 기반으로 HTTP 응답 헤더를 설정함:

```
Content-Type: image/png   ← Netlify가 확장자 기반으로 설정
실제 내용: WebP 바이너리   ← 파일 내용은 WebP
```

**결과:**
- 브라우저가 `Content-Type: image/png` 헤더를 신뢰
- 다운로드 시 `.png`로 저장
- PageSpeed도 PNG로 인식
- 파일 크기는 105KB (실제로 작음)이지만, PNG로 분류됨

### 원인 B: DB에 저장된 `image_url` 값

`articles.ts:63` 로직:
```typescript
thumbnail: article.image_url || FALLBACK_IMAGE
```

- `article.image_url`이 `null` → `FALLBACK_IMAGE` (webp) 사용 ✅
- `article.image_url`이 외부 PNG URL → 그대로 PNG 사용 (이건 정상 동작)
- `article.image_url`이 **이전 PNG fallback URL로 저장**된 경우 → FALLBACK_IMAGE 우회 ❌

이전에 ingest 시점에 `image_url`이 없는 기사에 fallback PNG URL이 DB에 직접 저장되었을 가능성 있음.

---

## 4. 해결 방안

### 방안 1: `.png` 파일을 실제 PNG로 복원 (원상복구) + WebP만 사용

**현재 문제**: `.png` 확장자에 WebP 바이너리를 넣으면 MIME type 불일치 발생

**해결**:
1. `public/Headlines_Fazr_OG_image.png` → 원본 PNG 복원 (또는 삭제)
2. 코드에서는 이미 모두 `.webp` 참조 → 정상 동작
3. Netlify `_headers` 파일로 WebP 파일에 올바른 Content-Type 보장

### 방안 2: Netlify `_headers`로 MIME type 강제 지정

```
/Headlines_Fazr_OG_image.png
  Content-Type: image/webp
```

`.png` URL로 요청해도 `Content-Type: image/webp`로 응답하도록 설정.

### 방안 3 (권장): 원본 PNG를 최적화된 실제 PNG로 교체

WebP 바이너리를 `.png` 확장자로 제공하는 것은 비표준.
대신:
1. `.webp` 파일을 코드에서 직접 사용 (이미 완료)
2. `.png` 파일은 원본 PNG를 유지하되, 최적화된 버전으로 교체 (pngquant 등)
3. `.png`는 OG 태그 미지원 플랫폼 호환용으로만 유지

---

## 5. DB 확인 필요 사항

Supabase에서 다음 쿼리로 확인 필요:

```sql
SELECT id, title, image_url
FROM articles
WHERE image_url LIKE '%Headlines_Fazr_OG_image%'
LIMIT 20;
```

이 쿼리로 DB에 fallback 이미지가 `image_url`로 직접 저장된 기사가 있는지 확인.

---

## 6. 최종 정리

| 항목 | 상태 |
|------|------|
| 코드 PNG 참조 | ❌ 없음 (모두 .webp) |
| `.png` 파일 내용 | WebP 바이너리 (105KB) |
| `.png` MIME type | `image/png` (Netlify 확장자 기반) |
| 브라우저 인식 | PNG (Content-Type 헤더 기반) |
| PageSpeed 인식 | PNG (Content-Type 헤더 기반) |
| 실제 전송 크기 | 105KB (2.1MB 대비 95% 감소) |

**핵심**: 파일 크기는 이미 줄었지만(105KB), MIME type 불일치로 인해 브라우저/PageSpeed가 PNG로 분류함. Netlify `_headers` 설정 또는 `.png` 파일 원복이 필요함.

---

## 7. 권장 다음 액션

1. **즉시**: Netlify `_headers` 또는 `netlify.toml`에 `.png` → `image/webp` Content-Type 오버라이드 추가
2. **확인**: Supabase DB에서 `image_url`에 PNG fallback이 저장된 기사 확인
3. **정리**: `.png` 파일을 원본 최적화 PNG로 복원하고, 코드는 `.webp`만 참조하도록 유지
