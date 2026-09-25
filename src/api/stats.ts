import { API_BASE_URL } from "./config";
import { classifyHttpError, fetchApi } from "./http";
import { getToken } from "./token";

export interface DeskDayStat {
  day: string;
  posts: number;
  images: number;
  chars: number;
  sealed: boolean;
}

export interface DeskStatsResponse {
  timezone: string;
  today: DeskDayStat;
  yesterday: DeskDayStat;
  last7Days: DeskDayStat[];
}

export async function fetchDeskStats(): Promise<DeskStatsResponse> {
  const token = getToken();
  if (!token) {
    throw new Error("Sign in required");
  }

  const response = await fetchApi(`${API_BASE_URL}/api/stats/desk`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) {
    throw new Error("Session expired. Please sign in again.");
  }

  if (!response.ok) {
    throw classifyHttpError(
      response.status,
      `Failed to load desk stats (${response.status})`,
    );
  }

  return (await response.json()) as DeskStatsResponse;
}
