# Project Structure

## Root Organization
```
├── src/                    # Frontend source code
├── backend/                # FastAPI backend
├── components/             # Shared UI components
├── lib/                    # Shared utilities
├── public/                 # Static assets
├── docker/                 # Docker configuration
├── docs/                   # Documentation
└── scripts/                # Utility scripts
```

## Frontend Structure (`src/`)

### App Router (`src/app/`)
Next.js 15 App Router with route groups:

- `(core)/` - Shared layouts and root configuration
  - `layout/root-layout.tsx` - Root layout wrapper
- `(public)/` - Public institutional pages (no auth required)
- `(intranet)/` - Internal pages (forms, policies, protected routes)
- `(workspace)/` - Business tools (opportunities, proposals, equipment)

### Features (`src/features/`)
Feature-based modules with isolated logic:
- `drive-qr/` - QR code drive integration
- `gs-propostas/` - Commercial proposals
- `patrimonio/` - Equipment/asset management

### Server (`src/server/`)
- `actions/` - Next.js Server Actions
- `http.ts` - HTTP client configuration

### Shared (`src/shared/`)
Common code across the application:
- `api/` - API client and endpoints
- `components/` - Reusable React components
- `hooks/` - Custom React hooks
- `lib/` - Utility functions
- `providers/` - Context providers
- `styles/` - Global styles
- `ui/` - shadcn/ui components

## Backend Structure (`backend/`)
```
backend/
├── app/
│   ├── api/              # API routes
│   ├── core/             # Core configuration
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   └── main.py           # FastAPI app entry
├── alembic/              # Database migrations
├── tests/                # Backend tests
└── scripts/              # Backend utility scripts
```

## Component Organization (`components/`)
```
components/
└── ui/                   # shadcn/ui primitives
    ├── button.tsx
    ├── dialog.tsx
    ├── form.tsx
    └── ...
```

## Configuration Files
- `next.config.js` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS customization
- `tsconfig.json` - TypeScript configuration
- `components.json` - shadcn/ui configuration
- `backend/pyproject.toml` - Python dependencies
- `backend/alembic.ini` - Alembic configuration

## Styling Approach
- **Tailwind CSS** for all styling (no CSS modules or styled-components)
- **CSS Variables** for theming (defined in `src/app/globals.css`)
- **Dark mode** via `next-themes` with class-based strategy
- **Custom colors**: Primary (#6620F2), Secondary (#31EBCB)
- **Custom fonts**: Inter (sans), Neoverse (display)

## Key Conventions
- **Route groups** in parentheses don't affect URL structure
- **Server Components** by default, `'use client'` only when needed
- **Feature folders** contain all related code (components, hooks, types)
- **Shared code** goes in `src/shared/` for cross-feature usage
- **Backend follows** FastAPI best practices with clear separation of concerns
