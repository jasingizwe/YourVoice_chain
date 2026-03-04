# YourVoice

YourVoice is a survivor-centered platform for secure GBV case documentation, evidence handling, consent-based access control, and integrity tracking.

## Deployed Links

- Frontend: `https://your-voice-chain.vercel.app`
- Backend API: `https://yourvoice-api.onrender.com`
- Health Check: `https://yourvoice-api.onrender.com/health`

## Demo Video (5 Minutes)

- Video Link: `https://drive.google.com/file/d/1lsprJPgAGqrHK9rOAllJOb6lIBu0gfUM/view?usp=sharing`
- The demo focuses on core functionalities (case submission, evidence, access grants, authority updates, notifications) and avoids spending time on sign-up/sign-in flows.

## Project Structure

- `frontend/` - React + Vite frontend
- `server/` - Node.js + Express backend
- `server/sql/` - SQL schema and migrations
- `docs/api-contract.md` - API contract
- `frontend/src/contracts/GBVEvidenceRegistry.sol` - smart contract source

## Installation and Run 

## 1. Clone Repo

```sh
git clone https://github.com/jasingizwe/YourVoice_chain.git
cd YourVoice_chain
```

## 2. Start PostgreSQL (Local)

```sh
docker run --name yourvoice-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=yourvoice -p 5432:5432 -d postgres:16
```

## 3. Configure Backend

```sh
cd server
npm install
```

Create `server/.env`:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/yourvoice
JWT_SECRET=change_me_now_123
JWT_EXPIRES_IN=7d
PINATA_JWT=
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

Run migrations and backend:

```sh
npm run migrate
npm run dev
```

## 4. Configure Frontend

```sh
cd ../frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:4000/api/v1
VITE_EVIDENCE_CONTRACT_ADDRESS=0x1bE588465CB8AC6a5957101065FE1C762DB287E9
```

Run frontend:

```sh
npm run dev
```

Open: `http://localhost:8080`

## Related Files to the Project

- `frontend/src/pages/dashboard/NewCase.tsx`
- `frontend/src/pages/dashboard/CaseDetail.tsx`
- `frontend/src/lib/api.ts`
- `frontend/src/lib/blockchain.ts`
- `server/src/routes/auth.routes.js`
- `server/src/routes/cases.routes.js`
- `server/src/routes/notifications.routes.js`
- `server/src/routes/metrics.routes.js`
- `server/src/services/ipfs.js`
- `server/src/services/health.js`
- `server/sql/migrations/001_baseline.sql`
