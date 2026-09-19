/**
 * Gemini-backed assist for the compose desk: summarize, critique, proofread.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

export type AiAssistAction = "summarize" | "critique" | "proofread";

const ACTIONS = new Set<AiAssistAction>([
  "summarize",
  "critique",
  "proofread",
]);

const MAX_CONTENT_CHARS = 12_000;
const SUMMARY_MAX_CHARS = 160;

export function isAiConfigured(): boolean {
  return Boolean((process.env.GEMINI_API_KEY ?? "").trim());
}

export function parseAiAssistAction(value: unknown): AiAssistAction | null {
  if (typeof value !== "string") return null;
  return ACTIONS.has(value as AiAssistAction)
    ? (value as AiAssistAction)
    : null;
}

function languageHint(locale: string): string {
  return locale === "zh"
    ? "Respond in Simplified Chinese."
    : "Respond in English.";
}

function systemPrompt(action: AiAssistAction, locale: string): string {
  const lang = languageHint(locale);
  switch (action) {
    case "summarize":
      return [
        "You write short scrapbook cover summaries for a personal creative archive.",
        `Return ONLY the summary text, max ${SUMMARY_MAX_CHARS} characters. No quotes or labels.`,
        lang,
      ].join(" ");
    case "critique":
      return [
        "You are a thoughtful writing coach for a personal creative archive.",
        "Evaluate the draft: strengths, weak spots, tone, clarity, and one or two concrete suggestions.",
        "Be honest but kind. Do not rewrite the whole piece. Plain text, short paragraphs.",
        lang,
      ].join(" ");
    case "proofread":
      return [
        "You correct grammar, spelling, punctuation, and awkward phrasing.",
        "Preserve the author's voice, meaning, structure, and line breaks as much as possible.",
        "Return ONLY the corrected full text. No explanations or markdown fences.",
        lang,
      ].join(" ");
  }
}

function userPrompt(
  action: AiAssistAction,
  title: string,
  content: string,
): string {
  const clipped = content.slice(0, MAX_CONTENT_CHARS);
  const titleLine = title ? `Title: ${title}\n\n` : "";
  switch (action) {
    case "summarize":
      return `${titleLine}Draft:\n${clipped}\n\nWrite a short summary for the scrapbook cover.`;
    case "critique":
      return `${titleLine}Draft:\n${clipped}\n\nPlease evaluate this draft.`;
    case "proofread":
      return `${titleLine}Draft:\n${clipped}\n\nReturn the corrected draft only.`;
  }
}

export async function runAiAssist(input: {
  action: AiAssistAction;
  title: string;
  content: string;
  locale: string;
}): Promise<string> {
  const apiKey = (process.env.GEMINI_API_KEY ?? "").trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const client = new GoogleGenerativeAI(apiKey);
  const modelName = (process.env.GEMINI_MODEL ?? "gemini-1.5-flash").trim();
  const model = client.getGenerativeModel({
    model: modelName,
    systemInstruction: systemPrompt(input.action, input.locale),
    generationConfig: {
      temperature: input.action === "critique" ? 0.6 : 0.3,
    },
  });
  const completion = await model.generateContent(
    userPrompt(input.action, input.title, input.content),
  );

  let text = completion.response.text().trim();
  if (!text) {
    throw new Error("Model returned an empty response.");
  }

  if (input.action === "summarize") {
    text = text.replace(/^["「『]|["」』]$/g, "").trim();
    if ([...text].length > SUMMARY_MAX_CHARS) {
      text = [...text].slice(0, SUMMARY_MAX_CHARS).join("");
    }
  }

  return text;
}
