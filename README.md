# VEXON TECH — Internal Site Overview

> Internal reference for the VEXON TECH website. This site represents the VEXON TECH brand and its current work; it is not a software product for public installation or reuse.

## What VEXON TECH does

VEXON TECH is a proposed technology brand in concept development, built by Enosh Yeswa and Vince Odhiambo in Kenya. Its focus is useful ideas and real-world progress. The website explains the brand, its workstreams, and ways people can express interest or get in touch.

The roadmap distinguishes live website features from ideas that are not yet operating services. In particular, the AI assistant, Goods Trade, learning classes, and trading education are concepts or planned offerings unless their current roadmap status says otherwise. An application or waitlist submission is an expression of interest, not confirmation of a class, service, fee, accreditation, or start date.

## How the site works

| Area | What visitors can do | Current behavior |
| --- | --- | --- |
| Home (`/`) | Learn about the VEXON TECH brand, its principles, and workstreams. | Brand and information page. |
| Roadmap (`/roadmap`) | Review progress and updates. | Items are marked Idea, Prototype, Pilot, or Live; keep the label aligned with actual status. |
| Learning (`/learning`) | Browse computing programmes by level and submit an application of interest. | Applications are validated and saved in Supabase. They do not guarantee a place or indicate confirmed course details. |
| AI Assistant (`/assistant`) | Read about the assistant concept and join its waitlist. | The future assistant is not itself a live offering; sign-ups are stored in Supabase. |
| VEXON Guide | Ask about VEXON TECH, its workstreams, the roadmap, or site information. | The `/api/guide` endpoint sends requests to NVIDIA when configured, then uses built-in company-aware answers if NVIDIA is unavailable. It is constrained to site facts and must not provide investment advice or invent unconfirmed details. |
| Trading (`/trading`) | Read about the proposed trading-education workstream and its risk notice. | Education only; no investment advice, trade signals, money management, deposits, or broker endorsements. |
| Goods Trade (`/goods-trade`) | Read about the goods-commerce concept. | No goods are represented as currently for sale. |
| Community (`/community`) | Follow links to VEXON WhatsApp groups and channel. | External community links. |
| Contact (`/contact`) | Send an enquiry. | The form validates the message and stores it in Supabase. |
| Accounts (`/auth`, `/profile`) | Create an account, sign in with email/password or Google, or request a WhatsApp phone OTP. | Supabase Auth manages sessions; profile names are stored in Supabase. |
| Leadership (`/leadership`) | Meet the people behind VEXON TECH. | Information page. |
| Privacy (`/privacy`) | Read the site's privacy information. | Describes the site's data practices. |

## Data and AI behavior

Supabase provides authentication and the Postgres-backed `profiles`, `contact_messages`, `waitlist`, and `course_applications` records. The site validates form values before inserting them. Database migrations under `supabase/migrations/` define the corresponding tables and access policies.

Copy `.env.example` to `.env.local` for local development. The client accepts `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; Vite also maps the Vercel Supabase integration's `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` values into those client variables. Only the publishable key is exposed to the browser. Google sign-in requires the Google provider and OAuth credentials to be configured in Supabase Auth, with the site URL allow-listed. WhatsApp phone OTP requires phone auth plus a Twilio or Twilio Verify WhatsApp sender configured in Supabase. Never put provider secrets or a Supabase service-role key in `VITE_*` variables.

The Guide uses NVIDIA's OpenAI-compatible chat API as its only external AI provider. If NVIDIA is not configured or is unavailable, the site uses built-in company-aware responses. `NVIDIA_API_KEY` remains server-side; the endpoint imposes message-size/history checks and a best-effort in-memory rate limit. The Guide answers only from maintained VEXON facts; it is not a general-purpose or financial assistant.

## Technology stack

- **Language and UI:** TypeScript, React 19.
- **Application framework and routing:** TanStack Start and TanStack Router, with server-side rendering.
- **Build and server output:** Vite and Nitro.
- **Styling and components:** Tailwind CSS 4, Radix UI primitives, and shared UI components.
- **Data and identity:** Supabase JavaScript client, Supabase Auth, and Supabase Postgres.
- **Guide provider:** NVIDIA hosted chat, with a built-in local fallback.
- **Hosting target:** Vercel (configured through Nitro/Vercel output).
- **Quality checks:** ESLint, Prettier, and Vitest.

## Code map

- `routes/` — page routes and the server endpoint for the Guide.
- `components/vexon/` — VEXON-specific page shell, navigation, effects, and guide UI.
- `components/ui/` — reusable interface components.
- `lib/` — feature logic, validation, Supabase access, programme data, site facts, and configuration.
- `supabase/migrations/` — database schema and row-level security policies.
- `public/` — site icons, leader images, and social preview images.
- `test/` — tests for routing and feature logic.

## Operational boundaries

Keep the roadmap truthful and update the Guide's facts when site behavior changes. Do not describe concepts as launched services or promise unconfirmed fees, dates, accreditation, partnerships, or outcomes. Trading content is educational only and must retain its risk disclaimer. Treat submissions and account data as private; do not copy user records or secrets into documentation or source control.

---

© 2026 VEXON TECH. All rights reserved.
