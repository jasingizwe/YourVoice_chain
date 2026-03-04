# API Contract (Frontend Freeze v1)

This is the backend contract for the current frontend with PostgreSQL integration.

## Auth

- `POST /api/v1/auth/register`
- body: `{ "fullName": string, "email": string, "password": string, "role": "survivor" | "authority" | "admin" }`
- response: `{ "user": { "id": string, "fullName": string, "email": string, "role": string }, "token": string }`

- `POST /api/v1/auth/login`
- body: `{ "email": string, "password": string }`
- response: `{ "user": { "id": string, "fullName": string, "email": string, "role": string }, "token": string }`

- `GET /api/v1/auth/me`
- auth: bearer token
- response: `{ "user": { "id": string, "fullName": string, "email": string, "role": string, "walletAddress": string | null } }`

- `PATCH /api/v1/auth/me/wallet`
- auth: bearer token
- body: `{ "walletAddress": string | null }`
- response: `{ "user": { ... } }`

- `POST /api/v1/auth/forgot-password`
- body: `{ "email": string }`
- response: `{ "ok": true, "resetToken"?: string }` (`resetToken` returned only in non-production mode)

- `POST /api/v1/auth/reset-password`
- body: `{ "token": string, "password": string }`
- response: `{ "ok": true }`

## Cases

- `GET /api/v1/cases`
- auth: bearer token
- response: `{ "items": Case[] }`

- `POST /api/v1/cases`
- auth: bearer token
- body: `{ "title": string, "description": string, "incidentDate": "YYYY-MM-DD" | null }`
- response: `{ "item": Case }`

- `GET /api/v1/cases/:id`
- auth: bearer token
- response: `{ "item": Case, "evidence": Evidence[], "grants": AccessGrant[], "notes": CaseNote[] }`

- `PATCH /api/v1/cases/:id`
- auth: bearer token
- body: `{ "title"?: string, "description"?: string, "incidentDate"?: string | null, "status"?: "pending" | "in_progress" | "closed" }`
- response: `{ "item": Case }`

- `PATCH /api/v1/cases/:id/onchain`
- auth: bearer token (`survivor` owner or `admin`)
- body: `{ "onchainCaseId": string, "txHash"?: string }`
- response: `{ "item": Case }`

- `DELETE /api/v1/cases/:id`
- auth: bearer token
- response: `{ "deleted": true }`

## Case Notes

- `POST /api/v1/cases/:id/notes`
- auth: bearer token
- body: `{ "content": string }`
- response: `{ "item": CaseNote }`

## Access Grants

- `POST /api/v1/cases/:id/grants`
- auth: bearer token
- body: `{ "authorityEmail": string }`
- response: `{ "item": AccessGrant }`

- `PATCH /api/v1/cases/grants/:id/revoke`
- auth: bearer token
- response: `{ "item": AccessGrant }`

- `PATCH /api/v1/cases/grants/:id/tx`
- auth: bearer token (`survivor` owner or `admin`)
- body: `{ "grantTx"?: string, "revokeTx"?: string }`
- response: `{ "item": AccessGrant }`

## Evidence (metadata)

- `POST /api/v1/cases/:id/evidence`
- auth: bearer token
- body: `multipart/form-data` with field `file`
- fallback body (dev): `{ "fileName": string, "evidenceType"?: string }`
- response: `{ "item": Evidence }`

- `PATCH /api/v1/cases/:caseId/evidence/:evidenceId/tx`
- auth: bearer token (`survivor` owner or `admin`)
- body: `{ "txHash": string }`
- response: `{ "item": Evidence }`

- `DELETE /api/v1/cases/:caseId/evidence/:evidenceId`
- auth: bearer token (`survivor` owner or `admin`)
- response: `{ "deleted": true }` (soft delete)

- `PATCH /api/v1/cases/:caseId/evidence/:evidenceId/restore`
- auth: bearer token (`survivor` owner or `admin`)
- response: `{ "item": Evidence }`

## Admin

- `GET /api/v1/admin/overview`
- auth: bearer token (admin)
- response: `{ "users": User[], "caseCount": number }`

- `PATCH /api/v1/admin/users/:id/role`
- auth: bearer token (admin)
- body: `{ "role": "survivor" | "authority" | "admin" }`
- response: `{ "user": User }`

## Audit Logs

- `GET /api/v1/audit-logs?limit=100`
- auth: bearer token (admin)
- response: `{ "items": AuditLog[] }`

## Evaluation Metrics

- `GET /api/v1/metrics/evaluation?days=30`
- auth: bearer token (admin)
- response: objective-3 oriented metrics bundle:
  - secure evidence preservation rates (IPFS pinned + blockchain anchored)
  - repeat reporting proxy indicators
  - survivor-controlled grant/revoke event counts
  - provider coordination indicators (authority notes, notifications, response time)

## Notifications

- `GET /api/v1/notifications?limit=20`
- auth: bearer token
- response: `{ "items": Notification[], "unreadCount": number }`

- `POST /api/v1/notifications`
- auth: bearer token (`authority` or `admin`)
- body: `{ "caseId": string, "title"?: string, "message": string }`
- response: `{ "item": Notification }`

- `PATCH /api/v1/notifications/:id/read`
- auth: bearer token (recipient)
- response: `{ "item": Notification }`

- `PATCH /api/v1/notifications/read-all`
- auth: bearer token
- response: `{ "ok": true }`

## Shared types

- `Case`: `{ id, survivor_id, title, description, incident_date, status, onchain_case_id, onchain_case_tx, created_at, updated_at }`
- `Evidence`: `{ id, case_id, survivor_id, evidence_type, file_name, ipfs_hash, blockchain_tx, uploaded_at }`
- `AccessGrant`: `{ id, case_id, authority_id, granted_by, granted_at, revoked_at }`
- `CaseNote`: `{ id, case_id, author_id, content, created_at }`

## Authz rules

- `survivor`: CRUD on own cases, grant/revoke access on own cases
- `authority`: read granted cases, update status only, add notes on granted cases
- `admin`: full read/update, plus user role management later
