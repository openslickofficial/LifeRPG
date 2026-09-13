# ⚔️ Revel — Gamified Real-Life Productivity

> **Level up your life, one quest at a time.** Turn daily habits, personal goals, and real-world tasks into an engaging role-playing game with dynamic leveling, attributes, streaks, and an in-game cosmetic economy.

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ecf8e?style=flat&logo=supabase)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📖 About Revel

**Revel** bridges the gap between task management and gaming psychology. By framing everyday responsibilities as epic quests, it leverages intrinsic motivation, real-time positive feedback loops, and RPG character progression to help you beat procrastination and build lasting discipline.

Whether you are studying for exams, hitting the gym, writing code, or practicing an instrument, every completed task yields **Experience Points (XP)** and **Gold Coins**, elevating your core character attributes across **Intellect**, **Strength**, **Discipline**, and **Creativity**.

---

## 📸 Screenshots & UI Showcase

|     Character Dashboard & Stat Rings      |        Active Quests & Quest Modal        |
| :---------------------------------------: | :---------------------------------------: |
| ![Dashboard](./screenshots/dashboard.png) | ![Quests Board](./screenshots/quests.png) |

|      Level-Up Celebration Overlay       |          Shop & Cosmetic Themes          |
| :-------------------------------------: | :--------------------------------------: |
| ![Level Up](./screenshots/level_up.png) | ![Currency Shop](./screenshots/shop.png) |

