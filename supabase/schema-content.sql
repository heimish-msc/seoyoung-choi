-- =========================================================
-- 영상·연락처·소개 글·목록·사진 편집용 테이블 + 사진 저장소
-- schema.sql 을 먼저 실행한 뒤(is_admin 함수 필요),
-- Supabase 대시보드 → SQL Editor 에 전체를 붙여넣고 Run 하세요. (한 번만)
-- =========================================================

-- 1) 섹션별 콘텐츠 (key: videos / home / bio / lists / contact / photos)
create table if not exists public.site_content (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

drop policy if exists "site_content: anyone can read" on public.site_content;
drop policy if exists "site_content: admins can insert" on public.site_content;
drop policy if exists "site_content: admins can update" on public.site_content;
drop policy if exists "site_content: admins can delete" on public.site_content;

create policy "site_content: anyone can read"   on public.site_content for select using (true);
create policy "site_content: admins can insert" on public.site_content for insert to authenticated with check (public.is_admin());
create policy "site_content: admins can update" on public.site_content for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "site_content: admins can delete" on public.site_content for delete to authenticated using (public.is_admin());

-- 2) 사진 저장소 — 누구나 볼 수 있고, 관리자만 올리고 지울 수 있음
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do update set public = true;

drop policy if exists "site-images: admins can upload" on storage.objects;
drop policy if exists "site-images: admins can update" on storage.objects;
drop policy if exists "site-images: admins can delete" on storage.objects;

create policy "site-images: admins can upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'site-images' and public.is_admin());
create policy "site-images: admins can update" on storage.objects for update to authenticated
  using (bucket_id = 'site-images' and public.is_admin()) with check (bucket_id = 'site-images' and public.is_admin());
create policy "site-images: admins can delete" on storage.objects for delete to authenticated
  using (bucket_id = 'site-images' and public.is_admin());
