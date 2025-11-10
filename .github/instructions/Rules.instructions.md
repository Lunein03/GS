---
applyTo: '**'
---

# GLOBAL DIRECTIVES

## Environment and Tools

### Git Bash Commands
- **ALWAYS use Git Bash compatible commands** when suggesting terminal commands
- Avoid PowerShell or CMD specific commands when working in Git Bash environment
- Use Unix/Linux syntax for shell commands:
  - `ls` instead of `dir`
  - `rm` instead of `del`
  - `cp` instead of `copy`
  - `mv` instead of `move`
  - `cat` instead of `type`
  - Use `/` for path separators, not `\`

### Docker Containers
- Sempre valide o ambiente antes de subir o backend executando `docker ps --format '{{.Names}}'` e confirmando que `gsproducoes-api-dev` e `gsproducoes-db-dev` estao ativos.
- Se algum container esperado nao estiver rodando, inicialize com `docker-compose -f docker/docker-compose.dev.yml up -d` antes de continuar.

### Model Context Protocol (MCP)

**ALWAYS use MCP to perform any system action.**

#### Mandatory MCP Rules

1. **Mandatory Prior Analysis**: Before executing any task, ALWAYS analyze the complete context and create a detailed plan using sequential thinking MCP
2. **Use of Thinking MCP**: Use `mcp_sequential_thinking_sequentialthinking` to:
   - Analyze complex problems
   - Plan solutions step by step before implementation
   - Validate approaches and consider alternatives
   - Review decisions when necessary
   - Break down large tasks into smaller steps
3. **Execution via MCP**: All actions must be executed through appropriate MCP tools
4. **Validation**: Always validate results after execution

#### Website Testing with MCP Chrome DevTools

For website functionality testing, use MCP Chrome DevTools tools (`mcp_chrome_devtools_*`):

**Navigation and Analysis:**
- `navigate_page` - Navigate to URLs
- `take_snapshot` - Capture accessibility snapshot of page (PREFER over screenshot)
- `take_screenshot` - Capture visual screenshot (use only when necessary)
- `list_pages` - List open pages
- `select_page` - Select active page

**Element Interaction:**
- `click` - Click on elements
- `fill` - Fill form fields
- `fill_form` - Fill multiple fields at once
- `type` - Type text into editable elements
- `hover` - Hover over elements
- `select_option` - Select options in dropdowns

**Debugging and Analysis:**
- `list_console_messages` - List console messages
- `get_console_message` - Get specific message details
- `list_network_requests` - List network requests
- `get_network_request` - Get specific request details
- `evaluate_script` - Execute JavaScript on page

**Performance:**
- `performance_start_trace` - Start performance recording
- `performance_stop_trace` - Stop recording and get insights
- `performance_analyze_insight` - Analyze specific performance insights

## Mandatory Workflow

Follow this workflow for ALL tasks:

1. **Analysis** (MANDATORY):
   - Use `mcp_sequential_thinking_sequentialthinking` to analyze the request
   - Identify all requirements and dependencies
   - Consider edge cases and potential issues

2. **Planning** (MANDATORY):
   - Continue using thinking MCP to create a detailed plan
   - Break complex tasks into smaller steps
   - Identify necessary MCP tools for each step

3. **Execution**:
   - Execute the plan using appropriate MCP tools
   - Do one action at a time when there are dependencies
   - Execute independent actions in parallel when possible

4. **Validation**:
   - Verify results of each step
   - Use diagnostic tools when appropriate
   - Adjust plan if necessary

### Complete Workflow Example

```
Request: "Add email validation to login form"

1. ANALYSIS (via MCP thinking):
   - Identify login component file
   - Check if validation already exists
   - Determine validation library (Zod)
   - Consider error messages

2. PLANNING (via MCP thinking):
   - Step 1: Read component file
   - Step 2: Add Zod schema for email
   - Step 3: Integrate validation in form
   - Step 4: Add error messages
   - Step 5: Test with getDiagnostics

