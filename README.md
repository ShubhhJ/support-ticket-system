# Support Ticket & SLA Tracking System

A small support-desk app — customers raise tickets, agents pick them up, and every ticket has an SLA deadline based on priority. The part I actually cared about here isn't the CRUD, it's the **SLA engine**: a background job that keeps an eye on open tickets, warns when one is about to miss its deadline, and auto-escalates the ones that already have.

Built with Node/Express + TypeScript on the backend, MySQL via Prisma, and a small React (Vite) dashboard. Logging is winston, validation is zod, and the usual hardening (helmet, rate limiting) is in place.

## Running it

You'll need Node 20+ and a local MySQL 8.

**Database first.** Create the DB and load the schema + seed:

```bash
mysql -u root -p -e "CREATE DATABASE support_tickets;"
mysql -u root -p support_tickets < backend/sql/schema.sql
mysql -u root -p support_tickets < backend/sql/seed.sql
```

If you don't have the `mysql` CLI handy, once the DB exists and `DATABASE_URL` is set you can run the same files through Prisma:

```bash
cd backend
npx prisma db execute --file sql/schema.sql --schema prisma/schema.prisma
npx prisma db execute --file sql/seed.sql   --schema prisma/schema.prisma
```

The seed deliberately backdates some tickets (using `UTC_TIMESTAMP()`), so a few of them are already breached or at-risk the moment you start the server — the cron has something to chew on right away.

**Backend:**

```bash
cd backend
cp .env.example .env      # set your DB password in DATABASE_URL
npm install               # runs prisma generate for you
npm run dev
```

It comes up on `http://localhost:3001` and the cron fires on boot, so you'll see something like:

```
info:  SLA cron scheduled: "* * * * *"
info:  Server listening on http://localhost:3001 (development)
error: SLA BREACH: ticket #3 "Export CSV not working" — escalated high → urgent
warn:  SLA WARNING: ticket #6 "Profile picture upload fails" — approaching SLA deadline
```

**Frontend:**

```bash
cd frontend
cp .env.example .env      # VITE_API_URL, defaults to localhost:3001
npm install
npm run dev               # http://localhost:5173
```

Open the dashboard at `http://localhost:5173` with the backend running.

## Config

