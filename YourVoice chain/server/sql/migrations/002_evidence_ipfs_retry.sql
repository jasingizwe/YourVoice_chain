alter table evidence add column if not exists ipfs_status text default 'pending';
alter table evidence add column if not exists ipfs_attempts int default 0;
alter table evidence add column if not exists ipfs_last_error text;
alter table evidence add column if not exists ipfs_last_attempt_at timestamptz;
alter table evidence add column if not exists local_path text;

create index if not exists evidence_ipfs_status_idx on evidence (ipfs_status);
