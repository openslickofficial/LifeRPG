# Revel

> Turn your to-do list into an RPG.

🔗 Live Demo: https://revel-rpg.vercel.app

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ecf8e?style=flat&logo=supabase)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## About Revel

Revel is a gamified productivity app that turns everyday tasks into quests, character progression, and reward loops. It tackles the problem of delayed gratification in productivity tools by making progress visible, motivating, and immediate: users complete real-world actions, gain XP, unlock upgrades, and build momentum through streaks, loot, and level-ups.

This project was built as a hackathon submission for Tech Zephyr 4.0 under the Life RPG problem statement, focused on turning habit-building and task execution into a playful but disciplined growth system.

---

## Tech Stack

This project was verified against the actual dependencies in package.json and current app setup:

- Framework: Next.js 16 (App Router, TypeScript)
- Styling: Tailwind CSS, shadcn/ui
- Fonts: General Sans + Satoshi via Fontshare, with Fredoka for headings and Inter + JetBrains Mono used in the app font setup
- Animation: Framer Motion
- Database & Auth: Supabase (Postgres, Row Level Security, Google/GitHub social auth support)
- Validation: Zod
- Rate Limiting: Upstash Redis with @upstash/ratelimit and @upstash/redis
- Deployment: Vercel

---

## Features

- Social authentication with Google and GitHub via Supabase Auth
- XP and leveling system with a non-linear progression curve
- Four core attributes tied to task categories: Intellect, Strength, Discipline, and Creativity
- Quest/task system with difficulty tiers and timed work sessions
- Start, pause, resume, and complete flows for active task sessions
- Streak tracking with shield/comeback gameplay mechanics
- Variable rewards, combo multipliers, critical-hit styling, and loot drops
- Daily quest rotation and structured gameplay loop
- Currency-based shop with purchasable themes and cosmetics
- Anti-cheat protections including server-authoritative timing, diminishing returns on repetitive tasks, daily caps, and anomaly throttling
- Five illustrated companion characters with idle, happy, and sad states
- Full accessibility support including keyboard navigation, screen reader labels, reduced-motion handling, and responsive layouts
- Responsive UI designed for desktop, tablet, and mobile use

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Web Hackathon_IITB
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the sample file to your local environment file:

```bash
cp .env.example .env.local
```

Then fill in the required values in `.env.local`.

### 4. Set up the Supabase database

This project is configured around manual schema setup in the Supabase SQL Editor rather than a repository-local `supabase db push` workflow. The actual SQL schema is stored in:

- `supabase/full_schema.sql`
- `supabase/seed.sql`
- `supabase/migrations/`

Recommended setup:

1. Open your Supabase project in the Supabase Dashboard.
2. Go to SQL Editor.
3. Run the contents of `supabase/full_schema.sql`.
4. Optionally run `supabase/seed.sql` to add starter shop data.
5. If you prefer migration files, run the SQL in `supabase/migrations/` in order.

### 5. Run the app

```bash
npm run dev
```

Open the local app in your browser at:

```text
http://localhost:3000
```

---

## Environment Variables

This table matches the real `.env.example` file currently present in the repo.

| Variable | Description | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard > Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key | Supabase Dashboard > Project Settings > API |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint | Upstash Console > your database > REST API |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token | Upstash Console > your database > REST API |
| `NEXT_PUBLIC_APP_URL` | Deployed app URL used for app-level redirects | Your Vercel deployment URL |

---

## OAuth Setup Note

Google and GitHub OAuth must be configured with redirect URIs that match the deployed app URL, usually in the format:

```text
https://your-domain/auth/callback
```

This needs to be added in:

- each provider's developer console (Google / GitHub)
- Supabase Auth > URL Configuration

This is a common setup gotcha and is important for both local debugging and production deployment.

---

## Screenshots

> Screenshots have not been added to the repo yet. Placeholder image paths are included below and should be replaced with the final assets before submission.

```md
![Dashboard](./screenshots/dashboard.png)
![Quests](./screenshots/quests.png)
![Level Up](./screenshots/level_up.png)
![Shop](./screenshots/shop.png)
```

---

## Disclosures

- Third-party services and libraries used:
  - Supabase for auth and database services
  - Upstash Redis and Upstash Rate Limit for distributed rate limiting
  - shadcn/ui component primitives
  - Framer Motion for animation
  - Fontshare fonts (General Sans, Satoshi)
- No external UI template or boilerplate codebase was used beyond shadcn/ui's component primitives.
- UI direction was shaped by modern dark-mode productivity dashboards and game-like dashboard aesthetics, but the implementation is custom-built in this repository.
- No explicit AI tooling metadata is stored in the repo itself; any AI-assisted development was informal and not persisted as project configuration.

---

## Known Limitations / Future Work

This version intentionally scopes the project to a hackathon-ready MVP.

- Admin dashboard is not implemented yet and remains future work.
- A full boss battle or PvP mechanic is not a live gameplay feature in the current build; any teaser content is conceptual rather than playable.
- Some deeper progression systems and moderation tools are intentionally deferred for later development.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
