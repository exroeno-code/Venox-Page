/**
 * VEXON Guide — core logic (no React, SSR-safe, no secrets).
 * Holds what the guide knows about the site, a built-in fallback answerer that needs no AI key,
 * and the checks the API route uses on incoming chat messages.
 */
import { LEVELS } from "./programmes";
import { SITE } from "./site-config";

export type GuideMessage = { role: "user" | "assistant"; content: string };

export const MAX_MESSAGES = 8;
export const MAX_CHARS = 500;

export const SUGGESTIONS = [
  "What is VEXON TECH?",
  "How can I express interest in learning programmes?",
  "Where can I find VEXON's community links?",
  "How do I contact you?",
] as const;

const programmeCount = LEVELS.reduce((n, l) => n + l.programmes.length, 0);

/** Plain-text facts the AI is allowed to answer from. Keep this in step with the site. */
export const SITE_FACTS = `
VEXON TECH is a proposed, builder-led venture in concept development. Its current focus is practical technology. A possible AI assistant for Kenyan small-business operators who handle customer enquiries is only a hypothesis; the concept is not built or validated. Responsible goods-based commerce is a later workstream under evaluation, not an active service. VEXON TECH is based in Kenya (Nairobi and Kakamega) and is being developed by Enosh Yeswa (CEO) and Vince Odhiambo (Executive); roles and structure remain subject to founder confirmation. Its slogan is "Useful ideas. Real-world progress." The name and launch timing are not confirmed. The current live offering is this information website; other workstreams must be described by their actual roadmap stage, not presented as launched services.

How VEXON TECH works: begin with a real problem or customer need; prioritize useful outcomes over novelty; communicate quality, availability, risks and responsibilities honestly; test, listen and improve using evidence; and build for long-term value for customers, collaborators and communities.
Current workstreams shown on the website: practical digital technology, later goods-based commerce under evaluation, learning programmes, and trading education. The assistant is an Idea and is not built or validated. Learning applications only express interest; classes, fees, accreditation and start dates are not confirmed. Trading education is a concept, not a confirmed live service. The roadmap is the source of truth for status.

Pages:
- Home (/): the brand, foundation, workstreams and principles.
- AI Assistant (/assistant): an AI assistant concept with a waitlist. Not live yet.
- Roadmap (/roadmap): plans and updates, each labelled with its true stage (Idea, Prototype, Pilot, Live).
- Goods Trade (/goods-trade): a later workstream under evaluation, not an active service. Goods, markets, terms and timing are undecided.
- Learning (/learning): online computer classes. Visitors choose a level (Degree, Diploma or Certificate), choose one of ${programmeCount} programmes, and submit an application. This is concept stage: an application is an expression of interest; classes, fees, accreditation and start dates are NOT confirmed.
- Trading (/trading): trading EDUCATION only (market mechanics; technical and fundamental analysis), concept stage. VEXON TECH does not give investment advice, sell signals, manage money, take deposits or endorse any broker; trading forex and CFDs carries a high risk of loss. Syllabus, fees and start dates are not confirmed.
- Community (/community): a page listing VEXON WhatsApp links. Direct visitors to the page for current details; do not imply that a group is actively available or monitored.
- Leadership (/leadership): the people behind VEXON TECH.
- Contact (/contact): a message form and public channels.
- Account (/auth): create an account or sign in; /profile lets signed-in people change their name.

Learning programmes:
${LEVELS.map((l) => `${l.label}: ${l.programmes.map((p) => p.name).join("; ")}`).join("\n")}

Contact: emails ${SITE.emails.join(" and ")}; phone/WhatsApp ${SITE.phone.display}; Instagram @${SITE.instagram.handle}.
Community links: group ${SITE.community.group}; channel ${SITE.community.channel}; trading group ${SITE.community.tradingGroup}.
`.trim();

export const SYSTEM_PROMPT = `You are the VEXON Guide, the friendly company-aware guide for VEXON TECH. Explain what the venture is exploring, how it says it works, what is currently live versus still a concept, and help visitors find the right site page or contact route. Speak as an informed guide, not as an unrelated general-purpose chatbot.

Rules:
- Answer ONLY from the facts below. If something is not in the facts (prices, fees, dates, accreditation, hiring, technical details, anything unknown), say it is not confirmed yet and point to the Contact page.
- Never invent offers, prices, start dates, qualifications or partnerships. Never claim VEXON TECH awards degrees.
- Be clear that VEXON TECH is a proposed venture in concept development, not a mature company with all workstreams launched. Use the roadmap for status and do not imply planned services are available now.
- Trading carries risk; never give financial or investment advice.
- Be brief: 1 to 4 short sentences. Plain text, no headings or bullet lists.
- To point to a page write a markdown link with a site path, for example [Learning](/learning). You may also link the WhatsApp links given in the facts.
- Reply in the visitor's language when you can.

FACTS:
${SITE_FACTS}`;

