# Order Explorer

A searchable, filterable, sortable explorer over 10,000 orders. It is built to behave correctly on slow networks, with failing requests, fast typing, large lists, keyboard-only users and screen readers.

**Stack:** React 18 · TypeScript (strict) · Vite · Material UI · Redux Toolkit + RTK Query · React Router · Zod · MSW · TanStack Virtual · Vitest + Testing Library

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit + integration tests
npm run lint && npm run typecheck && npm run build
```

### Demo switches

The mock API adds 200 ms–3 s of latency and fails about 10% of requests. Add `?chaos=` to the URL on page load to change this:

| URL | Behaviour |
|---|---|
| `/orders` | Random latency, 10% failures (default) |
| `/orders?chaos=off` | Instant, never fails |
| `/orders?chaos=fail` | Every request fails, which shows the error and retry states |

## Project structure

```
src/
├─ api/ordersApi.ts        RTK Query endpoints: list, summary, detail
├─ components/             UI (one component per file)
├─ hooks/                  useOrderParams (URL state), useOrders (abortable query), useDebouncedCallback
├─ lib/                    searchParams (Zod schema), format, errors
├─ mocks/                  seeded dataset, pure query logic, MSW handlers
├─ types/order.ts          domain types and enums
├─ test/                   test setup + renderApp helper
├─ routes.tsx · App.tsx · store.ts · theme.ts · main.tsx
```

There is a single feature, so the structure is flat. Tests sit next to the code they cover.

## Architecture and state management

**The URL is the source of truth for the view.** Search text, filters, sort, page and page size live only in the query string. `useOrderParams` parses them with a Zod schema, where invalid values fall back to defaults, and writes them back. Nothing is mirrored into Redux, so refresh, back/forward and shared links all restore the exact view.

**Redux Toolkit holds the server state, through RTK Query.** Almost all of the state here is server data. RTK Query provides a cache keyed by request arguments, request dedupe, `AbortSignal` support and `currentData`. Doing the same with the Context API would mean writing a cache and a race-handling layer by hand, and every consumer would re-render on each change.

### Never showing stale results

1. **Debounce:** text inputs keep a local draft and commit to the URL 300 ms after the last keystroke.
2. **Cancel:** `useOrders` aborts the previous in-flight request whenever the query changes.
3. **Ignore:** the UI renders only `currentData`, the result for the current arguments. A late response for an older query lands in its own cache slot and is never displayed. While new data loads, skeleton rows replace the old ones (`aria-busy`), so old data never looks current.

### Honest states

| State | What the user sees |
|---|---|
| Loading | Skeleton rows; the table has `aria-busy` |
| Empty | "No orders match" with a reset button, or "page is empty" with a first-page button |
| Error | Error alert with a retry button; old rows are removed |
| Partial failure | The summary (revenue and status counts) is a separate request. If it fails, a warning with a retry appears while the rows stay usable. |

### Large lists

Pages of up to 1,000 rows are virtualized with TanStack Virtual inside a real `<table>`. Spacer rows keep the table semantics. Rows are memoized, and only the rows whose tab stop changes re-render.

### Detail view

`/orders/:orderId` is a nested route rendered as an MUI `Drawer` over the list. The list stays mounted, so its scroll position and filters survive. The route can be deep-linked. Closing goes back in history when the drawer was opened from the list, and otherwise replaces the URL with the list view.

### Accessibility

- **Keyboard:** rows use a roving tab stop. ↑/↓, PageUp/PageDown and Home/End move between rows, and Enter opens a row. Sort headers expose `aria-sort`, and the table exposes `aria-rowcount` / `aria-rowindex` for virtualized rows.
- **Announcements:** a polite `role="status"` region announces result counts, and error alerts use `role="alert"`.
- **Focus:** a skip link, a visible `:focus-visible` ring, a focus trap in the drawer, and focus restored on close.

## Tests

The tests target the tricky behaviour (`src/components/OrdersPage.test.tsx`):

- A slow, superseded response never overwrites a newer one.
- A failed request replaces old rows with an error, and retry recovers.
- A summary-only failure shows a partial-failure state while rows still render.
- A URL restores the search, the filters and the page.
- A deep-linked drawer opens, and closing it returns to the same list URL.

There are also unit tests for URL parsing/serialization and for the server-side query logic.

## Tradeoffs

- **Pagination instead of infinite scroll.** Pages are deterministic, shareable and easy to restore from the URL. Virtualization keeps 1,000-row pages smooth. Scroll position *within* a page is kept while the drawer is open, but it is not stored in the URL.
- **The mock API runs in the browser (MSW).** This means a free static deploy with no backend, and the same handlers drive the tests. The cost is that the whole dataset is generated on the client (a seeded PRNG, about 10k objects).
- **Search is committed to history.** Every debounced commit creates a history entry, so back/forward steps through searches. This is a deliberate choice over `replace`.
- **In tests,** jsdom's `AbortSignal` is incompatible with Node's `fetch`, so the test setup strips the signal. RTK Query still treats the request as aborted.

## Sources and references

- RTK Query docs: [Conditional fetching and lazy queries](https://redux-toolkit.js.org/rtk-query/usage/queries), [`currentData` vs `data`](https://redux-toolkit.js.org/rtk-query/api/created-api/hooks#usequery)
- [MSW v2 docs](https://mswjs.io/docs/)
- [TanStack Virtual: table example](https://tanstack.com/virtual/latest/docs/framework/react/examples/table)
- [MUI Table](https://mui.com/material-ui/react-table/), [Drawer](https://mui.com/material-ui/react-drawer/)
- [WAI-ARIA APG: Grid and Table patterns](https://www.w3.org/WAI/ARIA/apg/patterns/table/)
- [React Router: `useSearchParams`](https://reactrouter.com/6.30.0/hooks/use-search-params)

## AI usage

This project was planned and built with Claude Code (Anthropic). I set the requirements and constraints: React + TypeScript, Material UI, RTK, a simple folder structure and minimal comments. I then reviewed the plan and the generated code.