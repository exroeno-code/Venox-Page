# VEXON TECH — Internal Site Overview

This repository contains the VEXON TECH information website. The site explains the brand, its workstreams, and ways visitors can express interest or get in touch. It is not itself a software product for public installation or reuse.

## Current positioning

VEXON TECH is a builder-led venture in concept development, based in Kenya. Its focus is useful ideas and real-world progress. The roadmap is the source of truth for the status of each workstream; do not describe an idea or planned offering as live.

The online forex trading workstream is at **Idea** stage. VEXON TECH does not currently provide a forex platform or brokerage, trading accounts, deposits, trade execution, signals, money management, broker endorsements, or personalized financial advice. Forex and CFDs carry a high risk of loss. The separate `/trading` page describes proposed trading education and is not financial advice.

## Main routes

| Area                 | Route               | Visitor-facing behavior                                                                                                                                                                                          |
| -------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home                 | `/`                 | Brand, foundation, principles, and workstreams.                                                                                                                                                                  |
| AI Assistant         | `/assistant`        | Concept page and waitlist; the future assistant is not yet a live offering.                                                                                                                                      |
| Online Forex Trading | `/forex-trading`    | Idea-stage concept page with explicit no-broker/no-live-service boundaries and a risk notice.                                                                                                                    |
| Legacy URL           | `/goods-trade`      | Redirects to `/forex-trading` so old bookmarks remain usable.                                                                                                                                                    |
| Roadmap              | `/roadmap`          | Initiatives labelled Idea, Prototype, Pilot, or Live; keep status aligned with reality.                                                                                                                          |
| Learning             | `/learning`         | Computing programmes and applications of interest; fees, accreditation, and dates are unconfirmed.                                                                                                               |
| Trading              | `/trading`          | Proposed trading education, with risk notice; no personalized investment advice.                                                                                                                                 |
| Community            | `/community`        | WhatsApp community group, official channel, and trading group.                                                                                                                                                   |
| Leadership           | `/leadership`       | People behind VEXON TECH.                                                                                                                                                                                        |
| Contact              | `/contact`          | Enquiry form and public channels.                                                                                                                                                                                |
| Accounts             | `/auth`, `/profile` | Supabase-backed email/password sign-up and sign-in (no email verification code), optional Google and WhatsApp sign-in, profile, and onboarding. Preferences are stored in the user's RLS-protected Supabase row. |

## Guide and onboarding

The VEXON TECH guide uses curated local answers first for common site questions, including page navigation, forex concept status, trading education, learning, roadmap, community, and contact details. Only unmatched questions call the configured NVIDIA chat service; that request has an 8-second timeout and falls back to the local answer set. The prompt is grounded in the current site facts and must not invent product details or provide investment advice.

The welcome tour is step-by-step and dismissible. Hovering the golden V may play a sound but must not open the guide; click or tap opens it. Keep the launcher comfortable to use with touch input.

The onboarding form offers online forex as a current interest. Existing `responsible_goods_trade` selections are retained as a legacy preference and remain editable; do not silently convert that historical value to a forex interest. The additive SQL change is in `supabase/migrations/20261126010000_online_forex_interest.sql`.

## Development

Set up the Supabase project, password-only email signup, optional providers, and deployment variables using [the Supabase auth setup guide](docs/SUPABASE_AUTH_SETUP.md). Never put privileged Supabase keys in client-side environment variables.

Use `bun run build`, `bun run lint`, and `bun run test` for local checks. The route tree is generated by the TanStack Start Vite plugin. The static page route inventory lives at `public/manus-routes.json`.
