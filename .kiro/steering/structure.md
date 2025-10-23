
## Language

**Sempre responda em português** - Always respond in Portuguese to the user.

## Documentation Files

**NEVER create .md documentation files unless explicitly requested by the user.**
- Do not create documentation "just in case"
- Do not create multiple docs for the same topic
- Only create when user specifically asks for it


# Project Structure

## Directory Organization

```
app/                          # Next.js App Router
  (core)/                     # Core layout and shared components
    layout/                   # Root layout with theme provider
    seo/                      # SEO utilities
    styles/                   # Global styles
  (public)/                   # Public-facing routes
  (intranet)/                 # Internal authenticated routes
    formularios/              # Corporate forms
    politicas/                # Policy documents
  (demos)/                    # Demo/test pages
  actions/                    # Shared server actions
  api/                        # API routes
  [feature]/                  # Feature-specific routes (drive-qr, patrimonio, gs-propostas)
    actions/                  # Feature server actions
    components/               # Feature components
    context/                  # Feature context providers
    hooks/                    # Feature hooks
    lib/                      # Feature utilities
    types/                    # Feature types
    layout.tsx                # Feature layout
    page.tsx                  # Feature pages

components/                   # Shared React components
  ui/                         # shadcn/ui primitives
  [feature]-section.tsx       # Feature-specific sections

lib/                          # Shared utilities
  db/                         # Database layer
    client.ts                 # Drizzle client instance
    schema.ts                 # Database schema definitions
  services/                   # Business logic services
  utils.ts                    # Utility functions (cn, etc.)

actions/                      # Top-level server actions
types/                        # Shared TypeScript types
public/                       # Static assets
  fonts/                      # Custom fonts (Neoverse)
  images/                     # Images and icons
docs/                         # Documentation
```

## Routing Patterns

- **Route Groups**: Use parentheses for logical grouping without affecting URL structure
  - `(core)` - Shared layouts and core functionality
  - `(public)` - Public routes
  - `(intranet)` - Internal routes
  - `(demos)` - Development/testing routes

- **Feature Modules**: Self-contained features with their own folder structure
  - Each feature has its own actions, components, hooks, types
  - Feature-specific layouts override parent layouts

## Component Patterns

- **Server Components by default** - Use `'use client'` only when needed
- **shadcn/ui components** in `components/ui/` - Do not modify directly
- **Feature components** in `components/[feature]-*.tsx` or `app/[feature]/components/`
- **Shared utilities** via `@/` path alias

## Data Layer Patterns

- **Server Actions** for mutations - Use `next-safe-action` with `actionClient`
- **Drizzle ORM** for database queries - Schema in `lib/db/schema.ts`
- **Services** in `lib/services/` - Business logic separate from actions
- **Zod schemas** for validation - Co-located with actions or in types

## Styling Conventions

- **Tailwind utility classes** - Primary styling method
- **`cn()` utility** - For conditional class merging
- **CSS variables** - For theme tokens (defined in globals.css)
- **Custom fonts** - Neoverse (brand) and Inter (body text)

## Path Aliases

```typescript
@/components  → components/
@/lib         → lib/
@/utils       → lib/utils
@/ui          → components/ui/
@/hooks       → hooks/
```
