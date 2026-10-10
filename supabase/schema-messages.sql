-- =========================================================
-- Contact 페이지 문의 저장
-- schema.sql 을 먼저 실행한 뒤(is_admin 함수 필요),
-- Supabase 대시보드 → SQL Editor 에 전체를 붙여넣고 Run 하세요. (한 번만)
-- =========================================================

create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 100),
  email      text not null check (char_length(email) between 3 and 200 and email like '%@%'),
  subject    text check (subject is null or char_length(subject) <= 200),
  message    text not null check (char_length(message) between 1 and 5000),
  lang       text check (lang is null or lang in ('ko', 'en', 'fr')),
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

drop policy if exists "messages: anyone can send" on public.messages;
drop policy if exists "messages: admins can read" on public.messages;
drop policy if exists "messages: admins can delete" on public.messages;

-- 방문자는 보내기만 가능 (다른 사람의 문의는 읽을 수 없음)
create policy "messages: anyone can send"   on public.messages for insert to anon, authenticated with check (true);
-- 관리자만 읽고 지울 수 있음
create policy "messages: admins can read"   on public.messages for select to authenticated using (public.is_admin());
create policy "messages: admins can delete" on public.messages for delete to authenticated using (public.is_admin());
