# AI Workflow Sprint integration

- [x] Add a feature-level `/ai-workflow` route without replacing the existing VEXVANO LABS app shell or routes.
- [x] Preserve the existing analytics mount and add `book_click`, `whatsapp_click`, and `lead_submit` events for the workflow page.
- [x] Persist validated workflow enquiries through an insert-only `workflow_leads` table using the existing Supabase publishable-key environment variable, while keeping WhatsApp as the fallback. The migration is reviewed but intentionally not applied to the live database.
- [x] Add the AI Workflow Sprint link to the shared menu and change the homepage audit CTA to `/ai-workflow`.
- [x] Keep the static route manifest and route-generated metadata synchronized.
- [x] Run focused lint on changed source files, all 84 tests, and the production build successfully. Full repository lint remains blocked by pre-existing formatting violations in untouched files.
- [ ] Create a Vercel preview deployment only; do not promote to production.
