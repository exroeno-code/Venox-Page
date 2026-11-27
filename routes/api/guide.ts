import { createFileRoute } from "@tanstack/react-router";

import {
  SYSTEM_PROMPT,
  createRateLimiter,
  instantLocalAnswer,
  localAnswer,
  sanitizeMessages,
} from "@/lib/guide-core";

// 20 questions per minute per visitor address (best effort: serverless instances do not share memory).
const allow = createRateLimiter(20, 60_000);

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}

type Msg = { role: "user" | "assistant"; content: string };

/** Uses NVIDIA's hosted chat API. Returns null on any problem so the local VEXVANO LABS answers can take over. */
async function askNvidia(messages: Msg[]): Promise<string | null> {
  const key = process.env["NVIDIA_API_KEY"];
  if (!key) return null;
  const configuredModel =
    process.env["NVIDIA_MODEL"] || "nemotron-3.5-lightning-30b-a3b";
  const model = configuredModel.includes("/")
    ? configuredModel
    : `nvidia/${configuredModel}`;
  try {
    const res = await fetch(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          max_tokens: 180,
          temperature: 0.2,
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        }),
        signal: AbortSignal.timeout(8_000),
      },
    );
    if (!res.ok) {
      console.error("Guide: NVIDIA request failed", res.status);
      return null;
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error("Guide: NVIDIA request error", error);
    return null;
  }
}

export const Route = createFileRoute("/api/guide")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          "unknown";
        if (!allow(ip))
          return json(
            { error: "Too many questions. Please wait a minute." },
            429,
          );

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Invalid request." }, 400);
        }
        const messages = sanitizeMessages(
          (body as { messages?: unknown } | null)?.messages,
        );
        if (!messages) return json({ error: "Invalid request." }, 400);

        const question = messages[messages.length - 1]!.content;
        const knownAnswer = instantLocalAnswer(question);
        if (knownAnswer) return json({ reply: knownAnswer });

        const reply = (await askNvidia(messages)) ?? localAnswer(question);
        return json({ reply });
      },
    },
  },
});
