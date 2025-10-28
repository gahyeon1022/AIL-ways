// app/server-actions/select.ts
"use server";

import { fetchWithAuth } from "@/app/server-actions/auth";
import { parseEnvelopeBody, BackendError } from "@/app/lib/api/envelope";

export type ProfileOptionsDTO = { roles: string[]; interests: string[] };
export type UserProfileDTO = {
  role: string | null;
  interests: string[] | null;
};

// 정상 액션 (기존)
export async function fetchProfileOptionsAction(): Promise<ProfileOptionsDTO> {
  const res = await fetchWithAuth("/api/users/profile-options", { method: "GET", cache: "no-store" });
  const raw = await res.text();

  if (!res.ok) {
    throw new BackendError(res.status, raw?.slice(0, 200) || "요청 실패");
  }

  return parseEnvelopeBody<ProfileOptionsDTO>(raw, res.status);
}

export async function saveRoleAndInterestsAction(input: { role: string | null; interests: string[] | null }) {
  const res = await fetchWithAuth("/api/users/me/profile", {
    method: "PATCH",
    body: JSON.stringify({
      role: input.role ?? null,
      interests: input.interests && input.interests.length ? input.interests : null,
    }),
  });
  if (!res.ok) throw new BackendError(res.status, await res.text());
  await res.text(); // 소비
}

export async function fetchMyProfileAction(): Promise<UserProfileDTO> { //role, interest가 이미 채워졌는지 판별하는 함수
  const res = await fetchWithAuth("/api/users/me", { method: "GET", cache: "no-store" });
  const raw = await res.text();

  if (!res.ok) {
    throw new BackendError(res.status, raw?.slice(0, 200) || "요청 실패");
  }

  return parseEnvelopeBody<UserProfileDTO>(raw, res.status);
}
