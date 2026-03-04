# YourVoice Backend

## Implemented

- Health check: `GET /health` (includes DB + Pinata dependency checks)
- Auth: register, login, me, forgot-password, reset-password, update wallet
- Cases: list/create/detail/update/delete
- Case notes, access grants (grant/revoke), evidence metadata
- IPFS-ready evidence uploads (Pinata if configured)
- Request throttling + auth throttling
- Stricter upload validation (mime + magic bytes for jpg/png/webp/pdf)
- Production CORS allowlist via `CORS_ALLOWLIST`
- Strong password policy on register/reset
- Evaluation metrics endpoint: `GET /api/v1/metrics/evaluation?days=30` (admin)
- Admin: overview + role update
- Audit logs: list for admin

## Run

```sh
npm install
npm run migrate
npm run dev
```

## Schema

Run `sql/schema.sql` on PostgreSQL.
