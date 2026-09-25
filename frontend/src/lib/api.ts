import type { ParseResponse } from "./types";

const API_BASE = "/api";

export async function parseWorkout(input: string): Promise<ParseResponse> {
  const res = await fetch(`${API_BASE}/parse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input }),
  });
  return res.json();
}

export async function checkAuth(session: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/auth/session`, {
    headers: { Authorization: `Bearer ${session}` },
  });
  return res.ok;
}