> 💡 **Live Preview Mode**: Revel includes an instant evaluation mode (`?preview=true`) across all routes (`/dashboard?preview=true`, `/dashboard/quests?preview=true`, `/dashboard/shop?preview=true`, `/dashboard/attributes?preview=true`), enabling judges and reviewers to immediately test all interactive mechanics with sample state even before configuring live Supabase keys.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions, Turbopack, Route Handlers)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/) (Strict type-checking and end-to-end interface contracts)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with a curated design system (custom color tokens, CSS variables, glassmorphism)
- **Component Library**: [shadcn/ui](https://ui.shadcn.com/) (New York style) backed by headless [Radix UI](https://www.radix-ui.com/) accessible primitives
- **Animations**: [Framer Motion](https://www.framer.com/motion/) (micro-interactions, level-up particles, animated circular progress rings)
- **Database & Backend**: [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Atomic RPC Stored Procedures, Real-Time Auth)
- **Validation**: [Zod](https://zod.dev/) (Isomorphic schema validation on forms and server mutations)
- **Theme Engine**: `next-themes` (Dark/Light mode + custom cosmetic themes: _Arcane Violet_, _Cyberpunk Neon_, _Midnight Obsidian_)
- **Typography**: [Fontshare](https://www.fontshare.com/) — General Sans & Satoshi (hero display font), Fredoka (headings), Inter (body), JetBrains Mono (mono)
- **Rate Limiting**: Custom token-bucket sliding-window engine (`lib/rate-limit.ts`) with zero external infrastructure dependencies
- **Icons**: [Lucide React](https://lucide.dev/)

---

## ✨ Core Features

### 🛡️ 1. Character Progression & Leveling Engine

- **Mathematical Leveling Curve**: Uses a non-linear exponential formula:
  $$\text{XP Required}(L) = \lfloor 50 \times L^{1.5} \rfloor$$
- **Multi-Level Rollover**: Handles multi-level jumps when completing high-reward quests, rolling leftover XP seamlessly into consecutive levels.
- **Celebration Modal**: Fullscreen particle confetti, animated badge transitions, stat summary, and celebratory sound-ready visual cues upon leveling up.
- **Circular SVG Progress Ring**: Framer Motion-driven radial meter tracking exact percentage progress to the next rank.

### 📜 2. Quests Management (Tasks CRUD)

- **Attribute-Linked Tasks**: Quests contribute directly to corresponding attribute stats: _Intellect_, _Strength_, _Discipline_, or _Creativity_.
- **Difficulty Multipliers**:
  - _Easy_: 10 XP / 2 Coins
  - _Medium_: 25 XP / 5 Coins
  - _Hard_: 50 XP / 10 Coins
- **Zod-Powered Validation**: Real-time client and server validation with accessible inline error alerts and ISO due date constraints.
- **Filtering & Search**: Instant categorization by Active, Completed, or Attribute tag.

### 🧬 3. Core Attributes & Mastery Perks

- Dedicated attribute progression tracking individual ranks and XP for each life discipline.
- Milestone perk unlocks at Levels 5, 10, and 25 with visual unlock status.

### 🔥 4. Visible Streak System

- **Dynamic Flame Intensity**: Visual flame indicators scale and glow based on streak milestones (Bronze, Silver, Gold at 7+ and 30+ days).
- **7-Day Activity Matrix**: Row of the past 7 days displaying completed activity.
- **Non-Punitive Decay**: Gentle encouragement nudges rather than harsh demotions if a day is missed.

### 🪙 5. Shop & Economy

- **Earn & Spend Gold**: Gain coins solely by accomplishing real-world tasks.
- **Cosmetic Unlocks**: Purchase custom interface themes (_Cyberpunk Neon_, _Arcane Violet_, _Midnight Obsidian_) and character titles (_Novice_, _Grandmaster_).
- **Atomic Balance Verification**: Prevents double-purchasing or negative coin balances via database RPC transactions.

### ♿ 6. Accessibility & Mobile Resilience (WCAG 2.1 AA)

- **100% Keyboard Accessible**: Logical Tab indexing, visible focus rings using active theme `--ring`, and Radix UI focus trapping.
- **Screen Reader Support**: `<Label>` associations, `role="radiogroup"`, `role="tablist"`, and `aria-live="polite"` dynamic notification regions.
- **Adaptive Responsive Layout**: Custom bottom navigation bar on mobile viewports ($\ge 44\times 44\text{px}$ touch targets), 2-column tablet reflow, and 4-column desktop grid.
- **Resilience**: Offline banner detection (`components/OfflineBanner.tsx`) and root/dashboard error boundaries with retry mechanisms.

---

## 🚀 Getting Started

Follow these steps to run Revel locally on your machine:

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18.17 or later recommended)
- `npm`, `pnpm`, or `yarn`
- A free [Supabase](https://supabase.com/) account (or Docker for local Supabase)

### 2. Clone the Repository

```bash
git clone https://github.com/your-username/revel.git
cd revel
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Copy the `.env.example` file to create your local `.env.local`:

```bash
cp .env.example .env.local
```

Open `.env.local` and add your Supabase project credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Initialize the Database Schema

1. Go to your **[Supabase Dashboard](https://supabase.com/dashboard)** and select your project.
2. Navigate to the **SQL Editor** in the left sidebar.
3. Open [`supabase/full_schema.sql`](./supabase/full_schema.sql) in your code editor, copy its contents, paste into the Supabase SQL Editor, and click **Run**.
   _(Alternatively, run the migration files in [`supabase/migrations/`](./supabase/migrations/) in numerical order)._
4. _(Optional)_ Run [`supabase/seed.sql`](./supabase/seed.sql) to populate initial cosmetic shop items and default badges.

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Tip**: You can immediately jump into the dashboard preview at `http://localhost:3000/dashboard?preview=true`.

---

## 🔑 Environment Variables Reference

| Variable Name                   | Description                           | Source / How to Obtain                                                                                                           | Required?                  |
| ------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase API URL endpoint             | Supabase Dashboard $\rightarrow$ **Project Settings** $\rightarrow$ **API** $\rightarrow$ **Project URL**                        | **Yes** (for live backend) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anonymous API key              | Supabase Dashboard $\rightarrow$ **Project Settings** $\rightarrow$ **API** $\rightarrow$ **Project API Keys** (`anon` `public`) | **Yes** (for live backend) |
| `NEXT_PUBLIC_APP_URL`           | Canonical app URL for OAuth redirects | Your production URL (e.g. `https://revel.vercel.app`). Defaults dynamically to `window.location.origin` if omitted.           | Optional                   |
| `UPSTASH_REDIS_REST_URL`        | Upstash Redis REST endpoint           | Upstash Console $\rightarrow$ **Databases** $\rightarrow$ **REST API** (Optional for distributed multi-region rate-limiting)     | Optional                   |
| `UPSTASH_REDIS_REST_TOKEN`      | Upstash Redis REST Token              | Upstash Console $\rightarrow$ **Databases** $\rightarrow$ **REST API**                                                           | Optional                   |

> 🔒 **OAuth Note**: In accordance with modern security standards, Google and GitHub OAuth client secrets are configured directly in your Supabase Dashboard under **Authentication** $\rightarrow$ **Providers**. No client secrets are stored or exposed in this repository.

---

## 📜 Available Scripts

| Command                | Description                                                 |
| ---------------------- | ----------------------------------------------------------- |
| `npm run dev`          | Starts local Next.js development server with Turbopack      |
| `npm run build`        | Generates an optimized production build                     |
| `npm run start`        | Starts the production server                                |
| `npm run lint`         | Runs ESLint 9 checks across all source files                |
| `npm run format`       | Formats all code files using Prettier                       |
| `npm run format:check` | Verifies code formatting compliance without modifying files |

---

## 🌐 Deployment

### Deploying to Vercel

Revel is optimized for zero-configuration deployment on Vercel:

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Import the repository into [Vercel](https://vercel.com/new).
3. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**. Vercel will automatically build and serve the App Router application.
5. In your **Supabase Dashboard** under **Authentication** $\rightarrow$ **URL Configuration**, add your Vercel URL (e.g. `https://your-app.vercel.app/auth/callback`) to the **Redirect URLs** whitelist.

---

## 📋 Hackathon Disclosures & Attributions

Per hackathon competition guidelines, the following disclosures and attributions are provided:

- **Third-Party Libraries**:
  - [Next.js](https://nextjs.org/) (Vercel) & [React](https://react.dev/)
  - [Tailwind CSS](https://tailwindcss.com/) & `@tailwindcss/postcss`
  - [shadcn/ui](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/) accessible primitives
  - [Framer Motion](https://www.framer.com/motion/) for fluid motion physics
  - [Lucide Icons](https://lucide.dev/) for clean UI iconography
  - [Supabase JS & SSR SDKs](https://supabase.com/) for authentication and database management
  - [Zod](https://zod.dev/) for type-safe runtime validations
  - [next-themes](https://github.com/pacocoursey/next-themes) for theme switching
  - [Fontshare](https://www.fontshare.com/) — General Sans & Satoshi display fonts (free for commercial use via CDN)
- **Media Assets**:
  - Hero cinematic background video (`/public/hero.mp4`) — original project asset used as ambient background with scrim overlay
  - Blob companion illustrations — original project character assets
- **AI Development Tools**:
  - **Google Antigravity IDE / Gemini AI**: Utilized during development as an intelligent pair programmer for rapid scaffolding, refactoring, SQL migration crafting, and WCAG accessibility verification.
- **Design Inspiration**:
  - Inspired by the gamified mechanics of _Habitica_, the hunter level-up aesthetics of _Solo Leveling_, and the typography and polish of modern dark-mode developer tools like _Linear_. All UI implementations, styles, CSS variable mappings, and components are original custom code.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
