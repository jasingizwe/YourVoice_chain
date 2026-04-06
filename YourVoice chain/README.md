# YourVoice Chain

A privacy-preserving, blockchain-based platform for secure documentation and
management of Gender-Based Violence (GBV) cases. Built for African Leadership
University BSc. Software Engineering Capstone — 2026.

**Student:** ASINGIZWE Joie Collette  
**Supervisor:** Dr. Aaron A. Izang

---

## Live Deployment

| Layer | URL |
|---|---|
| Frontend | https://your-voice-chain.vercel.app |
| Backend API | https://yourvoice-api.onrender.com |
| Health Check | https://yourvoice-api.onrender.com/health |

## Demo Video

https://drive.google.com/file/d/1lsprJPgAGqrHK9rOAllJOb6lIBu0gfUM/view?usp=sharing

---

## What is YourVoice Chain?

YourVoice Chain is a survivor-centred platform that allows GBV survivors to:

- Securely submit and store case records
- Upload evidence files that are pinned to IPFS (decentralised storage)
  via Pinata
- Anchor evidence hashes immutably on the Ethereum Sepolia testnet via a
  Solidity smart contract
- Grant and revoke case access to trusted authorities (legal aid, healthcare,
  police) — recorded on-chain
- Receive real-time notifications from assigned authorities
- View a tamper-proof audit log of all access events

Authorities can view only cases they have been granted access to, update case
status, add notes, and send updates to survivors.

### Why Blockchain?

A standard full-stack application with role-based permissions controls *who*
can access data, but cannot prevent a privileged administrator from silently
altering or deleting records. In GBV contexts where survivors face retaliation
and institutional trust is fragile, evidence must be cryptographically
tamper-evident. Blockchain provides this: once an evidence hash is anchored
on-chain, no subsequent action by any actor can alter that record without
detection.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, TailwindCSS, shadcn/ui |
| Backend | Node.js, Express, JWT authentication, Zod validation |
| Database | PostgreSQL (Docker locally, Render Postgres in production) |
| Blockchain | Solidity smart contract on Ethereum Sepolia testnet (ethers.js v6) |
| Decentralised Storage | IPFS via Pinata (JWT auth), SHA-256 fallback hashing |
| Infrastructure | Vercel (frontend), Render (backend + DB) |

---

## Smart Contract

**Contract:** `GBVEvidenceRegistry`  
**Network:** Ethereum Sepolia Testnet  
**Deployed Address:** `0x1bE588465CB8AC6a5957101065FE1C762DB287E9`  
**Source:** `frontend/src/contracts/GBVEvidenceRegistry.sol`

### Core Functions

```solidity
registerEvidence(string caseId, string ipfsHash)  // anchor evidence hash on-chain
grantAccess(string caseId, address authority)      // record access grant on-chain
revokeAccess(string caseId, address authority)     // record access revocation on-chain
```

---

## Project Structure

```
YourVoice chain/
├── frontend/                            # React + Vite SPA
│   ├── src/
│   │   ├── pages/dashboard/             # Survivor & Authority dashboards
│   │   ├── lib/api.ts                   # Backend API client
│   │   ├── lib/blockchain.ts            # ethers.js smart contract integration
│   │   └── contracts/
│   │       └── GBVEvidenceRegistry.sol  # Smart contract source
│   └── vercel.json                      # Vercel deployment config
├── server/                              # Node.js + Express API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── cases.routes.js
│   │   │   ├── notifications.routes.js
│   │   │   └── metrics.routes.js
│   │   ├── services/
│   │   │   ├── ipfs.js                  # Pinata IPFS integration
│   │   │   └── health.js                # Health check service
│   │   └── db/
│   │       └── migrate.js               # Database migration runner
│   └── sql/
│       └── migrations/
│           └── 001_baseline.sql         # Full schema
└── docs/
    └── api-contract.md                  # Full REST API specification
```

---

## Prerequisites

- Node.js 18+
- PostgreSQL 16 (or Docker)
- MetaMask browser extension (for blockchain operations)
- Sepolia testnet ETH (free from a Sepolia faucet)
- Pinata account (free tier — for IPFS evidence storage)

---

## Local Setup

### 1. Clone the Repository

```sh
git clone https://github.com/jasingizwe/YourVoice_chain.git
cd YourVoice_chain
```

### 2. Start PostgreSQL

Using Docker:

```sh
docker run --name yourvoice-pg \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=yourvoice \
  -p 5432:5432 \
  -d postgres:16
```

### 3. Configure and Run the Backend

