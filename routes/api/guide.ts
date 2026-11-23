import { createFileRoute } from "@tanstack/react-router";

import { SYSTEM_PROMPT, createRateLimiter, localAnswer, sanitizeMessages } from "@/lib/guide-core";

// 20 questions per minute per visitor address (best effort: serverless instances do not share memory).
const allow = createRateLimiter(20, 60_000);

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

type Msg = { role: "user" | "assistant"; content: string };

/** Asks NVIDIA's hosted models (OpenAI-compatible API). Returns null on any problem. */
async function askNvidia(messages: Msg[]): Promise<string | null> {
  const key = process.env["NVIDIA_API_KEY"];
  if (!key) return null;
  try {
    const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env["NVIDIA_MODEL"] || "meta/llama-3.1-70b-instruct",
        max_tokens: 400,
        temperature: 0.3,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) {
      console.error("Guide: NVIDIA request failed", res.status);
      return null;
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error("Guide: NVIDIA request error", error);
    return null;
  }
}

/** Asks Claude. Returns null on any problem so the caller can fall back to the built-in answers. */
async function askClaude(messages: Msg[]): Promise<string | null> {
  const key = process.env["ANTHROPIC_API_KEY"];
  if (!key) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: process.env["ANTHROPIC_MODEL"] || "claude-haiku-5-5",
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      console.error("Guide: AI request failed", res.status);
      return null;
    }
    const data = (await res.json()) as { content?: { type?: string; text?: string }[] };
    const text = data.content?.find((c) => c.type === "text")?.text?.trim();
    return text || null;
  } catch (error) {
    console.error("Guide: AI request error", error);
    return null;
  }
}

export const Route = createFileRoute("/api/guide")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        if (!allow(ip)) return json({ error: "Too many questions. Please wait a minute." }, 429);

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid request." }, 400);
        }
        const messages = sanitizeMessages((body as { messages?: unknown } | null)?.messages);
        if (!messages) return json({ error: "Invalid request." }, 400);

        const reply = (await askNvidia(messages)) ?? (await askClaude(messages)) ?? localAnswer(messages[messages.length - 1]!.content);
        return json({ reply });
      },
    },
  },
});
