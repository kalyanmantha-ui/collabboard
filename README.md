# CollabBoard (frontend only)

For a guided tour of this project, with an annotated demo of how it uses paper-ui, visit my portfolio: https://kalyan-mantha.vercel.app

Kanban-style task app built on the `paper-ui` design system. **No backend**: all data comes from a mock API
(`src/api/mockApi.ts`) that keeps an in-memory database, persists it to `localStorage`, and adds artificial latency
so loading states are real.

## Run it

```bash
npm install        # also installs paper-ui from GitHub and builds it
npm run dev
```

Sign in with `kalyan@example.com` / `password123`, or create any account. "Reset demo data" is at the bottom of the boards page.

Demo controls (add to a board URL): `?simulate=error` (column error state + Retry), `?simulate=empty` (empty columns), `?simulate=slow` (skeletons).

## Where things live

| Path | What |
| --- | --- |
| `src/api/seed.ts` | Dummy data: 5 users, 3 workspaces, 8 boards, ~50 tasks (Website redesign matches the wireframes exactly) |
| `src/api/mockApi.ts` | The whole "backend". Replace this one file with `fetch()` calls when a real server exists |
| `src/api/index.ts` | The only import the UI uses for data |
| `src/features/board/` | Board page, drag and drop, columns, task card, task modals, `useBoard` (optimistic updates + rollback) |
| `src/features/boards/` | Boards list and workspace sidebar |
| `src/features/auth/` | Sign in / create account (mock) |
| `src/components/` | App-level pieces built around paper-ui (Avatar, Tag, Menu, Select, AppButton, header) |

## What comes from paper-ui vs. what is local

Used from the library: `Button` (primary actions), `Input` (controlled via `value`/`onChange`), `Modal`, `Dropdown`, and all design tokens via `paper-ui/style.css`.

Local, because the library doesn't have them yet (each is a candidate to move upstream):
- Button variants (secondary, text, destructive, dashed): paper-ui's `Button` has no `variant` prop. See `components/AppButton.tsx`.
- Textarea, Avatar, Tag, overflow Menu, Card (task card lives in `features/board/TaskCard`).
- Server-side field errors: `Input` only shows errors from its own `validation` prop, so the sign-in "password doesn't match" message is rendered by the page.
- `Input` was extended in the library to forward native input props (`value`, `onChange`, `autoComplete`, ...) and to show a Show/Hide toggle on `type="password"`. Rebuild the library (`npm run build` in `design-system`) after pulling that change.

## Notes

- Drag and drop uses the native HTML5 API on desktop. Touch and keyboard users move cards from the card's overflow menu ("Move to ...") or the Status field in the task modal. Reordering pauses while filters are on.
- `vite.config.ts` dedupes `react` / `react-dom`: the library lists React as a peer dependency, and this keeps the app and the library on one copy, since two copies break hooks.
- The `paper-ui` prop names used here are Button (`isLoading`), Input (`label`, `validation`, `type`, plus native input props), Modal (`isOpen`, `onClose`, `className`), Dropdown (`options`, `Value`, `OnChange`).
