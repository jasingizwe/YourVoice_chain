# YourVoice

Frontend + backend prototype for secure GBV case documentation.

## Stack

- Frontend: React + Vite (`/src`)
- Frontend: React + Vite (`/frontend`)
- Backend: Node.js + Express (`/server`)
- Database: PostgreSQL (Docker container `yourvoice-pg`)

## Run Frontend

```sh
cd frontend
npm install
npm run dev
```

Optional frontend env (`frontend/.env`):

```env
VITE_API_URL=http://localhost:4000/api/v1
VITE_EVIDENCE_CONTRACT_ADDRESS=
```

## Run Backend

```sh
cd server
npm install
npm run migrate
npm run dev
```

Backend env (`server/.env`):

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/yourvoice
JWT_SECRET=change_me_now_123
JWT_EXPIRES_IN=7d
PINATA_JWT=
```

## Apply Database Schema

```sh
docker exec -i yourvoice-pg psql -U postgres -d yourvoice -f /dev/stdin < server/sql/schema.sql
```

On PowerShell (no `<` redirection support in this context), use:

```powershell
Get-Content .\server\sql\schema.sql | docker exec -i yourvoice-pg psql -U postgres -d yourvoice
```

## API Contract

See `docs/api-contract.md`.
