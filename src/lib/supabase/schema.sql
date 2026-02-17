-- ==============================================================================
-- FORDRAX CYBERAWARENESS - FINAL SCHEMA (Supabase / Postgres)
-- Fix: ensures modules has is_global and required columns BEFORE RLS/policies
-- Multi-tenant + RLS Zero Trust
-- ==============================================================================
create extension if not exists pgcrypto;
create extension if not exists citext;

-- 1) ENUMS (idempotent + compatible)
do $plpgsql$
begin
  if not exists (select 1 from pg_type where typname = 'org_role') then
    create type public.org_role as enum (
      'owner','admin','manager','employee',
      'super_admin','org_admin','org_manager','org_employee'
    );
  end if;

  begin alter type public.org_role add value if not exists 'super_admin'; exception when others then null; end;
  begin alter type public.org_role add value if not exists 'org_admin';    exception when others then null; end;
  begin alter type public.org_role add value if not exists 'org_manager';  exception when others then null; end;
  begin alter type public.org_role add value if not exists 'org_employee'; exception when others then null; end;

  begin alter type public.org_role add value if not exists 'owner';    exception when others then null; end;
  begin alter type public.org_role add value if not exists 'admin';    exception when others then null; end;
  begin alter type public.org_role add value if not exists 'manager';  exception when others then null; end;
  begin alter type public.org_role add value if not exists 'employee'; exception when others then null; end;

  if not exists (select 1 from pg_type where typname = 'difficulty_level') then
    create type public.difficulty_level as enum ('basic','medium','advanced');
  end if;

  if not exists (select 1 from pg_type where typname = 'eval_status') then
    create type public.eval_status as enum ('passed','failed');
  end if;

  if not exists (select 1 from pg_type where typname = 'user_status') then
    create type public.user_status as enum ('active','disabled');
  end if;

  if not exists (select 1 from pg_type where typname = 'org_status') then
    create type public.org_status as enum ('active','disabled');
  end if;

  if not exists (select 1 from pg_type where typname = 'question_type') then
    create type public.question_type as enum ('single_choice','multi_choice');
  end if;

  if not exists (select 1 from pg_type where typname = 'job_status') then
    create type public.job_status as enum ('queued','processing','sent','failed');
  end if;
end
$plpgsql$;

-- 2) CORE TABLES (create if not exists + extend if exists)

-- PROFILES
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email citext,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name_paternal text,
  add column if not exists last_name_maternal text,
  add column if not exists birth_date date,
  add column if not exists role public.org_role not null default 'employee',
  add column if not exists status public.user_status not null default 'active',
  add column if not exists requires_password_change boolean not null default true,
  add column if not exists mfa_required boolean not null default true;

do $plpgsql$
begin
  if not exists (select 1 from pg_constraint where conname='profiles_email_unique') then
    alter table public.profiles add constraint profiles_email_unique unique (email);
  end if;
exception when others then null;
end
$plpgsql$;

-- ORGS
create table if not exists public.orgs (
  id uuid default gen_random_uuid() primary key,
  slug text,
  display_name text,
  created_at timestamptz default now()
);

alter table public.orgs
  add column if not exists status public.org_status not null default 'active',
  add column if not exists legal_type text,
  add column if not exists rfc text,
  add column if not exists company_name text,
  add column if not exists country_code text not null default 'MX',
  add column if not exists tax_profile jsonb not null default '{}'::jsonb,
  add column if not exists difficulty_level public.difficulty_level not null default 'basic',
  add column if not exists trial_ends_at timestamptz;

do $plpgsql$
begin
  if not exists (select 1 from pg_constraint where conname='orgs_slug_unique') then
    alter table public.orgs add constraint orgs_slug_unique unique (slug);
  end if;
exception when others then null;
end
$plpgsql$;

do $plpgsql$
begin
  if not exists (select 1 from pg_constraint where conname='orgs_legal_type_check') then
    alter table public.orgs
      add constraint orgs_legal_type_check
      check (legal_type is null or legal_type in ('persona_fisica','persona_moral'));
  end if;
exception when others then null;
end
$plpgsql$;