3. EXECUTION (via MCP tools):
   - readFile to read component
   - strReplace to add validation
   - getDiagnostics to check errors

4. VALIDATION:
   - Confirm no TypeScript errors
   - Verify validation is correct
```

---

# Code and Development Conventions

## Language

**Sempre responda em português** - Always respond in Portuguese to the user.

## TO-DO Rules

### General Principles for Creating TO-DOs

Global Directive: All actions must follow this. Always create TO-DOs as needed for future refinements.

- **Organization and Clarity**: All TO-DOs must be created with the goal of organizing work into clear and actionable steps. Avoid vague or generic TO-DOs.
- **Granularity**: Break down larger tasks into smaller, more manageable sub-tasks, each with its own TO-DO if necessary. This facilitates tracking and completion.
- **Context**: Include enough context in each TO-DO so that any developer (including your future self) can understand what needs to be done without extensive investigation.
- **Location**: Place TO-DOs as close as possible to the code or area where the change or addition is required.
- **Consistent Format**: Use a consistent format for all TO-DOs to facilitate searching and management (e.g., `// TODO: [Module/Feature] Detailed description of the task`).
- **Prioritization** (Optional, but Recommended): If applicable, add a priority level:
  - `// TODO (CRITICAL):` - Critical priority
  - `// TODO (HIGH):` - High priority
  - `// TODO (MEDIUM):` - Medium priority
  - `// TODO (LOW):` - Low priority
- **Assignee** (Optional): In teams, it can be useful to add the name or identifier of the person responsible for the task (e.g., `// TODO (@dev-name):`).

### Examples of Creating Step-by-Step TO-DOs

When a complex task arises, break it down:

1. Identify the Main Task: "Implement user authentication feature."
2. List Key Steps:
   - Create login/registration UI
   - Integrate with authentication API
   - Manage authentication state (logged-in user, token)
   - Protect routes
   - Handle errors and user feedback

3. Create Specific TO-DOs for Each Step:

```typescript
// TODO (HIGH): [Auth UI] Create login form component with email and password fields
// TODO (HIGH): [Auth UI] Implement basic form validation for login using Zod
// TODO (HIGH): [Auth UI] Create registration form component with email, password, and confirm password fields
// TODO (HIGH): [Auth UI] Implement form validation for registration using Zod, including password confirmation
// TODO (MEDIUM): [Auth API] Create 'loginUser' Server Action for authentication, using next-safe-action
// TODO (MEDIUM): [Auth API] Create 'registerUser' Server Action for new user registration, using next-safe-action
// TODO (MEDIUM): [Auth API] Model expected errors (e.g., invalid credentials, user already exists) for Server Actions
// TODO (MEDIUM): [Auth State] Implement context or hook to manage user authentication state
// TODO (MEDIUM): [Auth State] Securely store authentication token after successful login/registration
// TODO (LOW): [Routing] Protect routes requiring authentication (e.g., /dashboard) by redirecting unauthenticated users
// TODO (LOW): [Routing] Redirect authenticated user from /login to /dashboard
// TODO (LOW): [Error Handling] Display user-friendly error messages in login/registration forms using useActionState
// TODO (LOW): [Feedback] Add loading indicators (spinner) during login/registration actions
```

### Negative Prompts for TO-DOs (What to Avoid)

To ensure TO-DOs are effective, avoid these patterns:

**Vagueness:**
- `// TODO: Improve this.`
- `// TODO: Fix bug.`
- `// TODO: Optimize.`
- `// TODO: Later.`

**Lack of Context/Specificity:**
- `// TODO: Add feature.` (Which feature? Where?)
- `// TODO: Check 'x' variable.` (What to check? Under what conditions?)
- `// TODO: Refactor code.` (Which part of the code? With what objective?)

**TO-DOs that have already been resolved:**
- `// TODO: Remove old code.` (If the code has been removed, remove the TO-DO.)

**Excessively Large TO-DOs (that should be broken down):**
- `// TODO: Implement the entire product API with CRUD, filters, pagination, and authentication.` (This is an epic, not a TO-DO.)

