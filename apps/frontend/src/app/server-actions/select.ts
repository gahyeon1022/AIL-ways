"use server";

import { fetchWithAuth } from "@/app/server-actions/auth";
import { parseEnvelope, BackendError } from "@/app/lib/api/envelope";

async function callAuthAPI<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetchWithAuth(path, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let msg = "요청 실패";
    try {
      const j = JSON.parse(text);
      msg = typeof j?.error === "string" ? j.error : j?.error?.message ?? msg;
    } catch {}
    throw new BackendError(res.status, msg);
  }
  return parseEnvelope<T>(res);
}

export async function fetchInterestEnumsAction(): Promise<string[]> {
  return callAuthAPI<string[]>(`/api/enums/interests`, { method: "GET", cache: "no-store" });
}

export async function saveRoleAndInterestsAction(input: {
  role: string | null;
  interests: string[] | null;
}) {
  return callAuthAPI<null>(`/api/users/me/profile`, {
    method: "POST",
    body: JSON.stringify({
      role: input.role ?? null,
      interests: input.interests && input.interests.length ? input.interests : null, // 빈배열 → null
    }),
  });
}
