-- ============================================================
-- MERVO OPS — PHASE 1 DATABASE SCHEMA (CLEAN VERSION)
-- ============================================================

-- ========================
-- EXTENSIONS
-- ========================
create extension if not exists "uuid-ossp";

-- ========================
-- COMPANIES
-- ========================
create table companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  company_tag text not null unique,
  created_at timestamptz default now()
);

-- ========================
-- USERS (OWNERS + EMPLOYEES + CONTRACTORS)
-- ========================
create table users (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade,
  username text not null,
  master_alias text not null,
  role text not null check (role in ('owner','employee','contractor')),
  full_name text,
  created_at timestamptz default now()
);

-- Normalize usernames + alias
create unique index if not exists ux_users_master_alias on users(lower(master_alias));
create unique index if not exists ux_users_username_company on users(lower(username), company_id);

create or replace function normalize_user_alias()
returns trigger as $$
begin
  new.username := lower(new.username);
  new.master_alias := lower(new.master_alias);
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_users_normalize_alias on users;
create trigger trg_users_normalize_alias
before insert or update on users
for each row execute procedure normalize_user_alias();

-- ========================
-- JOBS
-- ========================
create table jobs (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade,
  job_name text not null,
  location jsonb,
  created_at timestamptz default now()
);

-- ========================
-- JOB INSTANCES (ASSIGNMENTS)
-- ========================
create table job_instances (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references jobs(id) on delete cascade,
  assigned_to uuid references users(id),
  scheduled_for timestamptz not null,
  status text not null check (status in ('assigned','in_progress','completed')),
  created_at timestamptz default now()
);

-- ========================
-- TIMESHEETS
-- ========================
create table timesheets (
  id uuid primary key default uuid_generate_v4(),
  job_instance_id uuid references job_instances(id) on delete cascade,
  contractor_id uuid references users(id),
  clock_in timestamptz,
  clock_out timestamptz,
  photos jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- ENABLE RLS
-- ============================================================

alter table companies enable row level security;
alter table users enable row level security;
alter table jobs enable row level security;
alter table job_instances enable row level security;
alter table timesheets enable row level security;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- ============================
-- COMPANIES RLS
-- ============================
create policy "Owners can view own company"
on companies for select
using (auth.uid() = id);

-- ============================
-- USERS RLS
-- ============================
create policy "Company users can read users"
on users for select
using (company_id = (select company_id from users where id = auth.uid()));

create policy "Owners manage users"
on users for all
using (role = 'owner' and company_id = (select company_id from users where id = auth.uid()))
with check (company_id = (select company_id from users where id = auth.uid()));

-- ============================
-- JOBS RLS
-- ============================
create policy "Company users can read jobs"
on jobs for select
using (company_id = (select company_id from users where id = auth.uid()));

create policy "Owners and employees modify jobs"
on jobs for all
using (company_id = (select company_id from users where id = auth.uid()));

-- ============================
-- JOB INSTANCES RLS
-- ============================
create policy "Assigned contractor reads job instance"
on job_instances for select
using (
  assigned_to = auth.uid()
  or job_id in (select id from jobs where company_id =
    (select company_id from users where id = auth.uid()))
);

create policy "Owners and employees modify job instances"
on job_instances for all
using (
  job_id in (select id from jobs where company_id =
    (select company_id from users where id = auth.uid()))
);

-- ============================
-- TIMESHEETS RLS
-- ============================
create policy "Contractor reads own timesheets"
on timesheets for select
using (contractor_id = auth.uid());

create policy "Owners and employees read timesheets"
on timesheets for select
using (
  job_instance_id in (
    select ji.id
    from job_instances ji
    join jobs j on ji.job_id = j.id
    where j.company_id = (select company_id from users where id = auth.uid())
  )
);

create policy "Contractor inserts/edit their timesheets"
on timesheets for all
using (contractor_id = auth.uid())
with check (contractor_id = auth.uid());
