/**
 * Upload an image to the API; returns a public URL stored in post.images.
 */
import { API_BASE_URL } from "./config";
import { getToken } from "./token";

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

export async function uploadImage(file: File): Promise<string> {
  const token = getToken();
  if (!token) {
    throw new Error("Sign in required");
  }

  const body = new FormData();
  body.append("image", file);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/uploads`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body,
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
        `Failed to upload image (${response.status})`,
      ),
    );
  }

  const data = (await response.json()) as { url?: string };
  if (!data.url) {
    throw new Error("Upload succeeded but no image URL was returned.");
  }
  return data.url;
}
