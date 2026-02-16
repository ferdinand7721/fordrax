-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- 2. ORGANIZATIONS (Tenants)
create table public.organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  domain text, -- for auto-join logic
  branding_config jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- 3. ORGANIZATION MEMBERS (RBAC)
create type app_role as enum ('owner', 'admin', 'manager', 'employee');

create table public.organization_members (
  id uuid default uuid_generate_v4() primary key,
  org_id uuid references public.organizations on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role app_role default 'employee',
  joined_at timestamp with time zone default now(),
  unique(org_id, user_id)
);

-- 4. MODULES (Content Library)
-- if org_id is NULL, it's a GLOBAL TEMPLATE available to everyone (or to be cloned)
create table public.modules (
  id uuid default uuid_generate_v4() primary key,
  org_id uuid references public.organizations on delete cascade, 
  title text not null,
  description text,
  content_markdown text,
  duration_min int default 5,
  is_global boolean default false,
  created_at timestamp with time zone default now()
);

-- 5. CAMPAIGNS (Awareness Drives)
create type campaign_status as enum ('draft', 'scheduled', 'active', 'completed', 'archived');

create table public.campaigns (
  id uuid default uuid_generate_v4() primary key,
  org_id uuid references public.organizations on delete cascade not null,
  title text not null,
  description text,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  status campaign_status default 'draft',
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default now()
);

-- Link Modules to Campaigns
create table public.campaign_modules (
  campaign_id uuid references public.campaigns on delete cascade not null,
  module_id uuid references public.modules on delete cascade not null,
  primary key (campaign_id, module_id)
);

-- 6. CAMPAIGN ASSIGNMENTS (User Progress)
create type assignment_status as enum ('pending', 'in_progress', 'completed', 'overdue');

create table public.campaign_assignments (
  id uuid default uuid_generate_v4() primary key,
  campaign_id uuid references public.campaigns on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status assignment_status default 'pending',
  progress_pct int default 0,
  completed_at timestamp with time zone,
  assigned_at timestamp with time zone default now()
);

-- 7. PHISHING SIMULATIONS
create table public.phishing_simulations (
  id uuid default uuid_generate_v4() primary key,
  org_id uuid references public.organizations on delete cascade not null,
  title text not null,
  email_template_id text, -- ID of the template used
  sender_name text,
  sender_email text,
  sent_at timestamp with time zone default now(),
  target_count int default 0
);

create type phishing_event_type as enum ('sent', 'opened', 'clicked', 'submitted_data', 'reported');

create table public.phishing_events (
  id uuid default uuid_generate_v4() primary key,
  simulation_id uuid references public.phishing_simulations on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  event_type phishing_event_type not null,
  occurred_at timestamp with time zone default now(),
  metadata jsonb default '{}'::jsonb
);

-- ENABLE RLS
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.modules enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_assignments enable row level security;
alter table public.phishing_simulations enable row level security;
alter table public.phishing_events enable row level security;

-- POLICIES (Simplified for MVP, usually involves helper functions)

-- Helper function to check if user is member of org
create or replace function public.is_org_member(org_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.organization_members
    where user_id = auth.uid() and org_id = $1
  );
$$ language sql security definer;

-- Profiles: Users can read/update their own
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Orgs: Members can view their orgs
create policy "Members can view their org" on public.organizations
  for select using (public.is_org_member(id));

-- Modules: 
-- 1. Everyone can view Global modules (is_global = true)
-- 2. Members can view modules belonging to their org
create policy "View global or org modules" on public.modules
  for select using (
    (is_global = true) or 
    (org_id is not null and public.is_org_member(org_id))
  );

-- Campaigns: Members can view campaigns in their org
create policy "View org campaigns" on public.campaigns
  for select using (public.is_org_member(org_id));

-- Assignments: Users view their own assignments
create policy "View own assignments" on public.campaign_assignments
  for select using (user_id = auth.uid());

-- TRIGGER: Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
