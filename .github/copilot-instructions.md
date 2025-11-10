# GS Produções Intranet - AI Coding Agent Instructions

## Architecture Overview

This is a full-stack corporate intranet built with **Next.js 15 + FastAPI backend**. The frontend uses modern React patterns with Server Components, while the backend provides API services with PostgreSQL.

### Key Stack Components
- **Frontend**: Next.js 15 (App Router), TypeScript 5, Tailwind CSS, shadcn/ui + Radix UI
- **Backend**: FastAPI, SQLAlchemy, Alembic migrations, PostgreSQL  
- **Development**: Docker Compose, custom dev scripts, Make commands
- **Deployment**: Standalone Next.js output for containerization

## Development Workflow

### Starting Development (Docker-First)
```bash
# Quick start - copies .env.docker to .env automatically
make up

# Alternative: Full stack via npm scripts  
npm run docker:dev:up && npm run dev
```

### Key Commands
```bash
make logs          # View real-time container logs
make down          # Stop all services
make db-reset      # Reset database (drops and recreates)
make shell         # Access app container shell  
make db-shell      # Access PostgreSQL shell
npm run dev        # Start Next.js dev server (uses scripts/dev.js)
```

The project uses a **custom dev script** (`scripts/dev.js`) that auto-detects available ports, not standard `next dev`.

## Project Structure & Patterns  

### Route Organization (App Router)
```
src/app/
├── (core)/layout/           # Shared root layout & components
├── (intranet)/             # Internal corporate forms & policies  
├── (public)/               # Public institutional pages
└── (workspace)/            # Business modules (drive-qr, proposals, etc.)
```

Route groups `(core)`, `(intranet)`, `(public)`, `(workspace)` organize without affecting URLs. The main layout is delegated to `src/app/(core)/layout/root-layout.tsx`.

### Features Architecture
```
src/features/
├── drive-qr/              # Google Drive QR code generator
├── gs-propostas/          # Commercial proposals management  
└── patrimonio/            # Equipment/inventory tracking
```

Each feature follows domain-driven structure with:
- `app/` - Next.js App Router pages & layouts
- `domain/` - Business logic & types
- `hooks/` - React hooks & state management
- `server/` - Server Actions & API integration
- `ui/` - Feature-specific components

### Shared Code Organization
```
src/shared/
├── api/                   # Backend API integration utilities
├── components/            # Reusable business components
├── hooks/                 # Cross-feature React hooks
├── lib/                   # Utilities (cn, validations, etc.)
├── providers/             # React context providers (Query, Theme)
└── ui/                    # shadcn/ui components & design system
```

## Backend Integration

### API Structure
- **Base URL**: `http://localhost:9000/api/v1` (development)
- **Architecture**: FastAPI with domain-driven modules in `backend/app/`
- **Database**: PostgreSQL with Alembic migrations
- **Models**: Located in `backend/app/models/` (crm.py, inventory.py, etc.)

### Environment Setup
Development uses `.env.docker` (copied to `.env`) for Docker Compose integration. Backend runs on port 9000, frontend on 3000.

### Migration Workflow
```bash
# Inside backend container or locally with DATABASE_URL set
alembic upgrade head       # Apply migrations
alembic revision --autogenerate -m "description"  # Generate migrations
```

## Code Conventions

### Frontend Preferences  
- **Favor React Server Components** over client components (`'use client'`)
- **Use shadcn/ui components** from `src/shared/ui/` directory  
- **TypeScript strict mode** - all components typed with interfaces
- **Tailwind-first styling** - avoid CSS modules or styled-components
- **Component structure**: Function declarations, not const arrows

### Backend Patterns
- **FastAPI + SQLAlchemy** - standard ORM patterns
- **Pydantic schemas** for request/response validation  
- **Domain separation** - models, repositories, services pattern
- **CORS configured** for localhost:3000 frontend integration

### Specific to This Project
- **Custom dev server**: Uses `scripts/dev.js` for port management
- **Docker-centric**: All services containerized, including DB seeding
- **Route groups**: Extensive use of Next.js route groups for organization
- **Feature modules**: Self-contained features with their own READMEs
- **Hybrid approach**: Some features remain Next.js-only (drive-qr), others integrate with FastAPI

## Important Files & Entry Points

- `src/app/(core)/layout/root-layout.tsx` - Main application layout
- `scripts/dev.js` - Custom development server with port detection  
- `docker/Makefile` - Primary development commands
- `backend/app/main.py` - FastAPI application entry point
- `src/shared/lib/utils.ts` - Tailwind utilities (`cn` function)
- `.github/instructions/Rules.instructions.md` - Detailed coding standards

## Testing & Quality

The project includes Docker-based seeding with sample data (12 opportunities, 6 proposals, 25 equipment items) accessible via Adminer at `localhost:8080` during development.

When working with this codebase, prioritize Docker workflow, respect the features architecture, and maintain the Server Components preference for new React code.