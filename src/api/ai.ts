/**
 * AI assist for the compose desk (summarize / critique / proofread).
 */
import { API_BASE_URL } from "./config";
import { getToken } from "./token";

export type AiAssistAction = "summarize" | "critique" | "proofread";

export interface AiAssistResult {
  action: AiAssistAction;
  text: string;
}

async function readErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    if (data.error) return data.error;
  } catch {
    // keep fallback
  }
  return fallback;
}

export async function requestAiAssist(input: {
  action: AiAssistAction;
  title: string;
  content: string;
  locale: string;
}): Promise<AiAssistResult> {
  const token = getToken();
  if (!token) {
    throw new Error("Sign in required");
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/ai/assist`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error(
      "Cannot reach the API. Is the backend running on port 3001?",
    );
  }

  if (response.status === 401) {
    throw new Error("Session expired. Please sign in again.");
  }

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        `AI assist failed (${response.status})`,
      ),
    );
  }

  const data = (await response.json()) as {
    action?: AiAssistAction;
    text?: string;
  };
  if (!data.text || !data.action) {
    throw new Error("AI assist returned an empty result.");
  }
  return { action: data.action, text: data.text };
}
