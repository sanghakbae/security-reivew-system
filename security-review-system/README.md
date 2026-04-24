# 보안성 검토 시스템

React + Vite 프론트엔드와 Supabase 백엔드로 만든 체크리스트 기반 보안성 검토 시스템입니다. 원본 엑셀의 `2. 보안성 검토 요구사항` 시트에서 61개 요구사항을 추출해 마스터 데이터와 seed SQL로 구성했습니다.

## 기능

- Google OAuth 로그인
- 역할: `viewer`, `requester`, `admin`
- requester: 신규 프로젝트 검토 작성 공간 생성, 그룹별 해당 여부 선택, 해당 그룹의 체크리스트 작성 후 admin에게 제출
- admin: 제출된 체크리스트를 기준으로 관리자 판정과 검토 의견 입력
- viewer: 전체 검토 현황 조회
- Supabase RLS 기반 권한 통제

## 실행

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local`에는 Supabase 프로젝트의 URL과 anon key를 입력합니다. Google Chat 웹훅 URL은 브라우저 번들에 넣지 않고 Supabase Edge Function secret으로 설정합니다.

## Environment Variables

배포 서비스의 Environment Variables에는 아래 값을 등록합니다.

| Key | 필수 | 설명 |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | 예 | Supabase 프로젝트 URL입니다. 예: `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | 예 | Supabase Project Settings > API의 anon public key입니다. |
| `SECURITY_REVIEW_GOOGLE_CHAT_WEBHOOK_URL` | 선택 | Supabase Edge Function secret으로 설정합니다. 검토 요청 제출 시 Google Chat으로 알림을 보내는 이 앱 전용 웹훅 전체 URL입니다. |

주의사항:

- `VITE_` prefix가 붙은 값은 브라우저 번들에 포함됩니다. Supabase `service_role` key는 절대 넣지 마세요.
- `SECURITY_REVIEW_GOOGLE_CHAT_WEBHOOK_URL`은 저장소에 커밋하지 말고 Supabase Edge Function secret에만 넣습니다.
- `.env.local`, `dist`, `node_modules`, Supabase 로컬 메타 파일은 `.gitignore`로 제외되어 있습니다.

## 배포 설정

Vite 정적 사이트 기준 배포 설정은 아래와 같습니다.

```text
Build command: npm run build
Publish directory: dist
```

GitHub Pages custom domain은 `srs.sanghak.kr`입니다. 이 값은 `public/CNAME`에 들어 있으며 빌드 시 `dist/CNAME`으로 복사됩니다.

배포 도메인이 정해지면 Supabase에서 다음 설정도 갱신합니다.

1. Authentication > URL Configuration > Site URL에 배포 URL을 입력합니다.
2. Authentication > URL Configuration > Redirect URLs에 배포 URL을 추가합니다.
3. Google OAuth Provider를 사용하는 경우 Google Cloud Console의 승인된 redirect URI도 Supabase가 안내하는 callback URL로 등록합니다.

## Supabase 설정

1. 기존 prefix 없는 테이블을 이미 만들었다면 `supabase/rename_tables_to_sr.sql`을 먼저 실행합니다.
2. Supabase SQL Editor에서 `supabase/schema.sql`을 실행합니다.
3. 이어서 `supabase/seed_checklist.sql`을 실행합니다.
4. Authentication > Providers에서 Google provider를 활성화합니다.
5. Authentication > URL Configuration에 로컬 개발 주소와 배포 주소를 등록합니다.
6. 첫 admin 사용자는 SQL Editor에서 직접 승격합니다.
7. Google Chat 알림을 사용할 경우 Edge Function을 배포하고 secret을 설정합니다.

```bash
supabase functions deploy security-review-google-chat-webhook
supabase secrets set SECURITY_REVIEW_GOOGLE_CHAT_WEBHOOK_URL='https://chat.googleapis.com/v1/spaces/...'
```

```sql
update public.sr_profiles
set role = 'admin'
where email = 'admin@example.com';
```

viewer 권한도 같은 방식으로 지정할 수 있습니다.