**TO-DOs that are just an idea without a plan:**
- `// TODO: Maybe add a chat feature here?` (If there's no concrete plan, it's a note, not an actionable TO-DO.)

**TO-DOs that duplicate an existing issue/ticket:**
- If an item already exists in your project management system (Jira, Trello, GitHub Issues, etc.), the in-code TO-DO should be minimal, perhaps just referencing the ticket ID, to avoid redundancy.

## React/Next.js Applications

### Components

- Use functional components and TypeScript interfaces
- Use declarative JSX
- Use `function`, not `const`, for components
- Use Shadcn UI, Radix, and Tailwind Aria for components and styling
- Implement responsive design with Tailwind CSS
- Use mobile-first approach for responsive design
- Place static content and interfaces at file end
- Use content variables for static content outside render functions
- Minimize `'use client'`, `useEffect`, and `setState`. Favor RSC (React Server Components)
- Use Zod for form validation
- Wrap client components in Suspense with fallback
- Use dynamic loading for non-critical components
- Optimize images: WebP format, size data, lazy loading

### Error Handling

- **Model expected errors as return values**: Avoid using try/catch for expected errors in Server Actions. Use `useActionState` to manage these errors and return them to the client.
- **Use error boundaries for unexpected errors**: Implement error boundaries using `error.tsx` and `global-error.tsx` files to handle unexpected errors and provide a fallback UI.
- Use `useActionState` with `react-hook-form` for form validation
- Code in `services/` dir always throw user-friendly errors that TanStack Query can catch and show to the user

### Server Actions with next-safe-action

- Implement type-safe server actions with proper validation
- Utilize the action function from next-safe-action for creating actions
- Define input schemas using Zod for robust type checking and validation
- Handle errors gracefully and return appropriate responses
- Use `import type { ActionResponse } from '@/types/actions'`
- Ensure all server actions return the ActionResponse type
- Implement consistent error handling and success responses using ActionResponse

**Example:**