```sh
cd server
npm install
```

Create `server/.env`:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/yourvoice
JWT_SECRET=change_me_to_a_long_random_secret
JWT_EXPIRES_IN=7d
PINATA_JWT=your_pinata_jwt_token_here
CORS_ALLOWLIST=http://localhost:8080
PASSWORD_MIN_LENGTH=10
API_JSON_LIMIT=512kb
API_FORM_LIMIT=256kb
GLOBAL_RATE_WINDOW_MS=900000
GLOBAL_RATE_MAX=300
AUTH_RATE_WINDOW_MS=900000
AUTH_RATE_MAX=20
EVIDENCE_MAX_FILE_SIZE_MB=8
```

Run migrations and start:

```sh
npm run migrate
npm run dev
```

Backend runs at: `http://localhost:4000`  
Health check: `http://localhost:4000/health`

### 4. Configure and Run the Frontend

```sh
cd ../frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:4000/api/v1
VITE_EVIDENCE_CONTRACT_ADDRESS=0x1bE588465CB8AC6a5957101065FE1C762DB287E9
```

```sh
npm run dev
```

Open: `http://localhost:8080`

---

## MetaMask Setup (for Blockchain Features)

1. Install [MetaMask](https://metamask.io) browser extension
2. Create or import a wallet
3. Switch network to **Sepolia Testnet**
4. Get free Sepolia ETH from a faucet (e.g. sepoliafaucet.com)
5. Connect wallet inside the app when prompted

Evidence anchoring and access grant/revoke transactions require a small amount
of Sepolia ETH for gas.

---

## Running Tests

### Frontend Unit Tests

```sh
cd frontend
npm test
```

Uses Vitest + React Testing Library.

### Backend

```sh
cd server
npm run dev
# Verify all dependencies are healthy:
# GET http://localhost:4000/health
```

Smart contract unit tests were executed using Hardhat on the Sepolia testnet
during development. See Chapter 4 of the project report for full test results
(10/10 unit tests passed).

---

## User Roles

| Role | Capabilities |
|---|---|
| **Survivor** | Register, submit cases, upload evidence, grant/revoke authority access, view audit log, receive notifications |
| **Authority** | View granted cases only, update case status, add notes, send notifications to survivor |
| **Admin** | Manage users and roles, register authorities, view system audit logs, access evaluation metrics |

---

## API Reference

Full API specification: [`docs/api-contract.md`](docs/api-contract.md)

Key endpoints:

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register as survivor or authority |
| POST | `/api/v1/auth/login` | Login and receive JWT |
| POST | `/api/v1/cases` | Submit a new GBV case |
| POST | `/api/v1/cases/:id/evidence` | Upload evidence file |
| POST | `/api/v1/cases/:id/grants` | Grant authority access to a case |
| PATCH | `/api/v1/cases/grants/:id/revoke` | Revoke authority access |
| GET | `/api/v1/metrics/evaluation` | Admin — system performance metrics |
| GET | `/api/v1/audit-logs` | Admin — immutable audit log |

---

## Environment Variables Reference

### Backend (`server/.env`)

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `JWT_EXPIRES_IN` | JWT expiry (e.g. `7d`) | Yes |
| `PINATA_JWT` | Pinata API JWT for IPFS uploads | Yes (for IPFS) |
| `CORS_ALLOWLIST` | Comma-separated allowed origins | Yes |
| `PORT` | Server port (default 4000) | No |
| `PASSWORD_MIN_LENGTH` | Minimum password length | No |
| `EVIDENCE_MAX_FILE_SIZE_MB` | Max evidence upload size in MB | No |

### Frontend (`frontend/.env`)

| Variable | Description | Required |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | Yes |
| `VITE_EVIDENCE_CONTRACT_ADDRESS` | Deployed smart contract address | Yes |

---

## Key Design Decisions

- **Off-chain storage + on-chain integrity:** Evidence files are stored on IPFS
  (via Pinata) to avoid blockchain storage costs. Only the SHA-256/CID hash is
  anchored on-chain, providing tamper detection without storing sensitive data
  on a public ledger.
- **Hybrid architecture:** PostgreSQL handles all case management operations
  (fast, queryable). Blockchain handles only integrity anchoring and access
  event logging (immutable, auditable).
- **Survivor-controlled access:** Survivors explicitly grant and revoke access
  per case. Authorities cannot view any case they have not been granted access
  to, enforced at both the API layer and smart contract layer.

---

## License

This project was developed as a BSc. Software Engineering capstone at African
Leadership University. All rights reserved.
