// /app/select/page.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import SelectAfterLogin from "./SelectAfterLogin.client";
import { fetchProfileOptionsAction, fetchMyProfileAction } from "@/app/server-actions/select";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function Page({ searchParams }: PageProps) {
  const jar = await cookies();
  const tokenQuery = searchParams?.token;
  const tokenParam = Array.isArray(tokenQuery) ? tokenQuery[0] : tokenQuery || null;

  if (tokenParam) {
    redirect(`/terms-consents?token=${encodeURIComponent(tokenParam)}`);
  }

  const token = jar.get("AUTH_TOKEN")?.value ?? null;
  if (!token) {
    // 토큰이 없다 = 로그인 미완료 → 로그인 화면으로
    redirect("/login");
  }

  const consentsConfirmed = jar.get("CONSENTS_CONFIRMED")?.value === "1";
  if (!consentsConfirmed) {
    redirect("/terms-consents");
  }

  let profile: Awaited<ReturnType<typeof fetchMyProfileAction>> | null = null;
  try {
    profile = await fetchMyProfileAction();
  } catch {}

  if (profile?.role && profile?.interests && profile.interests.length > 0) {
    redirect("/home");
  }

  const initialRole = profile?.role ?? null;
  const initialInterests = Array.isArray(profile?.interests) ? profile.interests : [];

  // 2) 옵션 로딩 시도 (SSR: GET만, 부작용 없음)
  let roleOptions: string[] = [];
  let interestOptions: string[] = [];
  let loadError: string | null = null;

  try {
    const opts = await fetchProfileOptionsAction();
    roleOptions = opts.roles ?? [];
    interestOptions = opts.interests ?? [];
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "옵션 조회 실패";
    loadError = message;
  }

  return (
    <SelectAfterLogin
      roleOptions={roleOptions}
      interestOptions={interestOptions}
      initialRole={initialRole}
      initialInterests={initialInterests}
      loadError={loadError}
    />
  );
}