/** Validates the chat history sent by the browser. Returns clean messages or null. */
export function sanitizeMessages(input: unknown): GuideMessage[] | null {
  if (
    !Array.isArray(input) ||
    input.length === 0 ||
    input.length > MAX_MESSAGES
  )
    return null;
  const out: GuideMessage[] = [];
  for (const m of input) {
    if (m == null || typeof m !== "object") return null;
    const role = (m as { role?: unknown }).role;
    const content = (m as { content?: unknown }).content;
    if (
      (role !== "user" && role !== "assistant") ||
      typeof content !== "string"
    )
      return null;
    const text = content.trim();
    if (!text || text.length > MAX_CHARS * (role === "assistant" ? 4 : 1))
      return null;
    out.push({ role, content: text });
  }
  return out[out.length - 1]?.role === "user" ? out : null;
}

/** Simple in-memory limiter: at most `limit` calls per `windowMs` per key (best effort on serverless). */
export function createRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return function allow(key: string, now = Date.now()): boolean {
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= limit) {
      hits.set(key, recent);
      return false;
    }
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000)
      for (const [k, v] of hits)
        if (v.every((t) => now - t >= windowMs)) hits.delete(k);
    return true;
  };
}

const RULES: { test: RegExp; reply: string }[] = [
  {
    test: /\b(learn|class|classes|course|courses|degree|diploma|certificate|programme|program|apply|application|study|school|enrol|enroll)\b/i,
    reply: `You can express interest in a learning programme on the [Learning](/learning) page. An application is not confirmation that a class or place is available; fees, accreditation and start dates are not confirmed.`,
  },
  {
    test: /\b(trading|forex|cfd|invest|investing|investment|broker|signals?)\b/i,
    reply: `Our [Trading](/trading) page covers trading education: how markets work and how analysis is done. It is education only: we do not give investment advice, sell signals, manage money or endorse brokers, and trading carries a high risk of loss. You can also join the trading group on the [Community](/community) page.`,
  },
  {
    test: /\b(community|group|channel|whatsapp group)\b/i,
    reply: `The [Community](/community) page lists VEXON's WhatsApp links. Please check that page for current details. Trading carries risk and nothing shared there is financial advice.`,
  },
  {
    test: /\b(contact|email|phone|call|reach|message|instagram|whatsapp|number)\b/i,
    reply: `Use the [Contact](/contact) page to send a message. You can also email ${SITE.emails[0]}, call or WhatsApp ${SITE.phone.display}, or find us on Instagram @${SITE.instagram.handle}.`,
  },
  {
    test: /\b(assistant|waitlist|ai)\b/i,
    reply: `The AI assistant is a concept we are developing. You can join the waitlist on the [AI Assistant](/assistant) page. It is not live yet.`,
  },
  {
    test: /\b(roadmap|update|updates|stage|plan|plans|progress|launch)\b/i,
    reply: `The [Roadmap](/roadmap) shows our plans and updates, each labelled with its true stage: Idea, Prototype, Pilot or Live. Launch timing is not confirmed yet.`,
  },
  {
    test: /\b(goods|commerce|shop|buy|sell|store)\b/i,
    reply: `Goods-based commerce is a later workstream under evaluation, not an active service. See the [Goods Trade](/goods-trade) page; no goods are currently offered for sale.`,
  },
  {
    test: /\b(leader|leadership|founder|founders|team|ceo|who|enosh|vince)\b/i,
    reply: `VEXON TECH is built by Enosh Yeswa (CEO) and Vince Odhiambo in Kenya. Meet them on the [Leadership](/leadership) page.`,
  },
  {
    test: /\b(account|sign ?up|sign ?in|log ?in|register|profile|password)\b/i,
    reply: `Create an account or sign in on the [account page](/auth). Once signed in you can change your name on your profile.`,
  },
  {
    test: /\b(what|about|vexon|company|brand|do you do)\b/i,
    reply: `VEXON TECH is a proposed technology brand in concept development, based in Nairobi and Kakamega, Kenya: useful ideas and real-world progress. This site is its landing page. Start on the [home page](/) or see the [Roadmap](/roadmap).`,
  },
];

/** Answer used when no AI key is configured or the AI service is unavailable. */
export function localAnswer(question: string): string {
  for (const r of RULES) if (r.test.test(question)) return r.reply;
  return `I can help you find VEXON TECH information: the [Learning](/learning) page for expressions of interest, [Community](/community) links, the [Roadmap](/roadmap), the [AI Assistant](/assistant) concept, or [Contact](/contact). What would you like to know?`;
}
