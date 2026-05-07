# Claude Todo — Project Guide

## Stack
- **Next.js 16 (App Router)** + TypeScript
- **SQLite** via `better-sqlite3` (synchronous, server-side only)
- **Tailwind CSS v4**
- **Jest + React Testing Library** for unit/integration tests
- **Playwright** for E2E tests

## Commands

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build (runs tsc + Next.js compiler)
npm test             # Jest unit + component tests (31 tests)
npm run test:e2e     # Playwright E2E tests (8 tests, requires dev server)
npm run lint         # ESLint
```

## Architecture

### Data flow
All data mutations go through REST API routes. The page is a client component that calls `fetch()` and re-fetches the full list after every mutation — no optimistic updates, no client-side cache.

```
app/page.tsx  →  fetch('/api/todos')  →  app/api/todos/route.ts  →  lib/db.ts  →  todos.db
```

### API routes

| Method | Route | Body | Action |
|--------|-------|------|--------|
| GET | `/api/todos?filter=all\|active\|completed` | — | List todos (SQL WHERE) |
| POST | `/api/todos` | `{ title, due_date?, priority }` | Create todo |
| PATCH | `/api/todos/:id` | `{ completed: boolean }` | Toggle complete |
| DELETE | `/api/todos/:id` | — | Delete todo |
| DELETE | `/api/todos/reset` | — | Wipe all todos (dev only, used by E2E) |

All responses are JSON. Errors return `{ error: string }` with an appropriate status code.

### Database (`lib/db.ts`)

- `createDb(path)` — factory used by tests to inject `:memory:` databases
- `getDb()` — singleton used by API routes; opens `todos.db` at `process.cwd()`
- Schema init runs on first connection via `CREATE TABLE IF NOT EXISTS`

```sql
CREATE TABLE IF NOT EXISTS todos (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT    NOT NULL,
  due_date   TEXT,
  priority   TEXT    NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  completed  INTEGER NOT NULL DEFAULT 0,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
```

SQLite stores `completed` as `0/1`; API routes convert it to `boolean` before returning JSON.

### Key files

```
lib/types.ts                     # Todo, Priority, FilterStatus types
lib/db.ts                        # SQLite singleton + createDb factory
app/page.tsx                     # Root client component — state, fetch, handlers
app/api/todos/route.ts           # GET + POST
app/api/todos/[id]/route.ts      # PATCH + DELETE
app/api/todos/reset/route.ts     # DELETE (test helper, blocked in production)
components/TodoForm.tsx          # Add form: title, due date, priority select
components/FilterTabs.tsx        # All / Active / Completed tab switcher
components/TodoList.tsx          # List renderer + empty state
components/TodoItem.tsx          # Single row: checkbox, title, badge, delete
```

### Filter persistence
The active filter is stored in the URL as `?filter=all|active|completed`. `useSearchParams()` reads it; `router.push()` updates it. Reloading the page preserves the filter.

## Testing

### Unit/integration (Jest)
Two Jest projects run in parallel:
- **`api`** — `node` environment, tests API route handlers directly, injects an in-memory SQLite DB via `jest.mock('@/lib/db')`
- **`components`** — `jsdom` environment, mocks `global.fetch` with `jest.fn()`

`tsconfig.json` excludes `__tests__/` and `e2e/` so the Next.js build isn't affected by Jest/Playwright types.

### E2E (Playwright)
- Runs against the dev server (`reuseExistingServer: true` locally, starts fresh in CI)
- Each test calls `DELETE /api/todos/reset` in `beforeEach` for a clean DB state
- Uses `click()` + CSS assertion for checkbox toggles (not `check()`/`uncheck()`) because the checkbox is a controlled React component — DOM updates after the async fetch resolves, not immediately on click
- Waits for each added todo to appear in the list before adding the next, to avoid the form's post-submit `setTitle('')` racing with the test's `fill()`

## Known gotchas

- **`node_modules/.bin/` symlinks** — installing with `--cache /tmp/npm-cache` created hardcopy binaries instead of symlinks for `next` and `tsc`. If those break, recreate them:
  ```bash
  ln -sf ../next/dist/bin/next node_modules/.bin/next
  ln -sf ../typescript/bin/tsc node_modules/.bin/tsc
  ```
- **`todos.db` is gitignored** — the database file is local only and created automatically on first run
- **Reset endpoint** — `DELETE /api/todos/reset` returns 403 in production (`NODE_ENV === 'production'`)
