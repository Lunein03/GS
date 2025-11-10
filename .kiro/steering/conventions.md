# Code Conventions & Development Guidelines

## Language
**Sempre responda em português** - Always respond in Portuguese to the user.

## Environment & Tools

### Git Bash Commands
- Use Unix/Linux syntax for shell commands
- `ls` instead of `dir`
- `rm` instead of `del`
- `cp` instead of `copy`
- `mv` instead of `move`
- `cat` instead of `type`
- Use `/` for path separators, not `\`

### Docker Validation
Before starting backend work:
```bash
docker ps --format '{{.Names}}'
```
Confirm `gsproducoes-api-dev` and `gsproducoes-db-dev` are active.

If containers are not running:
```bash
docker-compose -f docker/docker-compose.dev.yml up -d
```

## React/Next.js Components

### Component Guidelines
- Use **functional components** with TypeScript interfaces
- Use `function`, not `const`, for component declarations
- Use declarative JSX
- Minimize `'use client'`, `useEffect`, and `setState` - favor React Server Components
- Place static content and interfaces at file end
- Use content variables for static content outside render functions

### Styling
- **Tailwind CSS only** - no CSS modules or `<style>` tags
- Mobile-first responsive design approach
- Use Shadcn UI, Radix, and Tailwind Aria for components

### Performance
- Wrap client components in Suspense with fallback
- Use dynamic loading for non-critical components
- Optimize images: WebP format, size data, lazy loading
- Prioritize Web Vitals (LCP, CLS, FID)

## Forms & Validation

### Form Handling
- Use **Zod** for form validation schemas
- Use **React Hook Form** for form state management
- Use **next-safe-action** for type-safe server actions
- Use `useActionState` with `react-hook-form` for validation

### Server Actions Pattern
```typescript
'use server'

import { createSafeActionClient } from 'next-safe-action'
import { z } from 'zod'
import type { ActionResponse } from '@/types/actions'

const schema = z.object({
  value: z.string()
})

export const someAction = createSafeActionClient()
  .schema(schema)
  .action(async (input): Promise<ActionResponse> => {
    try {
      // Action logic here
      return { success: true, data: /* result */ }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof AppError ? error : appErrors.UNEXPECTED_ERROR 
      }
    }
  })
```

## Error Handling

### Expected Errors
- Model expected errors as **return values**, not exceptions
- Use `useActionState` to manage errors and return them to client
- Code in `services/` dir should throw user-friendly errors for TanStack Query

### Unexpected Errors
- Use error boundaries via `error.tsx` and `global-error.tsx`
- Handle errors at the beginning of functions
- Use early returns for error conditions
- Use guard clauses for preconditions and invalid states

### Error Handling Pattern
```typescript
function processData(data: Data) {
  // Guard clauses first
  if (!data) return { error: 'No data provided' }
  if (!data.isValid) return { error: 'Invalid data' }
  
  // Happy path last
  return { success: true, result: data.process() }
}
```

## State Management

### TanStack Query (React Query)
- Use for data fetching and server state
- Implement custom hooks for queries and mutations
- Use query keys for effective caching
- Implement proper error and loading states
- Use optimistic updates for mutations
- Use query invalidation for data refetching

### Client State
- Use **zustand** for client-side state management
- Prefer React Server Components for data fetching when possible
- Implement the preload pattern to prevent waterfalls

## Naming Conventions

### Variables
- **Booleans**: Use auxiliary verbs (`isDisabled`, `hasError`, `shouldShow`)
- **Functions**: Use descriptive names with "handle" prefix for events (`handleClick`, `handleSubmit`)
- Use explicit, descriptive variable names over short, ambiguous ones

### Files
- **Lowercase with dashes**: `auth-wizard.tsx`, `user-profile.tsx`
- **Extensions**: `.config.ts`, `.test.ts`, `.context.tsx`, `.type.ts`, `.hook.ts`

## Code Quality Rules

### General Principles
- Write correct, bug-free, fully functional code
- Focus on readability over performance
- Fully implement all requested functionality
- **NO todos, placeholders, or missing pieces**
- Use early returns for better readability
- Implement accessibility features (ARIA labels, keyboard navigation, tabindex)

### Code Structure
- Break down components into smaller parts with minimal props
- Use composition to build complex components
- Follow order: component declaration, styled components, TypeScript types
- Use modular design principles

### Best Practices
- Avoid magic numbers - use named constants
- Consider edge cases in all logic
- Implement proper error logging
- Use assertions to validate assumptions
- Ensure version compatibility with project dependencies

## TODO Guidelines

### Format
```typescript
// TODO (PRIORITY): [Module/Feature] Detailed description
```

### Priority Levels
- `TODO (CRITICAL):` - Critical priority
- `TODO (HIGH):` - High priority
- `TODO (MEDIUM):` - Medium priority
- `TODO (LOW):` - Low priority

### Good TODOs
```typescript
// TODO (HIGH): [Auth API] Create 'loginUser' Server Action using next-safe-action
// TODO (MEDIUM): [Auth State] Implement context to manage user authentication state
// TODO (LOW): [Error Handling] Display user-friendly error messages using useActionState
```

### Avoid
- Vague TODOs: `// TODO: Fix this`, `// TODO: Improve`
- TODOs without context: `// TODO: Add feature`
- Already resolved TODOs
- TODOs that are just ideas without plans

## Commit Messages

Always use conventional commit format:

- `Feat(component): add new component` - New feature
- `Fix(api): fix api error` - Bug fix
- `Docs(readme): update readme` - Documentation
- `Refactor(utils): refactor utils` - Refactoring
- `Style(tailwind): add new tailwind class` - Styling
- `Test(unit): add unit test` - Tests
- `Chore(deps): update dependencies` - Maintenance

## Accessibility

- Ensure keyboard navigation for all interactive elements
- Implement proper ARIA labels and roles
- Ensure WCAG color contrast standards
- Add `tabindex="0"` for focusable elements
- Include `aria-label` for screen readers

## shadcn/ui

Install components using:
```bash
npx shadcn@latest add [component-name]
```

Import from configured aliases:
```typescript
import { Button } from '@/shared/ui/button'
import { Dialog } from '@/shared/ui/dialog'
```

## Documentation

### When to Create .md Files
1. Explicitly requested by user
2. Absolutely necessary for critical project documentation
3. Part of a specific documentation task

### Prefer
- Consolidating related docs into single comprehensive files
- Inline code comments for technical details
- Minimal, focused documentation
- One README per major module/feature

### Avoid
- Multiple documentation files for same topic
- Over-documenting with separate guides
- Creating docs "just in case"
