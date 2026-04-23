<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
</p>

<h1 align="center">Mini Campaign Manager</h1>

<p align="center">
  <i>A full-stack MarTech application for creating, managing, and tracking email campaigns — built as a yarn workspaces monorepo with a production-grade layered architecture.</i>
</p>

<br/>

## Tech Stack

<table align="center">
<thead>
<tr><th>Layer</th><th>Technology</th></tr>
</thead>
<tbody>
<tr><td><b>Monorepo</b></td><td>Yarn Workspaces</td></tr>
<tr><td><b>Backend</b></td><td>Node.js + Express + TypeScript</td></tr>
<tr><td><b>Database</b></td><td>PostgreSQL 16 + Sequelize v6</td></tr>
<tr><td><b>Auth</b></td><td>JWT + bcryptjs</td></tr>
<tr><td><b>Validation</b></td><td>Zod</td></tr>
<tr><td><b>Frontend</b></td><td>React 18 + TypeScript + Vite</td></tr>
<tr><td><b>Styling</b></td><td>Tailwind CSS v3 + Heroicons</td></tr>
<tr><td><b>State</b></td><td>Zustand (auth) + TanStack React Query v5 (server state)</td></tr>
<tr><td><b>Notifications</b></td><td>react-hot-toast</td></tr>
<tr><td><b>Testing</b></td><td>Jest + supertest</td></tr>
<tr><td><b>DX</b></td><td>Prettier + ESLint + concurrently</td></tr>
</tbody>
</table>

---

## Getting Started

### Option 1 — Docker (Recommended)

```bash
# Copy environment file, then start all services
cp .env.example .env
docker compose up --build
```

Once running:

| Service      | URL                   |
|--------------|-----------------------|
| Frontend     | http://localhost:5173 |
| Backend API  | http://localhost:4000 |

The backend automatically runs migrations and seeds demo data on startup.

### Demo Credentials

| Email                    | Password      |
|--------------------------|---------------|
| `admin@example.com`      | `password123` |
| `marketer@example.com`   | `password123` |

### Option 2 — Manual Setup

**Prerequisites:** Node.js 18+, Yarn 1.x, PostgreSQL 14+

```bash
# 1. Install all workspace dependencies from repo root
yarn install

# 2. Configure backend environment
cp packages/backend/.env.example packages/backend/.env
# Edit DATABASE_URL and JWT_SECRET

# 3. Run migrations and seed demo data
yarn db:migrate
yarn db:seed

# 4. Start both servers concurrently
yarn dev
```

---

## Available Scripts

```bash
yarn dev              # Start backend + frontend concurrently
yarn dev:backend      # Backend only (port 4000)
yarn dev:frontend     # Frontend only (port 5173)
yarn test             # Run all backend tests
yarn test:watch       # Tests in watch mode
yarn db:migrate       # Run pending migrations
yarn db:seed          # Seed demo data
yarn db:reset         # Drop all tables, re-migrate, re-seed
yarn typecheck        # TypeScript check both packages
yarn lint             # ESLint across all packages
yarn format           # Prettier write across all packages
yarn docker:start     # docker compose up
yarn docker:build     # docker compose up --build
yarn docker:stop      # docker compose down
```

---

## Architecture

```
Request -> Routes -> Zod Validation -> Controller -> Service -> Sequelize Model -> PostgreSQL
```

Each layer has a single responsibility:

- **Routes** — HTTP method + path binding, middleware attachment
- **Controllers** — Parse request, call service, format HTTP response
- **Services** — Pure business logic, no `req`/`res` access, independently testable
- **Models** — Sequelize class-based definitions with typed associations

---

## API Reference

### Authentication

| Method | Endpoint         | Auth | Description         |
|--------|------------------|------|---------------------|
| POST   | `/auth/register` | No   | Register a new user |
| POST   | `/auth/login`    | No   | Login, returns JWT  |

### Campaigns

| Method | Endpoint                  | Auth | Description                       |
|--------|---------------------------|------|-----------------------------------|
| GET    | `/campaigns`              | JWT  | List campaigns (paginated)        |
| POST   | `/campaigns`              | JWT  | Create campaign                   |
| GET    | `/campaigns/:id`          | JWT  | Campaign details + recipient list |
| PATCH  | `/campaigns/:id`          | JWT  | Update draft campaign             |
| DELETE | `/campaigns/:id`          | JWT  | Delete draft campaign             |
| POST   | `/campaigns/:id/schedule` | JWT  | Schedule a campaign               |
| POST   | `/campaigns/:id/send`     | JWT  | Initiate async send (202)         |
| GET    | `/campaigns/:id/stats`    | JWT  | Aggregated send/open stats        |

