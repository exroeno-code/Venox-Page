# VEXON TECH — contributor notes

- Landing page sections live in `src/routes/index.tsx`; reusable visuals (canvas particle field, loader, word reveals) live in `src/components/vexon/` — this keeps the live canvas logic isolated and SSR-safe (browser APIs only inside effects).
- Vexon accounts: all Supabase calls go through `src/lib/auth-core.ts`; the client is loaded lazily in the browser only. Database changes go in new files under `supabase/migrations/`, and every table needs row-level security.
- Only the publishable Supabase key belongs in the app (`VITE_*` variables). Never commit `service_role` keys or `.env` files.
- The top bar (logo, menu, account button) is one shared component, `src/components/vexon/TopBar.tsx`. Use it on every page and add new menu links there. Use `<Wordmark />` wherever the VEXON TECH name appears.
- Leaders, roles and locations live in constants at the top of `src/routes/leadership.tsx`.
- Public contact details (emails, phone, WhatsApp, Instagram) live only in `src/lib/site-config.ts`. Contact and waitlist forms are in `src/lib/contact-core.ts` and `src/lib/waitlist-core.ts`; visitors can only insert rows (see the migrations).
- New pages use `<PageShell>`; add menu links in `src/components/vexon/TopBar.tsx`. Roadmap items must carry their true stage.
