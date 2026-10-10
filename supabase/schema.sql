-- =========================================================
-- 공연 일정 테이블 + 권한 설정
-- Supabase 대시보드 → SQL Editor 에 전체를 붙여넣고 Run 하세요. (한 번만)
-- =========================================================

-- 1) 공연 일정
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  event_date  date not null,
  start_time  text,
  title_ko    text not null,
  title_en    text,
  title_fr    text,
  program_ko  text,
  program_en  text,
  program_fr  text,
  venue_ko    text,
  venue_en    text,
  venue_fr    text,
  city_ko     text,
  city_en     text,
  city_fr     text,
  link        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2) 관리자 이메일 목록 — 여기 등록된 계정만 공연을 추가·수정·삭제할 수 있습니다.
create table if not exists public.admins (
  email text primary key
);

-- 로그인한 사용자가 관리자 목록에 있는지 확인
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where email = lower(auth.jwt() ->> 'email')
  );
$$;

-- 3) 권한 규칙 (RLS)
alter table public.events enable row level security;
alter table public.admins enable row level security;  -- 정책 없음 = 외부에서 읽기·쓰기 불가

drop policy if exists "events: anyone can read" on public.events;
drop policy if exists "events: admins can insert" on public.events;
drop policy if exists "events: admins can update" on public.events;
drop policy if exists "events: admins can delete" on public.events;

create policy "events: anyone can read"   on public.events for select using (true);
create policy "events: admins can insert" on public.events for insert to authenticated with check (public.is_admin());
create policy "events: admins can update" on public.events for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "events: admins can delete" on public.events for delete to authenticated using (public.is_admin());

-- 4) 관리자 등록 — 아래 이메일을 의뢰인 관리자 계정 이메일로 바꿔서 실행하세요.
--    (Authentication → Users 에서 만든 계정과 같은 이메일이어야 합니다)
insert into public.admins (email) values (lower('client@example.com'))
on conflict do nothing;
