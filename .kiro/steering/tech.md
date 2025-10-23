
## Language

**Sempre responda em português** - Always respond in Portuguese to the user.

## Documentation Files

**NEVER create .md documentation files unless explicitly requested by the user.**
- Do not create documentation "just in case"
- Do not create multiple docs for the same topic
- Only create when user specifically asks for it


# Technology Stack

## Framework & Runtime

- **Next.js 15** with App Router (static export mode: `output: 'export'`)
- **React 18** with Server Components as default
- **TypeScript 5** with strict mode enabled
- **Node.js 18+** required

## UI & Styling

- **Tailwind CSS 3** with custom design tokens and animations
- **shadcn/ui** component library built on Radix UI primitives
- **Radix UI** for accessible, unstyled component primitives
- **lucide-react** for icons
- **Framer Motion** for animations
- **next-themes** for dark/light mode theming

## Data Layer

- **Drizzle ORM** for database operations
- **PostgreSQL** (via `pg` driver)
- **Zod** for schema validation
- **next-safe-action** for type-safe server actions

## State Management

- **Zustand** for client-side state
- **React Hook Form** for form handling
- **React Query** (planned) for server state management

## Utilities

- **date-fns** for date manipulation
- **nanoid** for ID generation
- **clsx** + **tailwind-merge** (via `cn()` utility)
- **sonner** for toast notifications

## Common Commands

```bash
# Development
npm run dev              # Start dev server on localhost:3000

# Build & Production
npm run build            # Create static export in /out
npm start                # Preview production build

# Linting
npm run lint             # Run ESLint

# Database (Drizzle)
npm run db:generate      # Generate migrations
npm run db:migrate       # Run migrations
npm run db:push          # Push schema changes directly
```

## Build Configuration

- Static export enabled (`output: 'export'`)
- Image optimization disabled (`unoptimized: true`)
- TypeScript and ESLint errors ignored during builds
- CSS optimization enabled experimentally
