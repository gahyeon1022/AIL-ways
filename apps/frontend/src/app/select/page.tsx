// /app/select/page.tsx
import { redirect } from "next/navigation";
import { fetchInterestEnumsAction } from "@/app/server-actions/select";
import { fetchWithAuth } from "@/app/server-actions/auth";
import { parseEnvelope } from "@/app/lib/api/envelope";
import SelectAfterLogin from "./SelectAfterLogin.client";

// 내가 저장해둔 프로필 타입(백엔드 스펙 맞춰 조정 가능)
type MyProfile = {
  role: string | null;
  interests: string[] | null; // 다중 선택 저장하는 스펙
};

export const dynamic = "force-dynamic";

// 서버에서 내 프로필 조회 (이미 완료면 /home으로 즉시 리다이렉트)
async function fetchMyProfile(): Promise<MyProfile> {
  const res = await fetchWithAuth(`/api/users/me/profile`, { cache: "no-store" });
  const data = await parseEnvelope<MyProfile>(res);
  return data;
}

export default async function Page() {
  const [profile, interestOptions] = await Promise.all([
    fetchMyProfile().catch(() => ({ role: null, interests: null })),
    fetchInterestEnumsAction().catch(() => [] as string[]),
  ]);

  const hasRole = !!profile.role;
  const hasInterests = Array.isArray(profile.interests) && profile.interests.length > 0;
  if (hasRole && hasInterests) {
    redirect("/home");
  }

  return (
    <SelectAfterLogin
      interestOptions={interestOptions}
      initialRole={profile.role}
      initialInterests={Array.isArray(profile.interests) ? profile.interests : []}
    />
  );
}