Everything that might change between environments lives in `backend/.env` (there's a `.env.example` to copy):

| Variable | Default | What it does |
|---|---|---|
| `DATABASE_URL` | — | Prisma MySQL connection string, e.g. `mysql://root:pw@localhost:3306/support_tickets` (required) |
| `PORT` | `3001` | API port |
| `CORS_ORIGIN` | `http://localhost:5173` | Where the frontend runs |
| `CRON_SCHEDULE` | `* * * * *` | How often the SLA engine runs |
| `SLA_URGENT_HOURS` / `HIGH` / `MEDIUM` / `LOW` | `2` / `8` / `24` / `72` | SLA windows per priority |
| `SLA_WARNING_THRESHOLD` | `0.20` | Last 20% of the window counts as "at risk" |
| `LOG_LEVEL` | `info` | winston level |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | `900000` / `300` | Per-IP throttle on `/api` |

Frontend only needs `VITE_API_URL` (the backend base URL).

## The API

Standard REST, JSON in/out. Success responses are wrapped in `{ data: ... }` and errors in `{ error: { message, details? } }` so the frontend always knows what to expect.

- `POST   /api/tickets` — create one; the server works out `sla_due_at` from the priority
- `GET    /api/tickets` — list, with `status`, `priority`, `search`, `page`, `limit`
- `GET    /api/tickets/:id` — one ticket plus its comments and SLA events
- `PATCH  /api/tickets/:id/status` — change status (only legal transitions allowed)
- `PATCH  /api/tickets/:id/assign` — assign/reassign an agent
- `POST   /api/tickets/:id/comments` — add a comment
- `GET    /api/agents` — for the assign dropdown
- `GET    /api/dashboard/stats` — counts by status/priority + breached/at-risk

Bad input gets a `422` with the offending fields; missing records get a `404`. The status field is a state machine, not a free-for-all:

```
open        → in_progress, closed
in_progress → resolved, open
resolved    → closed
closed      → nothing (it's done)
```

So trying to reopen a closed ticket, for example, comes back `422` instead of quietly corrupting state.

## Database notes

Four tables: `agents`, `tickets`, `ticket_comments`, `sla_events`. Nothing exotic.

The foreign keys have deliberate delete behaviour. Deleting an agent shouldn't nuke their tickets, so `assigned_agent_id` is `ON DELETE SET NULL` — the ticket just goes unassigned. Comments and SLA events, on the other hand, only exist because of their ticket, so those cascade.

Indexes are picked around the two queries that actually run hot:

- `tickets (status, sla_due_at)` — the cron pulls `status IN ('open','in_progress')` ordered by due date every minute, and this composite lets it filter and read in order off one index.
- `tickets (status, priority)` — the list view filters on these; the left-to-right prefix also covers a status-only filter.
- `sla_events (ticket_id, event_type)` — this is the one the idempotency check hammers (see below), so it needs to be an index lookup, not a scan.
- `tickets (subject)` — helps `LIKE 'foo%'`. A leading-wildcard search (`%foo%`) still scans, which I've accepted for now.

`sla_due_at` is computed once when the ticket is created and stored — it never moves, so the cron never has to recompute it.

`sql/schema.sql` is the real source of truth for the schema. `prisma/schema.prisma` mirrors it (you can regenerate it from a running DB with `prisma db pull`); I went with Prisma mostly for the type safety and because it makes parameterised queries and transactions the default rather than something you have to remember to do.

## The SLA cron — why it's safe to re-run

This is the bit worth reading. The engine (`backend/src/cron/slaEngine.ts`) runs on a schedule (every minute by default) and also once immediately on startup. Each pass, for every open / in-progress ticket, it:

1. drops a **warning** event if the ticket's into the last 20% of its window and doesn't already have one,
2. drops a **breached** event once the deadline's gone, and
3. on that breach, bumps the priority up a notch (`low→medium→high→urgent`), flips `is_escalated`, and logs an **escalated** event. If it's already urgent there's nowhere to go, so it just marks it escalated and says so.

**Idempotency.** The assignment says they'll test running it twice, so this was the thing I was most careful about. Two guards: every event insert is gated by a "does this event already exist for this ticket?" check against `sla_events (ticket_id, event_type)`, and escalation is additionally gated by the `is_escalated` flag so a ticket can only ever climb once. The breach-and-escalate step runs inside a Prisma `$transaction`, so you can't end up with a breach event but no escalation, or vice versa. I tested it — running the engine back to back produces zero new rows on the second pass and doesn't touch priorities again.

**Missed runs.** Because the checks are all "is `now` past `sla_due_at`?" rather than "what changed since the last run?", downtime doesn't lose anything. If the server's off for six hours, everything that breached in that window gets caught on the next pass — and since it runs on startup too, that's immediately when it comes back up. The one honest caveat: if a ticket's *entire* warning window elapses while the server's down, it skips straight to breached without ever logging a separate warning. That's fine by me — the breach is the thing that matters.

Resolving or closing a ticket takes it out of the query, so it stops being processed the moment an agent's done with it.

One thing that bit me while building this: MySQL on my machine runs in IST, so `NOW()` in the seed was writing local time while Prisma reads `DATETIME` back as UTC — which made half the "breached" tickets look like they were due in the future. Switching the seed to `UTC_TIMESTAMP()` fixed it. The app itself is UTC end to end (Prisma + `new Date()`), so it's only the raw seed SQL that had to care.

## Frontend

Small React + TypeScript dashboard, three screens: a stats overview, the ticket list (filter by status/priority, debounced subject search, pagination, and rows tinted red/amber for breached/at-risk), and a ticket detail view with the comment thread, the SLA event timeline, and the controls to change status / assign / comment.

State is just `useState` inside a few custom data-fetching hooks (`useTickets`, `useTicket`, etc.), each handing back `{ data, loading, error, refetch }`. No Redux — it'd be overkill for three screens, and the hooks keep the fetching logic out of the components. Every screen has explicit loading and error states, so a dead backend gets you a "can't reach the server, retry?" box rather than a blank page.

## Testing

I'll be honest — there's no automated test suite yet, testing's been manual. There's a `backend/api.http` file that covers every endpoint including the error cases; open it with the VS Code REST Client extension and click through. To watch the SLA flow live, drop the `SLA_*` hours (or bump `SLA_WARNING_THRESHOLD`) in `.env`, restart, and watch the terminal go warning → breach → escalate.

## If I had more time

- Actual tests — the state machine and the SLA time math are pure functions begging for unit tests, and the cron idempotency deserves an integration test.
- Agent auth so it's not wide open.
- Push updates (WebSocket/SSE) so the SLA badges tick down without a refresh instead of only updating on refetch.
- Pull the cron out into its own worker process so the API and the engine can scale separately.
- A docker-compose so you don't have to set MySQL up by hand.
