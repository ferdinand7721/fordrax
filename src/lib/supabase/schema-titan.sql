-- ==============================================================================
-- FORDRAX CYBERAWARENESS - TITAN MASTER SCHEMA (V2)
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- 2. ENUMS
create type public.org_role as enum ('super_admin', 'org_admin', 'org_manager', 'org_employee');
create type public.difficulty_level as enum ('basic', 'medium', 'advanced');
create type public.eval_status as enum ('passed', 'failed');
create type public.user_status as enum ('active', 'disabled');
create type public.org_status as enum ('active', 'disabled');
create type public.question_type as enum ('single_choice', 'multi_choice');
create type public.job_status as enum ('queued', 'processing', 'sent', 'failed');

-- 3. CORE TABLES

-- PROFILES (Extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email citext unique,
  first_name text,
  last_name_paternal text,
  last_name_maternal text,
  birth_date date,
  role org_role NOT NULL default 'org_employee',
  status user_status default 'active',
  requires_password_change boolean default true,
  mfa_required boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ORGS (Tenants)
create table public.orgs (
  id uuid default gen_random_uuid() primary key,
  status org_status default 'active',
  legal_type text check (legal_type in ('persona_fisica', 'persona_moral')),
  rfc text not null,
  company_name text, -- Required if persona_moral
  display_name text not null,
  slug text unique not null,
  country_code text not null default 'MX',
  tax_profile jsonb not null default '{}'::jsonb,
  difficulty_level difficulty_level not null default 'basic',
  trial_ends_at timestamptz,
  created_at timestamptz default now()
);

-- ORG MEMBERS (Many-to-Many)
create table public.org_members (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.orgs on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  role org_role default 'org_employee',
  is_active boolean default true,
  joined_at timestamptz default now(),
  unique(org_id, user_id)
);

-- CONTENT TABLES (Studio)

-- MODULES
create table public.modules (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.orgs on delete set null, -- Null = Global
  title text not null,
  slug text not null,
  description text,
  content_markdown text not null, -- Full content fallback
  duration_min int default 5,
  is_global boolean default true,
  visibility text default 'global_template', -- 'global_template', 'private'
  created_at timestamptz default now(),
  unique(org_id, slug)
);

-- LESSONS (Deep Content)
create table public.lessons (
  id uuid default gen_random_uuid() primary key,
  module_id uuid references public.modules on delete cascade,
  section_key text not null, -- 'teoria', 'practica', 'tecnico', 'como', 'cuando'
  title text not null,
  content_markdown text not null,
  order_index int not null,
  unique(module_id, section_key)
);

-- EVALUATION ENGINE

-- QUESTIONS
create table public.questions (
  id uuid default gen_random_uuid() primary key,
  module_id uuid references public.modules on delete cascade,
  difficulty difficulty_level not null,
  question_type question_type not null default 'single_choice',
  prompt text not null,
  explanation text, -- Feedback
  reference_section_key text, -- Deep link anchor
  created_at timestamptz default now()
);

-- CHOICES
create table public.question_choices (
  id uuid default gen_random_uuid() primary key,
  question_id uuid references public.questions on delete cascade,
  label text not null,
  is_correct boolean default false,
  order_index int not null
);

-- EXAM ATTEMPTS (Evaluations)
create table public.evaluations (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.orgs on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  module_id uuid references public.modules on delete cascade,
  difficulty difficulty_level not null,
  score int not null check (score between 0 and 100),
  status eval_status not null,
  started_at timestamptz default now(),
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- ANSWERS LOG (For audit/review)
create table public.evaluation_answers (
  id uuid default gen_random_uuid() primary key,
  evaluation_id uuid references public.evaluations on delete cascade,
  question_id uuid references public.questions on delete cascade,
  chosen_choice_ids uuid[] not null default '{}'::uuid[],
  is_correct boolean not null,
  created_at timestamptz default now()
);

-- PROGRESS & CERTIFICATES

-- PROGRESS
create table public.module_progress (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.orgs on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  module_id uuid references public.modules on delete cascade,
  best_score int default 0,
  passed boolean default false,
  passed_at timestamptz,
  updated_at timestamptz default now(),
  unique(org_id, user_id, module_id)
);

-- CERTIFICATES
create table public.certificates (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.orgs on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  module_id uuid references public.modules on delete cascade,
  evaluation_id uuid references public.evaluations,
  certificate_uuid uuid not null default gen_random_uuid(),
  issued_at timestamptz not null default now(),
  chain_text text not null, -- "Original Chain" for verification
  hash_sha256 text not null,
  pdf_path text, -- Storage path
  unique(org_id, user_id, module_id)
);

-- ASYNC JOBS (Agents)
create table public.email_jobs (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.orgs on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  job_type text check (job_type in ('send_certificate', 'password_reset', 'welcome')),
  payload jsonb not null default '{}'::jsonb,
  status job_status default 'queued',
  attempts int default 0,
  last_error text,
  created_at timestamptz default now(),
  processed_at timestamptz
);

-- 4. RLS POLICIES (Strict Zero-Trust)

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.orgs enable row level security;
alter table public.org_members enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.questions enable row level security;
alter table public.evaluations enable row level security;
alter table public.certificates enable row level security;
alter table public.email_jobs enable row level security;

-- HELPER FUNCTIONS
create or replace function public.current_org_ids() 
returns setof uuid as $$
  select org_id from public.org_members 
  where user_id = auth.uid() and is_active = true;
$$ language sql security definer;

-- POLICIES

-- Profiles: Read own, Org Admins read members
create policy "Users read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Org Admins read members" on public.profiles for select using (
  exists (
    select 1 from public.org_members om 
    where om.user_id = auth.uid() 
    and om.role in ('super_admin', 'org_admin')
    and om.org_id in (select org_id from public.org_members where user_id = profiles.id)
  )
);

-- Orgs: Read if member
create policy "Read own orgs" on public.orgs for select using (
  id in (select public.current_org_ids())
);

-- Modules: Global or My Org
create policy "Read modules" on public.modules for select using (
  (is_global = true) or (org_id in (select public.current_org_ids()))
);

-- Lessons: Inherit module access
create policy "Read lessons" on public.lessons for select using (
  exists (select 1 from public.modules m where m.id = lessons.module_id)
);

-- Evaluations: CRUD Own
create policy "CRUD Own" on public.evaluations for all using (user_id = auth.uid());
create policy "Admins view evals" on public.evaluations for select using (
  org_id in (select public.current_org_ids()) 
  and exists (select 1 from public.org_members where user_id = auth.uid() and role in ('super_admin', 'org_admin'))
);

-- Certificates: Read Own & Admins
create policy "Read own certs" on public.certificates for select using (user_id = auth.uid());
