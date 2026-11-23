# VEXON TECH — Landing Page

> **This repository is the website for VEXON TECH. It is not a product, a software library or an open-source project.**

This is the official promotional landing page for **VEXON TECH**, a proposed technology brand in concept
development, built by Enosh Yeswa and Vince Odhiambo in Kenya (Nairobi and Kakamega). It introduces the
brand and lets visitors get in touch, join a waitlist, apply for online computer classes and find our
WhatsApp community.

## What this is, and what it is not

- **It is** a single website that presents VEXON TECH and collects enquiries.
- **It is not** a product you can install, run for your own use or build on. Nothing here is sold or offered as software.
- **It is not** an open-source or community project. We are not accepting contributions, issues or pull requests, and no licence to copy, reuse or redistribute the code, design, name or images is granted.
- **The brand is at concept stage.** The name, structure and launch timing are still subject to founder
  confirmation. Roadmap items, the AI assistant, Goods Trade and the learning classes are plans, not live offerings.
  Classes, fees, accreditation and start dates are not confirmed.

The code is kept in this repository only so the site can be built and deployed to Vercel.

## What is on the site

| Page | Purpose |
| --- | --- |
| `/` | Landing page: brand, foundation, workstreams, principles |
| `/assistant` | AI assistant concept and waitlist |
| `/roadmap` | Roadmap and updates, each item labelled with its true stage |
| `/goods-trade` | Goods Trade "coming soon" page |
| `/learning` | Online computer classes: choose a level and programme, then apply |
| `/trading` | Trading education (concept stage): topics, risk and compliance notice, link to the trading group |
| `/community` | Links to our WhatsApp community group, channel and trading group |
| `/leadership` | The people behind VEXON TECH |
| `/contact` | Contact form and public channels |
| `/privacy` | Privacy notice (what we collect and why) |
| `/auth`, `/profile` | Visitor accounts (sign up, sign in, change name) |

Every page also has the **VEXON Guide**, a floating "Ask AI for guides" chat that helps visitors find their way around the site. It only answers from facts about the site (kept in `src/lib/guide-core.ts`) and does not give financial advice.

## Contact

Contact details are on the site's Contact page and kept in `src/lib/site-config.ts`.

## Technical notes (for the site's maintainers)

Built with [TanStack Start](https://tanstack.com/start) (React, SSR) on Vite and Nitro, Tailwind CSS and
shadcn/ui, Lenis smooth scrolling, [Supabase](https://supabase.com) (Auth and Postgres) and
[Vercel](https://vercel.com) hosting.

### 1. Supabase

1. Create a project at supabase.com.
2. In *SQL Editor*, run the files in `supabase/migrations/` in this order:
   1. `20261123000000_vexon_profiles.sql` (accounts)
   2. `20261123010000_vexon_contact_messages.sql` (contact form)
   3. `20261123020000_vexon_waitlist.sql` (AI assistant waitlist)
   4. `20261123030000_vexon_course_applications.sql` (learning applications)
3. In *Project Settings → API*, copy the Project URL and the publishable (anon) key.
4. In *Authentication → URL Configuration*, set *Site URL* to the live address and add
   `https://your-site.vercel.app/**` and `http://localhost:3000/**` under *Redirect URLs*
   (plus the custom domain, if any).
5. Optional Google sign-in: enable *Authentication → Providers → Google*, then set `VITE_ENABLE_GOOGLE_AUTH=true`.

Visitors can only add rows to the contact, waitlist and applications tables; nobody can read them through
the public API. Read them in Supabase under *Table Editor*: `contact_messages`, `waitlist`,
`course_applications`. The publishable key is public by design; data is protected by the row-level security
rules in the migrations. Never put a `service_role` key in this project.

### 2. AI guide (optional)

The guide works out of the box with built-in answers. To make it answer with AI, add a server-side
`NVIDIA_API_KEY` (from build.nvidia.com; optionally `NVIDIA_MODEL`, default `meta/llama-3.1-70b-instruct`) in Vercel *Environment Variables* and redeploy. Never
prefix it with `VITE_`, which would expose it to visitors. The `/api/guide` route limits message length and
rate-limits each visitor; set a spending limit on the key as well. If the key is missing or the AI service
fails, the guide falls back to the built-in answers.

### 3. Run locally

Requires [Bun](https://bun.sh) (or Node.js 22.12+).

```sh
cp .env.example .env.local   # then fill in the Supabase URL and key
bun install                  # refreshes bun.lock; commit the updated file
bun run dev
```

Other scripts: `bun run build`, `bun run preview`, `bun run lint`, `bun run test`.

### 4. Deploy to Vercel

1. Import the repository in Vercel (*Add New → Project*).
2. Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` and `VITE_SITE_URL` (your live address, used for share-preview images and the sitemap), plus `VITE_ENABLE_GOOGLE_AUTH` if used, for
   Production and Preview. They are read at build time, so redeploy after changing them.
3. Deploy. `vercel.json` already sets the install and build commands.

### Where things live

- `src/routes/` — one file per page
- `src/lib/site-config.ts` — public emails, phone, WhatsApp, Instagram and community links
- `src/lib/programmes.ts` — learning levels and programmes
- `src/lib/guide-core.ts` and `src/routes/api/guide.ts` — the AI guide (facts, fallback answers, API route)
- `src/components/vexon/` — brand visuals (particle field, loader, word reveals, top bar, smooth scroll)
- `src/lib/seo.ts` — share-preview image tags, `/sitemap.xml` and `/robots.txt` (generated by routes); images in `public/og/`
- `supabase/migrations/` — database schema

---

© 2026 VEXON TECH. All rights reserved.
