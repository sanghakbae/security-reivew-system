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

`.env.local`에는 Supabase 프로젝트의 URL, anon key, Google Chat 웹훅 URL을 입력합니다.

## Supabase 설정

1. 기존 prefix 없는 테이블을 이미 만들었다면 `supabase/rename_tables_to_sr.sql`을 먼저 실행합니다.
2. Supabase SQL Editor에서 `supabase/schema.sql`을 실행합니다.
3. 이어서 `supabase/seed_checklist.sql`을 실행합니다.
3. Authentication > Providers에서 Google provider를 활성화합니다.
4. Authentication > URL Configuration에 로컬 개발 주소를 등록합니다.
5. 첫 admin 사용자는 SQL Editor에서 직접 승격합니다.

```sql
update public.sr_profiles
set role = 'admin'
where email = 'admin@example.com';
```

viewer 권한도 같은 방식으로 지정할 수 있습니다.