```typescript
'use server'

import { createSafeActionClient } from 'next-safe-action'
import { z } from 'zod'
import type { ActionResponse } from '@/app/actions/actions'

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

### Key Conventions

1. Rely on Next.js App Router for state changes and routing
2. Prioritize Web Vitals (LCP, CLS, FID)
3. Minimize 'use client' usage:
   - Prefer server components and Next.js SSR features
   - Use 'use client' only for Web API access in small components
   - Avoid using 'use client' for data fetching or state management

Refer to Next.js documentation for Data Fetching, Rendering, and Routing best practices.

## React Components (without Next.js)

### Whenever you need a React component

1. Carefully consider the component's purpose, functionality, and design
2. Think slowly, step by step, and outline your reasoning
3. Check if a similar component already exists in any of the following locations:
   - `packages/ui/src/components`
   - `apps/spa/src/components`
4. If it doesn't exist, generate a detailed prompt for the component, including:
   - Component name and purpose
   - Desired props and their types
   - Any specific styling or behavior requirements
   - Mention of using Tailwind CSS for styling
   - Request for TypeScript usage
5. URL encode the prompt
6. Create a clickable link in this format: `[ComponentName](https://v0.dev/chat?q={encoded_prompt})`
7. After generating, adapt the component to fit our project structure:
   - Import common shadcn/ui components from `@repo/ui/components/ui/`
   - Import app specific components from `@/components`
   - Ensure it follows our existing component patterns
   - Add any necessary custom logic or state management

## React Query State Management

When implementing state for React applications, always use React Query based on these rules:

```javascript
// Prefer functional components with hooks
const preferFunctionalComponents = true;

// React Query best practices
const reactQueryBestPractices = [
  "Use QueryClient and QueryClientProvider at the root of your app",
  "Implement custom hooks for queries and mutations",
  "Utilize query keys for effective caching",
  "Use prefetching for improved performance",
  "Implement proper error and loading states",
];

// Folder structure
const folderStructure = `
src/
  components/
  hooks/
    useQueries/
    useMutations/
  pages/
  utils/
  api/
`;

// Additional instructions
const additionalInstructions = `
1. Use TypeScript for type safety with React Query
2. Implement proper error boundaries for query errors
3. Utilize React Query DevTools for debugging
4. Use stale-while-revalidate strategy for data freshness
5. Implement optimistic updates for mutations
6. Use query invalidation for data refetching
7. Follow React Query naming conventions for consistency
`;
```

## Commit Messages

When you finish applying changes, the last line of the message should contain "Don't forget to commit" and provide a suggested commit text as well.

Always prefix commit messages as follows. No exceptions!

- `Feat(component): add new component` - New feature
- `Fix(api): fix api error` - Bug fix
- `Docs(readme): update readme` - Documentation
- `Refactor(utils): refactor utils` - Refactoring
- `Style(tailwind): add new tailwind class` - Styling
- `Test(unit): add unit test` - Tests
- `Chore(deps): update dependencies` - Maintenance

## shadcn Installation

The command `npx shadcn-ui` (CLI) is going to be deprecated soon. Use:

```bash
npx shadcn@latest add [component-name]
```

## General Rules

- Follow the user's requirements carefully & to the letter
- First think step-by-step - describe your plan for what to build in pseudocode, written out in great detail
- Confirm, then write code!
- Focus on easy and readability code, over being performant
- Fully implement all requested functionality
- Leave NO todo's, placeholders or missing pieces
- Ensure code is complete! Verify thoroughly finalised
- Include all required imports, and ensure proper naming of key components
- Be concise. Minimize any other prose
- If you think there might not be a correct answer, you say so
- If you do not know the answer, say so, instead of guessing
- Use early returns whenever possible to make the code more readable
- Always use Tailwind classes for styling HTML elements; avoid using CSS or `<style>` tags
- Use `class:` instead of the ternary operator in class tags whenever possible
- Use descriptive variable and function/const names. Event functions should be named with a "handle" prefix, like `handleClick` for `onClick` and `handleKeyDown` for `onKeyDown`
- Implement accessibility features on elements. For example, a tag should have a `tabindex="0"`, `aria-label`, `on:click`, and `on:keydown`, and similar attributes
- Use consts instead of functions, for example, `const toggle = () =>`. Also, define a type if possible

### Detailed Guidelines

1. **Verify Information**: Always verify information before presenting it. Do not make assumptions or speculate without clear evidence.
2. **File-by-File Changes**: Make changes file by file and give me a chance to spot mistakes.
3. **No Apologies**: Never use apologies.
4. **No Understanding Feedback**: Avoid giving feedback about understanding in comments or documentation.
5. **No Whitespace Suggestions**: Don't suggest whitespace changes.
6. **No Summaries**: Don't summarize changes made.
7. **No Inventions**: Don't invent changes other than what's explicitly requested.
8. **No Unnecessary Confirmations**: Don't ask for confirmation of information already provided in the context.
9. **Preserve Existing Code**: Don't remove unrelated code or functionalities. Pay attention to preserving existing structures.
10. **Single Chunk Edits**: Provide all edits in a single chunk instead of multiple-step instructions or explanations for the same file.
11. **No Implementation Checks**: Don't ask the user to verify implementations that are visible in the provided context.
12. **No Unnecessary Updates**: Don't suggest updates or changes to files when there are no actual modifications needed.
13. **Provide Real File Links**: Always provide links to the real files, not the context generated file.
14. **No Current Implementation**: Don't show or discuss the current implementation unless specifically requested.
15. **Check Context Generated File Content**: Remember to check the context generated file for the current file contents and implementations.
16. **Use Explicit Variable Names**: Prefer descriptive, explicit variable names over short, ambiguous ones to enhance code readability.
17. **Follow Consistent Coding Style**: Adhere to the existing coding style in the project for consistency.
18. **Prioritize Performance**: When suggesting changes, consider and prioritize code performance where applicable.
19. **Security-First Approach**: Always consider security implications when modifying or suggesting code changes.
20. **Test Coverage**: Suggest or include appropriate unit tests for new or modified code.
21. **Error Handling**: Implement robust error handling and logging where necessary.
22. **Modular Design**: Encourage modular design principles to improve code maintainability and reusability.
23. **Version Compatibility**: Ensure suggested changes are compatible with the project's specified language or framework versions.
24. **Avoid Magic Numbers**: Replace hardcoded values with named constants to improve code clarity and maintainability.
25. **Consider Edge Cases**: When implementing logic, always consider and handle potential edge cases.
26. **Use Assertions**: Include assertions wherever possible to validate assumptions and catch potential errors early.

### Code Quality

- Always write correct, up to date, bug free, fully functional and working, secure, performant and efficient code
- Focus on readability over being performant
- Fully implement all requested functionality
- Leave NO todo's, placeholders or missing pieces
- Be sure to reference file names
- Be concise. Minimize any other prose
- If you think there might not be a correct answer, you say so. If you do not know the answer, say so instead of guessing
- Only write code that is necessary to complete the task
- Rewrite the complete code only if necessary

### Error Handling and Edge Cases

- Handle errors and edge cases at the beginning of functions
- Use early returns for error conditions to avoid deeply nested if statements
- Place the happy path last in the function for improved readability
- Avoid unnecessary else statements; use if-return pattern instead
- Use guard clauses to handle preconditions and invalid states early
- Implement proper error logging and user-friendly error messages
- Consider using custom error types or error factories for consistent error handling

## AI SDK

- Use the Vercel AI SDK UI for implementing streaming chat UI
- Use the Vercel AI SDK Core to interact with language models
- Use the Vercel AI SDK RSC and Stream Helpers to stream and help with the generations
- Implement proper error handling for AI responses and model switching
- Implement fallback mechanisms for when an AI model is unavailable
- Handle rate limiting and quota exceeded scenarios gracefully
- Provide clear error messages to users when AI interactions fail
- Implement proper input sanitization for user messages before sending to AI models
- Use environment variables for storing API keys and sensitive information

## Naming Conventions

- **Booleans**: Use auxiliary verbs such as 'does', 'has', 'is', and 'should' (e.g., `isDisabled`, `hasError`)
- **Filenames**: Use lowercase with dash separators (e.g., `auth-wizard.tsx`)
- **File extensions**: Use `.config.ts`, `.test.ts`, `.context.tsx`, `.type.ts`, `.hook.ts` as appropriate

## Component Structure

- Break down components into smaller parts with minimal props
- Suggest micro folder structure for components
- Use composition to build complex components
- Follow the order: component declaration, styled components (if any), TypeScript types

## Data Fetching and State Management

- Use React Server Components for data fetching when possible
- Implement the preload pattern to prevent waterfalls
- Leverage Supabase for real-time data synchronization and state management
- Use Vercel KV for chat history, rate limiting, and session storage when appropriate

## Accessibility

- Ensure interfaces are keyboard navigable
- Implement proper ARIA labels and roles for components
- Ensure color contrast ratios meet WCAG standards for readability

## Documentation

- Provide clear and concise comments for complex logic
- Use JSDoc comments for functions and components to improve IDE intellisense
- Keep the README files up-to-date with setup instructions and project overview
- Document Supabase schema, RLS policies, and Edge Functions when used
**IMPORTANT: Only create .md documentation files when:**
1. **Explicitly requested by the user**
2. **Absolutely necessary** for critical project documentation (e.g., main README.md, API documentation)
3. **Part of a specific documentation task**

**Avoid:**
- Creating multiple documentation files for the same topic
- Over-documenting with separate files for guides, troubleshooting, best practices, etc.
- Creating documentation "just in case" or "for completeness"

**Prefer:**
- Consolidating related documentation into a single comprehensive file
- Using inline code comments for technical details
- Keeping documentation minimal and focused
- One README per major module/feature is usually sufficient
