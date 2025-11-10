# Tech Stack

## Frontend
- **Next.js 15** (App Router, React Server Components)
- **React 18** with TypeScript 5
- **Tailwind CSS 3** with custom tokens and animations
- **shadcn/ui + Radix UI** for accessible components
- **lucide-react** for icons
- **TanStack Query** for data fetching and state management
- **React Hook Form + Zod** for form validation
- **next-safe-action** for type-safe server actions
- **Framer Motion** for animations
- **zustand** for client state management

## Backend
- **FastAPI** (Python 3.11+)
- **SQLAlchemy 2.0** for ORM
- **Alembic** for database migrations
- **PostgreSQL** as database
- **Pydantic** for data validation
- **uvicorn** as ASGI server

## Infrastructure
- **Docker** for containerization
- **Docker Compose** for orchestration
- Standalone output for optimized production builds

## Key Libraries
- `@dnd-kit` for drag-and-drop
- `date-fns` for date manipulation
- `recharts` for data visualization
- `sonner` for toast notifications
- `next-themes` for dark mode

## Path Aliases
```typescript
@/*           -> ./src/*
@/components/* -> ./components/*
@/lib/*       -> ./lib/*
```

## Common Commands

### Development
```bash
# Frontend (Next.js)
npm run dev                    # Start dev server (localhost:3000)
npm run build                  # Production build
npm start                      # Start production server
npm run lint                   # Run ESLint

# Backend (FastAPI) - Local
cd backend
uvicorn app.main:app --reload --port 9000

# Database migrations
cd backend
alembic upgrade head           # Apply migrations
alembic revision --autogenerate -m "description"  # Create migration
```

### Docker
```bash
# Production environment
make up                        # Start all services
make down                      # Stop all services
make logs                      # View logs

# Development environment
make dev-up                    # Start dev services
docker compose -f docker/docker-compose.dev.yml up --build

# Database
make db-reset                  # Reset database with seed data
make migrate                   # Run migrations

# Utilities
make shell                     # Access container shell
make verify                    # Verify setup
```

### Docker Services
- **Frontend**: localhost:3000
- **Backend API**: localhost:9000
- **PostgreSQL**: localhost:5432
- **Adminer**: localhost:8080

## Environment Variables
- `.env` - Production config
- `.env.local` - Local development (frontend)
- `backend/.env.backend` - Backend config
- `.env.docker` - Docker environment template

## Build Configuration
- **Output**: Standalone (optimized for Docker)
- **TypeScript**: Strict mode enabled, build errors ignored for flexibility
- **Images**: Unoptimized, supports remote patterns (Pexels, Unsplash, S3)
- **CSS**: Experimental optimization enabled
- **Turbopack**: Available for faster dev builds
