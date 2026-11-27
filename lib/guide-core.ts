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
  "What is the foreign exchange trading idea?",
  "Are you a live foreign exchange broker?",
  "Where can I find trading education?",
] as const;

const programmeCount = LEVELS.reduce((n, l) => n + l.programmes.length, 0);

/** Plain-text facts the AI is allowed to answer from. Keep this in step with the site. */
export const SITE_FACTS = `
VEXON TECH is a proposed, builder-led venture in concept development, exploring practical digital technology and foreign exchange trading to turn useful ideas into real-world progress. It is based in Kenya (Nairobi and Kakamega) and is being developed by Enosh Yeswa (CEO) and Vince Odhiambo (Executive); roles and structure remain subject to founder confirmation. Its slogan is "Useful ideas. Real-world progress." The name and launch timing are not confirmed. The current live offering is this information website; other workstreams must be described by their actual roadmap stage, not presented as launched services.

How VEXON TECH works: begin with a real problem or customer need; prioritize useful outcomes over novelty; communicate quality, availability, risks and responsibilities honestly; test, listen and improve using evidence; and build for long-term value for customers, collaborators and communities.
Current workstreams shown on the website: practical digital technology (including an AI assistant concept and proposed online computing classes), a foreign exchange trading concept, and trading education. The assistant, foreign exchange trading concept, classes and trading education are not confirmed live services. The foreign exchange trading concept is at Idea stage; no trading platform, broker, trading account, deposit, transaction execution, signals or personalized financial advice is offered by VEXON TECH. Product scope, markets, technology, operators, regulatory status and timing are not confirmed. Foreign exchange trading and CFDs carry a high risk of loss. The roadmap is the source of truth for each workstream's status.

Pages:
- Home (/): the brand, foundation, workstreams and principles.
- AI Assistant (/assistant): an AI assistant concept with a waitlist. Not live yet.
- Roadmap (/roadmap): plans and updates, each labelled with its true stage (Idea, Prototype, Pilot, Live).
- Foreign exchange trading (/forex-trading): an early concept only, not a live brokerage or trading platform.
- Learning (/learning): online computer classes. Visitors choose a level (Degree, Diploma or Certificate), choose one of ${programmeCount} programmes, and submit an application. This is concept stage: an application is an expression of interest; classes, fees, accreditation and start dates are NOT confirmed.
- Trading (/trading): trading EDUCATION only (market mechanics; technical and fundamental analysis), concept stage. VEXON TECH does not give investment advice, sell signals, manage money, take deposits or endorse any broker; trading foreign exchange and CFDs carries a high risk of loss. Syllabus, fees and start dates are not confirmed.
- Community (/community): WhatsApp community group, official channel and trading group.
- Leadership (/leadership): the people behind VEXON TECH.
- Contact (/contact): a message form and public channels.
- Account (/auth): create an account or sign in.

Learning programmes:
${LEVELS.map((l) => `${l.label}: ${l.programmes.map((p) => p.name).join("; ")}`).join("\n")}

Contact: emails ${SITE.emails.join(" and ")}; phone/WhatsApp ${SITE.phone.display}; Instagram @${SITE.instagram.handle}.
Community links: group ${SITE.community.group}; channel ${SITE.community.channel}; trading group ${SITE.community.tradingGroup}.
`.trim();

export const SYSTEM_PROMPT = `You are the friendly, company-aware VEXON TECH website guide. Help visitors understand the actual site content and find the right page. The current live offering is this information website; the foreign exchange trading workstream is only an idea.

Rules:
- Answer only from the facts below. If a detail is not confirmed, say so and link to the Contact page; do not guess.
- Never invent offers, prices, start dates, qualifications or partnerships. Never claim VEXON TECH awards degrees.
- Do not imply planned services are live. VEXON TECH is not a foreign exchange broker and does not offer accounts, deposits, trade execution, signals or financial advice.
- Never provide a trade recommendation, forecast, price target or personalized financial/investment advice. State that foreign exchange trading/CFDs carry a high risk of loss.
- Be brief: 1 to 3 short sentences, plain text, no headings or bullets.
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
    test: /\b(forex|foreign exchange|fx|online trading|trading platform)\b/i,
    reply: `The VEXON TECH [foreign exchange trading concept](/forex-trading) is still an idea, not a live broker or trading platform. No accounts, deposits, trades, signals or financial advice are available; scope and regulatory status are not confirmed. Foreign exchange trading and CFDs carry high risk. For education, see [Trading](/trading).`,
  },
  {
    test: /\b(trading|invest|investing|investment|broker|signals?)\b/i,
    reply: `Our [Trading](/trading) page is about education: market mechanics and how analysis is done. VEXON TECH is not a broker and does not offer accounts, deposits, trade execution, signals or investment advice; foreign exchange trading and CFDs carry high risk. The separate [foreign exchange trading concept](/forex-trading) is not live.`,
  },
  {
    test: /\b(learn|class|classes|course|courses|degree|diploma|certificate|programme|program|apply|application|study|school|enrol|enroll)\b/i,
    reply: `You can choose a level (Degree, Diploma or Certificate), pick one of our ${programmeCount} computing programmes and apply on the [Learning](/learning) page. It is concept stage: an application is an expression of interest, and fees, accreditation and start dates are not confirmed yet.`,
  },
  {
    test: /\b(community|group|channel|whatsapp group)\b/i,
    reply: `Join us on WhatsApp from the [Community](/community) page: the community group, our official channel and the trading group. Trading carries risk and nothing shared there is financial advice.`,
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
    test: /\b(page|pages|website|site|navigate|navigation|menu)\b/i,
    reply: `Use the site menu to explore [Home](/), the [Roadmap](/roadmap), [Foreign exchange trading](/forex-trading), [Trading education](/trading), [Learning](/learning), the [Community](/community), and [Contact](/contact).`,
  },
  {
    test: /\b(leader|leadership|founder|founders|team|ceo|who|enosh|vince)\b/i,
    reply: `VEXON TECH is built by Enosh Yeswa (CEO) and Vince Odhiambo in Kenya. Meet them on the [Leadership](/leadership) page.`,
  },
  {
    test: /\b(account|sign ?up|sign ?in|log ?in|register|profile|password)\b/i,
    reply: `Create an account or sign in on the [account page](/auth).`,
  },
  {
    test: /\b(what|about|vexon|company|brand|do you do)\b/i,
    reply: `VEXON TECH is a proposed technology brand in concept development, based in Nairobi and Kakamega, Kenya: useful ideas and real-world progress. This site is its landing page. Start on the [home page](/) or see the [Roadmap](/roadmap).`,
  },
];

/** Returns an immediate curated reply when the question matches known site content. */
export function instantLocalAnswer(question: string): string | null {
  for (const rule of RULES) if (rule.test.test(question)) return rule.reply;
  return null;
}

/** Answer used when no AI key is configured or the AI service is unavailable. */
export function localAnswer(question: string): string {
  return (
    instantLocalAnswer(question) ??
    `I can help with VEXON TECH: the [foreign exchange trading concept](/forex-trading), [Trading](/trading) education, [Learning](/learning), the [Community](/community), the [Roadmap](/roadmap), the [AI Assistant](/assistant), and [Contact](/contact). What would you like to know?`
  );
}
