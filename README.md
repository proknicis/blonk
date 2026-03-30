# BLONK - AI Workflow Platform

Modular AI automation for professional service firms.

## Getting Started

### 1. Prerequisite
- Node.js 18+
- Docker & Docker Compose (for the database)

### 2. Installation
```bash
npm install
```

### 3. Start Database
- **Requirement**: Ensure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is installed and running.
- **Command**:
```bash
docker compose up -d
```
*(Note: Use `docker compose` without the hyphen in modern Docker versions. If you don't have Docker, you can use a hosted PostgreSQL service like Supabase and update your `.env`.)*

### 4. Setup Database
```bash
npx prisma db push
```

### 5. Run Development Server
```bash
npm run dev
```

## Production Deployment
The application is ready to be dockerized. Use the provided Docker Compose for the DB and a standard Node.js image for the app.

## Tech Stack
- Next.js (App Router)
- TypeScript
- Prisma + PostgreSQL
- Vanilla CSS (Strict Design System)
