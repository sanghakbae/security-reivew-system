create extension if not exists pgcrypto;

do $$
begin
  create type public.app_role as enum ('viewer', 'requester', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.system_type as enum ('personal', 'non_personal', 'both');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.review_status as enum ('draft', 'submitted', 'in_review', 'completed', 'rejected');
exception
  when duplicate_object then null;
end $$;

alter type public.review_status add value if not exists 'draft';

do $$
begin
  create type public.review_result as enum ('pass', 'fail', 'na');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.sr_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role public.app_role not null default 'requester',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sr_security_requirements (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  category text not null,
  title text not null,
  requirement text not null,
  description text not null default '',
  applies_personal boolean not null default true,
  applies_non_personal boolean not null default true,
  sort_order integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.sr_reviews (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.sr_profiles(id) on delete cascade,
  admin_id uuid references public.sr_profiles(id) on delete set null,
  system_name text not null,
  system_type public.system_type not null default 'both',
  requester_department text,
  project_owner text,
  development_type text,
  service_scope text,
  launch_date date,
  summary text not null,
  status public.review_status not null default 'draft',
  due_date date,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sr_reviews
  add column if not exists requester_department text,
  add column if not exists project_owner text,
  add column if not exists development_type text,
  add column if not exists service_scope text,
  add column if not exists launch_date date,
  add column if not exists due_date date,
  add column if not exists reviewed_at timestamptz;

create table if not exists public.sr_review_groups (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.sr_reviews(id) on delete cascade,
  category text not null,
  is_applicable boolean,
  skip_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (review_id, category)
);

alter table public.sr_review_groups
  alter column is_applicable drop not null,
  alter column is_applicable drop default;

create table if not exists public.sr_review_items (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.sr_reviews(id) on delete cascade,
  requirement_id uuid not null references public.sr_security_requirements(id) on delete restrict,
  result public.review_result,
  non_compliance_reason text,
  action_due_date date,
  reviewer_result public.review_result,
  reviewer_comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (review_id, requirement_id)
);

alter table public.sr_review_items
  add column if not exists reviewer_result public.review_result,
  add column if not exists reviewer_comment text;

create index if not exists reviews_requester_id_idx on public.sr_reviews(requester_id);
create index if not exists reviews_status_idx on public.sr_reviews(status);
create index if not exists review_items_review_id_idx on public.sr_review_items(review_id);
create index if not exists review_groups_review_id_idx on public.sr_review_groups(review_id);
create index if not exists security_requirements_sort_order_idx on public.sr_security_requirements(sort_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.sr_profiles;
create trigger profiles_set_updated_at
before update on public.sr_profiles
for each row execute function public.set_updated_at();

drop trigger if exists reviews_set_updated_at on public.sr_reviews;
create trigger reviews_set_updated_at
before update on public.sr_reviews
for each row execute function public.set_updated_at();

drop trigger if exists review_items_set_updated_at on public.sr_review_items;
create trigger review_items_set_updated_at
before update on public.sr_review_items
for each row execute function public.set_updated_at();

drop trigger if exists review_groups_set_updated_at on public.sr_review_groups;
create trigger review_groups_set_updated_at
before update on public.sr_review_groups
for each row execute function public.set_updated_at();

create or replace function public.validate_sr_review_item_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  role public.app_role;
  owner_id uuid;
  review_state public.review_status;
begin
  select public.current_user_role() into role;
  select requester_id, status into owner_id, review_state
  from public.sr_reviews
  where id = old.review_id;

  if role = 'admin' then
    if new.result is distinct from old.result
      or new.non_compliance_reason is distinct from old.non_compliance_reason
      or new.action_due_date is distinct from old.action_due_date
      or new.review_id is distinct from old.review_id
      or new.requirement_id is distinct from old.requirement_id then
      raise exception 'admins can only update reviewer fields';
    end if;
    return new;
  end if;

  if role = 'requester' and owner_id = auth.uid() and review_state in ('draft', 'rejected') then
    if new.reviewer_result is distinct from old.reviewer_result
      or new.reviewer_comment is distinct from old.reviewer_comment
      or new.review_id is distinct from old.review_id
      or new.requirement_id is distinct from old.requirement_id then
      raise exception 'requesters can only update checklist self-assessment fields';
    end if;
    return new;
  end if;

  raise exception 'not allowed to update review item';
end;
$$;

drop trigger if exists validate_sr_review_item_update on public.sr_review_items;
create trigger validate_sr_review_item_update
before update on public.sr_review_items
for each row execute function public.validate_sr_review_item_update();

create or replace function public.validate_sr_review_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  role public.app_role;
begin
  select public.current_user_role() into role;

  if role = 'admin' then
    if old.status = 'draft' then
      raise exception 'admins cannot review drafts';
    end if;

    if new.requester_id is distinct from old.requester_id
      or new.system_name is distinct from old.system_name
      or new.system_type is distinct from old.system_type
      or new.requester_department is distinct from old.requester_department
      or new.project_owner is distinct from old.project_owner
      or new.development_type is distinct from old.development_type
      or new.service_scope is distinct from old.service_scope
      or new.launch_date is distinct from old.launch_date
      or new.summary is distinct from old.summary
      or new.due_date is distinct from old.due_date then
      raise exception 'admins can only update review workflow fields';
    end if;
    return new;
  end if;

  if role = 'requester' and old.requester_id = auth.uid() and old.status in ('draft', 'rejected') then
    if new.requester_id is distinct from old.requester_id
      or new.admin_id is distinct from old.admin_id
      or new.reviewed_at is distinct from old.reviewed_at
      or new.status not in ('draft', 'submitted') then
      raise exception 'requesters can only edit drafts or submit for review';
    end if;
    return new;
  end if;

  raise exception 'not allowed to update review';
end;
$$;

drop trigger if exists validate_sr_review_update on public.sr_reviews;
create trigger validate_sr_review_update
before update on public.sr_reviews
for each row execute function public.validate_sr_review_update();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.sr_profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    'requester'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.sr_profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.sr_profiles.avatar_url);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.current_user_role()
returns public.app_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.sr_profiles where id = auth.uid();
$$;

alter table public.sr_profiles enable row level security;
alter table public.sr_security_requirements enable row level security;
alter table public.sr_reviews enable row level security;
alter table public.sr_review_items enable row level security;
alter table public.sr_review_groups enable row level security;

drop policy if exists "profiles_select_visible" on public.sr_profiles;
create policy "profiles_select_visible"
on public.sr_profiles for select
to authenticated
using (
  id = auth.uid()
  or public.current_user_role() in ('admin', 'viewer')
);

drop policy if exists "profiles_insert_self" on public.sr_profiles;
create policy "profiles_insert_self"
on public.sr_profiles for insert
to authenticated
with check (
  id = auth.uid()
  and role = 'requester'
);

drop policy if exists "profiles_admin_update" on public.sr_profiles;
create policy "profiles_admin_update"
on public.sr_profiles for update
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists "requirements_select_authenticated" on public.sr_security_requirements;
create policy "requirements_select_authenticated"
on public.sr_security_requirements for select
to authenticated
using (true);

drop policy if exists "requirements_admin_write" on public.sr_security_requirements;
create policy "requirements_admin_write"
on public.sr_security_requirements for all
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists "reviews_select_by_role" on public.sr_reviews;
create policy "reviews_select_by_role"
on public.sr_reviews for select
to authenticated
using (
  requester_id = auth.uid()
  or (status <> 'draft' and public.current_user_role() in ('admin', 'viewer'))
);

drop policy if exists "requesters_create_reviews" on public.sr_reviews;
create policy "requesters_create_reviews"
on public.sr_reviews for insert
to authenticated
with check (
  requester_id = auth.uid()
  and public.current_user_role() in ('requester', 'admin')
);

drop policy if exists "requesters_update_own_draft_reviews" on public.sr_reviews;
create policy "requesters_update_own_draft_reviews"
on public.sr_reviews for update
to authenticated
using (
  requester_id = auth.uid()
  and status in ('draft', 'rejected')
  and public.current_user_role() = 'requester'
)
with check (
  requester_id = auth.uid()
  and status in ('draft', 'submitted')
  and public.current_user_role() = 'requester'
);

drop policy if exists "admins_update_reviews" on public.sr_reviews;
create policy "admins_update_reviews"
on public.sr_reviews for update
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists "review_items_select_by_review_visibility" on public.sr_review_items;
create policy "review_items_select_by_review_visibility"
on public.sr_review_items for select
to authenticated
using (
  exists (
    select 1
    from public.sr_reviews r
    where r.id = sr_review_items.review_id
      and (
        r.requester_id = auth.uid()
        or (r.status <> 'draft' and public.current_user_role() in ('admin', 'viewer'))
      )
  )
);

drop policy if exists "review_groups_select_by_review_visibility" on public.sr_review_groups;
create policy "review_groups_select_by_review_visibility"
on public.sr_review_groups for select
to authenticated
using (
  exists (
    select 1
    from public.sr_reviews r
    where r.id = sr_review_groups.review_id
      and (
        r.requester_id = auth.uid()
        or (r.status <> 'draft' and public.current_user_role() in ('admin', 'viewer'))
      )
  )
);

drop policy if exists "requesters_create_review_groups_for_own_review" on public.sr_review_groups;
create policy "requesters_create_review_groups_for_own_review"
on public.sr_review_groups for insert
to authenticated
with check (
  exists (
    select 1
    from public.sr_reviews r
    where r.id = sr_review_groups.review_id
      and r.requester_id = auth.uid()
      and public.current_user_role() in ('requester', 'admin')
  )
);

drop policy if exists "requesters_update_own_review_groups" on public.sr_review_groups;
create policy "requesters_update_own_review_groups"
on public.sr_review_groups for update
to authenticated
using (
  exists (
    select 1
    from public.sr_reviews r
    where r.id = sr_review_groups.review_id
      and r.requester_id = auth.uid()
      and r.status in ('draft', 'rejected')
      and public.current_user_role() in ('requester', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.sr_reviews r
    where r.id = sr_review_groups.review_id
      and r.requester_id = auth.uid()
      and r.status in ('draft', 'rejected')
      and public.current_user_role() in ('requester', 'admin')
  )
);

drop policy if exists "requesters_create_review_items_for_own_review" on public.sr_review_items;
create policy "requesters_create_review_items_for_own_review"
on public.sr_review_items for insert
to authenticated
with check (
  exists (
    select 1
    from public.sr_reviews r
    where r.id = sr_review_items.review_id
      and r.requester_id = auth.uid()
      and public.current_user_role() in ('requester', 'admin')
  )
);

drop policy if exists "admins_update_review_items" on public.sr_review_items;
create policy "admins_update_review_items"
on public.sr_review_items for update
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists "requesters_update_own_review_items" on public.sr_review_items;
create policy "requesters_update_own_review_items"
on public.sr_review_items for update
to authenticated
using (
  exists (
    select 1
    from public.sr_reviews r
    where r.id = sr_review_items.review_id
      and r.requester_id = auth.uid()
      and r.status in ('draft', 'rejected')
      and public.current_user_role() in ('requester', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.sr_reviews r
    where r.id = sr_review_items.review_id
      and r.requester_id = auth.uid()
      and r.status in ('draft', 'rejected')
      and public.current_user_role() in ('requester', 'admin')
  )
);
