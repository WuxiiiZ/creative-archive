import { API_BASE_URL } from "./config";
import { setToken } from "./token";

export async function login(
  username: string,
  password: string,
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    let message = `Login failed (${response.status})`;
    try {
      const data = (await response.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      // keep default message
    }
    throw new Error(message);
  }

  const data = (await response.json()) as { token: string };
  if (!data.token) {
    throw new Error("Login response missing token");
  }

  setToken(data.token);
  return data.token;
}
