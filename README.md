# Fullstack Challenge — User & Posts Management Portal

A fullstack application built with Next.js, NestJS, and PostgreSQL, integrating ReqRes as an external user/auth service.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS, TanStack Query |
| Backend | NestJS 11, TypeScript, Prisma ORM |
| Database | PostgreSQL 16 (Docker locally, Neon in production) |
| Auth | ReqRes API + HttpOnly cookie session |

## Prerequisites

- Node.js 20+
- Docker Desktop
- A free [ReqRes API key](https://app.reqres.in/api-keys)

---

## Local Development

### 1. Clone & install

```bash
git clone <repo-url>
cd fullstack-challenge

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Environment variables

**Backend** — create `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/fullstack_challenge"
PORT=3001
REQRES_API_KEY="your_reqres_api_key_here"
```

**Frontend** — create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Start the database

```bash
# From the project root
docker compose up -d
```

### 4. Run database migrations

```bash
cd backend
npx prisma migrate dev
```

### 5. Start the backend

```bash
cd backend
npm run start:dev
# API running at http://localhost:3001
# Swagger docs at http://localhost:3001/api
```

### 6. Start the frontend

```bash
cd frontend
npm run dev
# App running at http://localhost:3000
```

### 7. Login

Use the default ReqRes credentials:
- **Email:** `eve.holt@reqres.in`
- **Password:** `cityslicka`

---

## Running Tests

### Backend (Jest)

```bash
cd backend
npm run test          # unit tests
npm run test:e2e      # end-to-end tests
npm run test:cov      # coverage report
```

### Frontend (Vitest)

```bash
cd frontend
npm run test          # run once
npm run test:watch    # watch mode
```

---

## API Endpoints

### Authentication
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Login via ReqRes, sets session cookie |
| POST | `/auth/logout` | Clear session cookie |

### Users
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/users/reqres` | Required | Paginated list from ReqRes |
| POST | `/users/import/:id` | Required | Import user from ReqRes to local DB |
| GET | `/users/saved` | Required | List locally saved users |
| GET | `/users/saved/:id` | Required | Get saved user detail |
| DELETE | `/users/saved/:id` | Admin only | Delete saved user |

### Posts
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/posts` | Required | Create post |
| GET | `/posts` | Required | List posts (paginated) |
| GET | `/posts/:id` | Required | Get post detail |
| PUT | `/posts/:id` | Required | Update post |
| DELETE | `/posts/:id` | Required | Delete post |

Full interactive docs available at `http://localhost:3001/api` (Swagger).

---

## Deployment

### Backend — AWS Lambda

The backend is configured for deployment via [Serverless Framework](https://www.serverless.com/).

**Prerequisites:**
- AWS CLI configured (`aws configure`)
- Serverless Framework installed (`npm install -g serverless`)
- A production PostgreSQL database (e.g., [Neon](https://neon.tech) — free tier)

**Steps:**

```bash
cd backend

# Install serverless dependencies
npm install

# Set production environment variables
export DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
export REQRES_API_KEY="your_reqres_api_key"
export FRONTEND_URL="https://your-frontend.vercel.app"

# Build and bundle the Lambda package
bash scripts/bundle.sh

# Deploy to AWS
npx serverless@3 deploy --stage prod
```

**Live deployment:**
```
https://aw2m5yf2r7.execute-api.us-east-1.amazonaws.com/prod
```
Swagger docs: `https://aw2m5yf2r7.execute-api.us-east-1.amazonaws.com/prod/api`

**Database migrations in production:**

```bash
DATABASE_URL="your_production_url" npx prisma migrate deploy
```

### Frontend — Vercel (optional)

```bash
cd frontend
npx vercel deploy
```

Set the environment variable:
```
NEXT_PUBLIC_API_URL=https://your-lambda-api-gateway-url/prod
```

---

## Environment Variables Reference

### Backend

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REQRES_API_KEY` | Yes | API key from app.reqres.in |
| `PORT` | No | Server port (default: 3001) |
| `FRONTEND_URL` | No | Frontend URL for CORS (default: any localhost) |

### Frontend

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL |

---

## Bonus Features Implemented

- Role-based access control (ADMIN role can delete users/posts)
- Request ID on every request (observability)
- Swagger/OpenAPI documentation
- Pagination on posts and users
- Structured error responses with timestamps
