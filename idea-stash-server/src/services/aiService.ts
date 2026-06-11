import OpenAI from "openai";
import { env } from "../config/env.js";

export interface AiSummaryResult {
  summary: string;
  keyTakeaways: string[];
  concepts: string[];
}

let openai: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (!env.openaiApiKey) return null;
  if (!openai) {
    openai = new OpenAI({ apiKey: env.openaiApiKey });
  }
  return openai;
}

export function isAiAvailable(): boolean {
  return Boolean(env.openaiApiKey);
}

export async function generateContentSummary(input: {
  title: string;
  url: string;
  contentType: string;
  metadata?: Record<string, unknown>;
}): Promise<AiSummaryResult | null> {
  const client = getClient();
  if (!client) return null;

  const context = [
    `Title: ${input.title}`,
    `URL: ${input.url}`,
    `Type: ${input.contentType}`,
    input.metadata?.description
      ? `Description: ${input.metadata.description}`
      : "",
    input.metadata?.tweetText ? `Tweet: ${input.metadata.tweetText}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You summarize saved links for a personal knowledge base. Respond ONLY with valid JSON: {\"summary\":\"3-line summary\",\"keyTakeaways\":[\"...\",\"...\",\"...\"],\"concepts\":[\"...\",\"...\"]}",
        },
        { role: "user", content: context },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) return null;

    const parsed = JSON.parse(raw) as AiSummaryResult;
    return {
      summary: parsed.summary ?? "",
      keyTakeaways: parsed.keyTakeaways ?? [],
      concepts: parsed.concepts ?? [],
    };
  } catch (error) {
    console.error("AI summary generation failed:", error);
    return null;
  }
}

export async function semanticSearchQuery(
  query: string,
  items: { id: string; title: string; summary?: string; tags?: string[] }[],
): Promise<string[]> {
  const client = getClient();
  if (!client || items.length === 0) return [];

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            'Given a search query and a list of saved items, return JSON {"ids":["id1","id2"]} with the most relevant item IDs ordered by relevance. Max 20 results.',
        },
        {
          role: "user",
          content: JSON.stringify({ query, items }),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0,
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { ids?: string[] };
    return parsed.ids ?? [];
  } catch {
    return [];
  }
}
