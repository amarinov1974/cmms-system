# CMMS System

Technical Maintenance Workflow Platform for retail store maintenance management.

## Architecture

- **Backend:** Node.js + TypeScript + Express + Prisma + PostgreSQL
- **Frontend:** React + TypeScript + Vite + TanStack Query + Tailwind CSS
- **Structure:** Monorepo with npm workspaces

## Critical Rules

This system implements a strict state machine workflow. **DO NOT:**
- Simplify or merge states
- Rename statuses or roles
- Remove approval chain steps
- Add automatic transitions
- Bypass ownership validation

All changes must comply with the functional specification in `docs/functional-spec.md`.

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm 10+

### Installation

```bash
# Install dependencies
npm install

# Setup backend environment
cp packages/backend/.env.example packages/backend/.env
# Edit .env with your database credentials

# Run database migrations
npm run db:migrate

# Seed demo data
npm run db:seed

# Start development servers (backend + frontend)
npm run dev
```

### Access
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Prisma Studio: npm run db:studio

## Project Structure

See functional specification for complete architecture details.

## Development Workflow

1. All state transitions go through State Transition Engine
2. All actions require ownership validation
3. All changes write to audit log
4. Frontend screens are role-specific
5. Test against demo seed data

## Testing

```bash
npm run test
```

## Deployment

TBD - Production authentication to replace demo entry screen.
