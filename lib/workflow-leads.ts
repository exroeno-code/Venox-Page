import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export const PACKAGES = [
  "AI Workflow Audit",
  "AI Workflow Sprint",
  "Team Package",
  "Not sure yet",
] as const;

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  business: z.string().trim().min(2, "Enter your business name").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ]{9,16}$/, "Enter a valid phone number"),
  email: z.union([
    z.literal(""),
    z.string().trim().email("Enter a valid email").max(255),
  ]),
  task: z
    .string()
    .trim()
    .min(5, "Tell us the task you want to make easier")
    .max(1000),
  package: z.enum(PACKAGES),
});

export type Lead = z.infer<typeof leadSchema>;

export function leadMessage(lead: Lead) {
  return `Hello VEXVANO LABS, I'm ${lead.name} from ${lead.business}. Interested in: ${lead.package}.\nTask: ${lead.task}\nPhone: ${lead.phone}${lead.email ? `\nEmail: ${lead.email}` : ""}`;
}

/** Best-effort persistence. WhatsApp remains the visitor-facing fallback. */
export async function saveLead(lead: Lead): Promise<boolean> {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as
    string | undefined;
  if (!url || !key) return false;
  try {
    const client = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await client.from("workflow_leads").insert({
      name: lead.name,
      business: lead.business,
      phone: lead.phone,
      email: lead.email || null,
      task: lead.task,
      package: lead.package,
      source: "ai-workflow-page",
    });
    return !error;
  } catch {
    return false;
  }
}