### Recipients

| Method | Endpoint       | Auth | Description                          |
|--------|----------------|------|--------------------------------------|
| GET    | `/recipients`  | JWT  | List all recipients                  |
| POST   | `/recipient`   | JWT  | Create or return existing recipient  |

---

## Database Schema

```
+-----------+       +--------------+       +----------------------+       +--------------+
|  users    |       |  campaigns   |       | campaign_recipients  |       |  recipients  |
+-----------+       +--------------+       +----------------------+       +--------------+
| id        |<--+   | id           |<------| campaign_id (PK)     |       | id           |
| email     |   +---| created_by   |       | recipient_id (PK) ---+------>| email        |
| name      |       | name         |       | sent_at              |       | name         |
| password  |       | subject      |       | opened_at            |       | created_at   |
| created_at|       | body         |       | status               |       +--------------+
+-----------+       | status       |       +----------------------+
                    | scheduled_at |
                    | created_at   |
                    | updated_at   |
                    +--------------+

Campaign status:   draft -> scheduled -> sending -> sent
Recipient status:  pending | sent | failed
```

---

## Index Rationale

| Index                  | Reason                                                          |
|------------------------|-----------------------------------------------------------------|
| `idx_users_email`      | Login lookup by email — every auth request hits this           |
| `idx_campaigns_created_by` | All list queries filter by owner                           |
| `idx_campaigns_status` | Status-based filtering for dashboards and scheduled jobs        |
| `idx_recipients_email` | Unique check + upsert on recipient create                       |
| `idx_cr_campaign_id`   | Stats aggregation and recipient list per campaign               |
| `idx_cr_status`        | Composite `(campaign_id, status)` for status breakdown counts   |

---

## Business Rules

| # | Rule                                                                             |
|---|----------------------------------------------------------------------------------|
| 1 | A campaign can only be edited or deleted when its status is `draft`              |
| 2 | `scheduled_at` must be a future timestamp                                        |
| 3 | Sending immediately transitions status to `sending`, returns 202, processes async|
| 4 | Once `sent`, campaign status cannot be changed                                   |
| 5 | Send simulation randomly marks each recipient `sent` (80%) or `failed` (20%)    |

---

## Building with Claude Code: A Practical Case Study

> This project was built with the assistance of [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview), Anthropic's agentic coding tool. The following is an honest account of where AI-assisted development worked well, where it fell short, and the principles I used to decide what to delegate versus what to retain as human responsibility.

### What Claude Code Did Well

Claude Code proved most effective at high-volume, structurally predictable work — tasks where the pattern is well-defined and the risk of a subtle semantic error is low.

1. **Full project scaffolding.** Claude Code generated the entire monorepo structure from a single prompt: root workspace config, `tsconfig.json` files for both packages, Dockerfile multi-stage builds, Docker Compose service definitions, ESLint + Prettier configuration, and the layered backend architecture. This boilerplate is tedious to write by hand yet follows established conventions — an ideal delegation target.

2. **Backend implementation.** All Sequelize models, SQL migration files, Express routes, controllers, services, Zod validation schemas, JWT middleware, and the Jest + Supertest test suite were generated by Claude Code. The layered architecture kept each file focused enough that generated output was predictable and reviewable.

3. **Async send simulation.** The `sendService.ts` detached-promise pattern — fire without `await`, return 202 immediately, process recipients with a random 80/20 outcome in the background, update campaign status to `sent` when done — was described in a single prompt and implemented correctly.

4. **Frontend component generation.** React Query hooks with automatic polling during `sending` status, Zustand auth store with localStorage persistence, Tailwind-styled components, conditional action buttons, and the `ConfirmDialog` inline component (replacing browser-native `confirm()` dialogs) were all produced cleanly.

5. **Infrastructure debugging.** Claude Code diagnosed and resolved three non-trivial infrastructure issues: Docker build context scope for yarn workspaces, nginx upstream DNS resolution timing, and a runtime path resolution error in the migration runner.

### Prompts Used and Their Outcomes

