create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('survivor', 'authority', 'admin')) default 'survivor',
  wallet_address text,
  created_at timestamptz not null default now()
);

alter table users add column if not exists wallet_address text;

create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  survivor_id uuid not null references users(id) on delete cascade,
  title text not null,
  description text not null,
  incident_date date,
  status text not null check (status in ('pending', 'in_progress', 'closed')) default 'pending',
  onchain_case_id text,
  onchain_case_tx text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table cases add column if not exists onchain_case_id text;
alter table cases add column if not exists onchain_case_tx text;

create table if not exists evidence (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  survivor_id uuid not null references users(id) on delete cascade,
  evidence_type text not null default 'document',
  file_name text,
  ipfs_hash text,
  blockchain_tx text,
  uploaded_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references users(id) on delete set null
);

alter table evidence add column if not exists deleted_at timestamptz;
alter table evidence add column if not exists deleted_by uuid references users(id) on delete set null;

create table if not exists access_grants (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  authority_id uuid not null references users(id) on delete cascade,
  granted_by uuid not null references users(id) on delete cascade,
  authority_wallet_address text,
  grant_tx text,
  revoke_tx text,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz
);

alter table access_grants add column if not exists authority_wallet_address text;
alter table access_grants add column if not exists grant_tx text;
alter table access_grants add column if not exists revoke_tx text;

create table if not exists case_notes (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  author_id uuid not null references users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  case_id uuid references cases(id) on delete set null,
  action text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

create table if not exists password_resets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references users(id) on delete cascade,
  sender_user_id uuid references users(id) on delete set null,
  case_id uuid references cases(id) on delete cascade,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
