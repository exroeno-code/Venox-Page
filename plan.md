# AI Workflow Sprint integration plan

## Implementation

Add the AI Workflow Sprint as a feature-level TanStack Start route at `/ai-workflow` inside the existing VEXVANO LABS application. Reuse the existing root shell, analytics mount, fonts, dark palette, logo conventions, shared UI accordion, `SITE` contact settings, and Supabase publishable-key environment variable. Do not replace the generated route tree, root shell, homepage, or package configuration with the standalone ZIP project.

The page will include the adapted hero, process, use cases, pricing, trust, FAQ, and lead form sections. Lead validation will use the already-installed Zod and Supabase packages. Persistence is best effort through the new insert-only `workflow_leads` table; WhatsApp remains the visitor-facing handoff if Supabase is unavailable.

## Design

Candidate styles: editorial technical dossier (0.07), cinematic dark service page (0.86), cheerful startup landing page (0.07). Choose the cinematic dark service page to match the existing VEXVANO LABS visual language.

Design movement: cinematic technical editorial with oversized uppercase typography, restrained motion, warm gold signal color, and quiet card surfaces.

Core principles: clear commercial scope; human review over automation hype; strong contrast and readable form controls; reuse of the existing brand system instead of introducing a competing visual identity.

Color philosophy: the existing gold glow is the action and trust signal, while the dark blue-black field keeps the page aligned with the main site and gives the workflow steps room to breathe.

Layout paradigm: tall editorial sections with alternating dense lists and open whitespace, rather than a generic centered SaaS grid.

Signature elements: gold glow actions, mono eyebrow labels, and a circuit-inspired hero texture with the existing V mark treatment.

Interaction philosophy: every action explains its next step; booking is explicit, WhatsApp is a human fallback, and the form never claims a lead was saved when persistence is unavailable.

Animation: keep transitions subtle and respect reduced-motion preferences inherited from the existing app; no essential content depends on animation.

Typography system: reuse Archivo for display headings, Inter Tight for body copy, and JetBrains Mono for labels and metadata.

Brand essence: VEXVANO LABS helps Kenyan businesses move useful ideas toward real-world progress; practical, responsible, builder-led.

Brand voice: direct, grounded, and clear about scope. Example lines: “Make repetitive business work easier with practical AI.” and “Human-led setup. Clear scope. No guaranteed profits.”

Wordmark and logo: keep the existing VEXVANO LABS wordmark and local logo assets; do not use the ZIP’s missing Lovable-hosted asset.

## Project structure

- `components/workflow/WorkflowPage.tsx`: page sections and lead form.
- `lib/workflow-config.ts`: booking configuration.
- `lib/workflow-leads.ts`: schema, WhatsApp message, and best-effort persistence.
- `routes/ai-workflow.tsx`: route metadata and page entry.
- `supabase/migrations/20261127010000_workflow_leads.sql`: additive RLS migration.
- `public/manus-routes.json`: static route inventory.
- Existing `routes/index.tsx` and `components/vexon/TopBar.tsx`: homepage CTA and global menu links.