do $plpgsql$
begin
  if not exists (select 1 from pg_constraint where conname='orgs_rfc_len_check') then
    alter table public.orgs
      add constraint orgs_rfc_len_check
      check (
        rfc is null
        or (legal_type='persona_fisica' and length(rfc)=13)
        or (legal_type='persona_moral' and length(rfc)=12)
      );
  end if;
exception when others then null;
end
$plpgsql$;

do $plpgsql$
begin
  if not exists (select 1 from pg_constraint where conname='orgs_company_name_required') then
    alter table public.orgs
      add constraint orgs_company_name_required
      check (legal_type <> 'persona_moral' or (company_name is not null and length(company_name) > 1));
  end if;
exception when others then null;
end
$plpgsql$;

-- ORG_MEMBERS (if your existing table is org_members, keep it; if it's organization_members, ignore)
create table if not exists public.org_members (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.orgs on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  role public.org_role not null default 'employee',
  is_active boolean not null default true,
  joined_at timestamptz default now(),
  unique(org_id, user_id)
);

-- MODULES (IMPORTANT: ensure is_global exists)
create table if not exists public.modules (
  id uuid default gen_random_uuid() primary key,
  title text not null
);

alter table public.modules
  add column if not exists org_id uuid references public.orgs on delete set null,
  add column if not exists slug text,
  add column if not exists description text,
  add column if not exists content_markdown text,
  add column if not exists duration_min int not null default 5,
  add column if not exists is_global boolean not null default true,
  add column if not exists created_at timestamptz default now();

-- Backfill slug if null (safe)
update public.modules
set slug = coalesce(slug, regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g'))
where slug is null;

do $plpgsql$
begin
  if not exists (select 1 from pg_constraint where conname='modules_slug_not_null') then
    alter table public.modules alter column slug set not null;
  end if;
exception when others then null;
end
$plpgsql$;

do $plpgsql$
begin
  if not exists (select 1 from pg_constraint where conname='modules_unique_scope_slug') then
    alter table public.modules add constraint modules_unique_scope_slug unique (org_id, slug);
  end if;
exception when others then null;
end
$plpgsql$;

-- LESSONS
create table if not exists public.lessons (
  id uuid default gen_random_uuid() primary key
);

alter table public.lessons
  add column if not exists module_id uuid references public.modules on delete cascade,
  add column if not exists section_key text,
  add column if not exists title text,
  add column if not exists content_markdown text,
  add column if not exists order_index int not null default 1;

do $plpgsql$
begin
  if not exists (select 1 from pg_constraint where conname='lessons_unique_module_section') then
    alter table public.lessons add constraint lessons_unique_module_section unique (module_id, section_key);
  end if;
exception when others then null;
end
$plpgsql$;

-- 3) EVALUATION ENGINE
create table if not exists public.questions (
  id uuid default gen_random_uuid() primary key,
  module_id uuid not null references public.modules(id) on delete cascade,
  difficulty public.difficulty_level not null default 'basic',
  question_type public.question_type not null default 'single_choice',
  prompt text not null,
  explanation text,
  reference_section_key text,
  created_at timestamptz not null default now()
);

create table if not exists public.question_choices (
  id uuid default gen_random_uuid() primary key,
  question_id uuid not null references public.questions(id) on delete cascade,
  label text not null,
  is_correct boolean not null default false,
  order_index int not null default 1
);

create table if not exists public.evaluations (
  id uuid default gen_random_uuid() primary key,
  org_id uuid not null references public.orgs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  difficulty public.difficulty_level not null,
  score int not null check (score between 0 and 100),
  status public.eval_status not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.evaluation_answers (
  id uuid default gen_random_uuid() primary key,
  evaluation_id uuid not null references public.evaluations(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  chosen_choice_ids uuid[] not null default '{}'::uuid[],
  is_correct boolean not null,
  created_at timestamptz not null default now()
);

create table if not exists public.module_progress (
  id uuid default gen_random_uuid() primary key,
  org_id uuid not null references public.orgs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  best_score int not null default 0,
  passed boolean not null default false,
  passed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (org_id, user_id, module_id)
);

create table if not exists public.certificates (
  id uuid default gen_random_uuid() primary key,
  org_id uuid not null references public.orgs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  evaluation_id uuid references public.evaluations(id) on delete set null,
  certificate_uuid uuid not null default gen_random_uuid(),
  issued_at timestamptz not null default now(),
  chain_text text not null,
  hash_sha256 text not null,
  pdf_path text not null default '',
  unique (org_id, user_id, module_id)
);

create table if not exists public.email_jobs (
  id uuid default gen_random_uuid() primary key,
  org_id uuid not null references public.orgs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  job_type text not null check (job_type in ('send_certificate','password_reset','welcome')),
  payload jsonb not null default '{}'::jsonb,
  status public.job_status not null default 'queued',
  attempts int not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

-- 4) HELPERS (RLS)
create or replace function public.current_org_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id
  from public.org_members
  where user_id = auth.uid() and is_active = true
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select (role = 'super_admin'::public.org_role) from public.profiles where id = auth.uid()),
    false
  )
$$;

create or replace function public.has_org_role(_org uuid, _roles public.org_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select true
  where public.is_super_admin()
  union all
  select exists(
    select 1
    from public.org_members m
    where m.user_id = auth.uid()
      and m.org_id = _org
      and m.is_active = true
      and m.role = any(_roles)
  )
$$;

create or replace function public.sha256_text(input text)
returns text
language sql
immutable
as $$
  select encode(digest(coalesce(input,''), 'sha256'), 'hex')
$$;

create or replace function public.compute_certificate_chain(
  _org uuid,
  _user uuid,
  _module uuid,
  _issued_at timestamptz,
  _cert_uuid uuid
) returns text
language sql
immutable
as $$
  select
    'FORDRAX|org='||_org::text||
    '|user='||_user::text||
    '|module='||_module::text||
    '|issued_at='||to_char(_issued_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')||
    '|cert_uuid='||_cert_uuid::text
$$;

-- 5) RLS ENABLE
alter table public.profiles enable row level security;
alter table public.orgs enable row level security;
alter table public.org_members enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.questions enable row level security;
alter table public.question_choices enable row level security;
alter table public.evaluations enable row level security;
alter table public.evaluation_answers enable row level security;
alter table public.module_progress enable row level security;
alter table public.certificates enable row level security;
alter table public.email_jobs enable row level security;

-- 6) RLS POLICIES (drop + recreate)

-- PROFILES
drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self"
on public.profiles for select
using (auth.uid() = id or public.is_super_admin());

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles for update
using (auth.uid() = id or public.is_super_admin())
with check (auth.uid() = id or public.is_super_admin());

-- ORGS
drop policy if exists "orgs_select_member" on public.orgs;
create policy "orgs_select_member"
on public.orgs for select
using (id in (select public.current_org_ids()) or public.is_super_admin());

drop policy if exists "orgs_manage_superadmin" on public.orgs;
create policy "orgs_manage_superadmin"
on public.orgs for all
using (public.is_super_admin())
with check (public.is_super_admin());

-- ORG_MEMBERS
drop policy if exists "org_members_select_member" on public.org_members;
create policy "org_members_select_member"
on public.org_members for select
using (org_id in (select public.current_org_ids()) or public.is_super_admin());

drop policy if exists "org_members_manage_admin" on public.org_members;
create policy "org_members_manage_admin"
on public.org_members for all
using (public.has_org_role(org_id, array['owner','admin','manager','org_admin','org_manager']::public.org_role[]))
with check (public.has_org_role(org_id, array['owner','admin','manager','org_admin','org_manager']::public.org_role[]));

-- MODULES
drop policy if exists "modules_select_global_or_org" on public.modules;
create policy "modules_select_global_or_org"
on public.modules for select
using (
  is_global = true
  or (org_id is not null and org_id in (select public.current_org_ids()))
  or public.is_super_admin()
);

drop policy if exists "modules_manage_admin" on public.modules;
create policy "modules_manage_admin"
on public.modules for all
using (
  public.is_super_admin()
  or (org_id is not null and public.has_org_role(org_id, array['owner','admin','org_admin']::public.org_role[]))
)
with check (
  public.is_super_admin()
  or (org_id is not null and public.has_org_role(org_id, array['owner','admin','org_admin']::public.org_role[]))
);

-- LESSONS (inherit from module access)
drop policy if exists "lessons_select_visible" on public.lessons;
create policy "lessons_select_visible"
on public.lessons for select
using (
  exists (
    select 1 from public.modules m
    where m.id = lessons.module_id
      and (
        m.is_global = true
        or (m.org_id is not null and m.org_id in (select public.current_org_ids()))
        or public.is_super_admin()
      )
  )
);

-- QUESTIONS / CHOICES (inherit module visibility)
drop policy if exists "questions_select_visible" on public.questions;
create policy "questions_select_visible"
on public.questions for select
using (
  exists (
    select 1 from public.modules m
    where m.id = questions.module_id
      and (
        m.is_global = true
        or (m.org_id is not null and m.org_id in (select public.current_org_ids()))
        or public.is_super_admin()
      )
  )
);

drop policy if exists "choices_select_visible" on public.question_choices;
create policy "choices_select_visible"
on public.question_choices for select
using (
  exists (
    select 1
    from public.questions q
    join public.modules m on m.id = q.module_id
    where q.id = question_choices.question_id
      and (
        m.is_global = true
        or (m.org_id is not null and m.org_id in (select public.current_org_ids()))
        or public.is_super_admin()
      )
  )
);

-- EVALUATIONS
drop policy if exists "evaluations_select_self_or_admin" on public.evaluations;
create policy "evaluations_select_self_or_admin"
on public.evaluations for select
using (
  user_id = auth.uid()
  or public.has_org_role(org_id, array['owner','admin','manager','org_admin','org_manager']::public.org_role[])
  or public.is_super_admin()
);

drop policy if exists "evaluations_insert_self" on public.evaluations;
create policy "evaluations_insert_self"
on public.evaluations for insert
with check (
  user_id = auth.uid()
  and org_id in (select public.current_org_ids())
);

-- ANSWERS
drop policy if exists "answers_select_self_or_admin" on public.evaluation_answers;
create policy "answers_select_self_or_admin"
on public.evaluation_answers for select
using (
  exists (
    select 1 from public.evaluations e
    where e.id = evaluation_answers.evaluation_id
      and (
        e.user_id = auth.uid()
        or public.has_org_role(e.org_id, array['owner','admin','manager','org_admin','org_manager']::public.org_role[])
        or public.is_super_admin()
      )
  )
);

drop policy if exists "answers_insert_self" on public.evaluation_answers;
create policy "answers_insert_self"
on public.evaluation_answers for insert
with check (
  exists (select 1 from public.evaluations e where e.id = evaluation_answers.evaluation_id and e.user_id = auth.uid())
);

-- PROGRESS
drop policy if exists "progress_select_self_or_admin" on public.module_progress;
create policy "progress_select_self_or_admin"
on public.module_progress for select
using (
  user_id = auth.uid()
  or public.has_org_role(org_id, array['owner','admin','manager','org_admin','org_manager']::public.org_role[])
  or public.is_super_admin()
);

-- CERTIFICATES
drop policy if exists "certs_select_self_or_admin" on public.certificates;
create policy "certs_select_self_or_admin"
on public.certificates for select
using (
  user_id = auth.uid()
  or public.has_org_role(org_id, array['owner','admin','manager','org_admin','org_manager']::public.org_role[])
  or public.is_super_admin()
);

-- EMAIL JOBS: readable only by super_admin; no client inserts
drop policy if exists "email_jobs_select_superadmin" on public.email_jobs;
create policy "email_jobs_select_superadmin"
on public.email_jobs for select
using (public.is_super_admin());

drop policy if exists "email_jobs_block_client_inserts" on public.email_jobs;
create policy "email_jobs_block_client_inserts"
on public.email_jobs for insert
with check (false);

-- 7) INDEXES
create index if not exists idx_org_members_user_active on public.org_members(user_id, is_active);
create index if not exists idx_modules_org_global on public.modules(org_id, is_global);
create index if not exists idx_lessons_module_order on public.lessons(module_id, order_index);
create index if not exists idx_questions_module_diff on public.questions(module_id, difficulty);
create index if not exists idx_evals_org_user_module on public.evaluations(org_id, user_id, module_id, completed_at desc);
create index if not exists idx_email_jobs_status on public.email_jobs(status, created_at);