| Prompt | Outcome |
|--------|---------|
| *"Read the challenge PDF. Design a detailed implementation plan for the full monorepo. List every file to create and what each does. Do not write any code yet."* | A complete, step-by-step plan covering 19 implementation phases — reviewed and approved before any code was written. |
| *"Write sendService.ts. Simulate async sending: fetch pending CampaignRecipient rows, loop with 100ms delay, 80% sent / 20% failed, set campaign to sent when done. Controller fires this without await and returns 202 immediately."* | Correct implementation on the first attempt. No changes needed. |
| *"Write the CampaignDetail page. Stats section with StatsBar progress bars for send_rate and open_rate, recipient table with per-recipient status, CampaignActions with Schedule/Send/Delete buttons conditional on campaign status. Poll every 2 seconds when status is sending."* | Correct page structure. Required a follow-up to add the inline edit form for draft campaigns. |
| *"Check the entire codebase for any usage of browser-native dialogs: alert(), confirm(), prompt()."* | Found two `confirm()` calls in `CampaignActions.tsx`. Replaced both with an inline `ConfirmDialog` React component using an amber warning panel and explicit Confirm/Cancel buttons. |

### Where Claude Code Was Wrong

1. **Docker build context scope.** The initial Dockerfiles used `context: ./packages/backend`, which meant the build container could not see the root `yarn.lock` or the root `package.json` that defines the workspace. Yarn workspaces hoist all `node_modules` to the repo root, so the build failed with a missing lockfile error. Claude Code did not anticipate this during scaffolding. The fix required changing all build contexts to `.` (repo root) and adjusting `COPY` paths accordingly.

2. **`__dirname` in the migration runner.** `migrate.ts` used `path.join(__dirname, "../../migrations")` to locate SQL files. After TypeScript compilation, `__dirname` resolved to `/app/dist/src` — two levels away from the actual `/app/migrations` directory. The runner failed at startup with an `ENOENT` error. The correct approach is `path.join(process.cwd(), "migrations")`, which resolves relative to the working directory at runtime regardless of where the compiled file ends up.

3. **nginx upstream DNS resolution.** The initial `nginx.conf` used a static `proxy_pass http://backend:4000`. In Docker Compose, nginx resolves `upstream` directives at startup — before the backend container is reachable — causing a fatal `host not found in upstream` error. The fix was to use Docker's embedded DNS resolver (`resolver 127.0.0.11 valid=10s`) and assign the upstream to a variable (`set $backend_url http://backend:4000`), which defers resolution to request time.

4. **ESLint version compatibility.** The initial scaffolding installed ESLint v9 and `@typescript-eslint` v8, which require Node.js `>=20.19.0`. The environment runs Node 20.16, causing a startup error. Pinning to ESLint v8 and `@typescript-eslint` v7 — which support Node 18+ — resolved the issue.

5. **Stale React Query cache across user sessions.** React Query's in-memory cache persisted between logins from different accounts. Logging in as a second user displayed the first user's campaign data until the page was refreshed. Claude Code did not account for this multi-user scenario during initial implementation. The fix was adding `queryClient.clear()` calls on both login and logout.

### What I Chose to Retain as Human Responsibility

1. **Architecture review.** The layered architecture pattern, database schema design, index placement, foreign key constraints, and cascade rules were reviewed and approved before implementation. Architectural decisions have consequences that compound over time and require understanding the full system.

2. **Security-sensitive code.** JWT secret handling, password hashing configuration, the `requireAuth` middleware, and the Axios 401-interceptor auto-logout behavior were all manually verified. Security code demands human scrutiny because the cost of a subtle mistake is disproportionately high.

3. **Business rule changes.** When scope questions arose — such as whether a `scheduled` campaign should expose a delete button — the decision was made deliberately after evaluating the state machine implications, not accepted by default from generated output.

4. **This section.** The "How I Used Claude Code" section was not written by Claude Code. An AI tool writing its own evaluation produces neither honesty nor useful signal. The incidents described above are accurate — they are things that went wrong, required investigation, and were fixed through human judgment.

### Key Takeaways

| Insight | Detail |
|---------|--------|
| **AI excels at pattern-consistent, high-volume work** | Scaffolding, CRUD endpoints, component boilerplate, and validation schemas are ideal delegation targets |
| **AI struggles with environmental edge cases** | Build tooling, module resolution, Docker networking, and runtime path semantics required human debugging |
| **Define first, delegate second** | Having Claude produce a full plan before any code was written made it possible to catch architectural issues before they were embedded across dozens of files |
| **Review output before accepting it** | Generated code that looks correct is not the same as code that has been verified. Every file was read before being considered done |

---

<p align="center">
  <sub>Built for educational and demonstration purposes.</sub>
</p>
