// /app/select/page.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import SelectAfterLogin from "./components/SelectAfterLogin.client";
import { fetchProfileOptionsAction, fetchMyProfileAction } from "@/app/server-actions/select";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function buildQueryString(params?: Record<string, string | string[] | undefined>) {
  if (!params) return "";
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => {
        if (typeof v === "string") qs.append(key, v);
      });
    } else if (typeof value === "string") {
      qs.set(key, value);
    }
  });
  const result = qs.toString();
  return result ? `?${result}` : "";
}

export default async function Page({ searchParams }: PageProps) {
  const jar = await cookies();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const tokenQuery = resolvedSearchParams?.token;
  const tokenParam = Array.isArray(tokenQuery) ? tokenQuery[0] : tokenQuery || null;
  const queryString = buildQueryString(resolvedSearchParams);
  const currentPath = `/select${queryString}`;
  const refreshToken = jar.get("REFRESH_TOKEN")?.value ?? null;

  if (tokenParam) {
    redirect(`/terms-consents?token=${encodeURIComponent(tokenParam)}`);
  }

  const token = jar.get("AUTH_TOKEN")?.value ?? null;
  if (!token) {
    if (refreshToken) {
      redirect(`/refresh-session?next=${encodeURIComponent(currentPath)}`);
    }
    redirect("/login");
  }

  let profile: Awaited<ReturnType<typeof fetchMyProfileAction>> | null = null;
  try {
    profile = await fetchMyProfileAction();
  } catch {}

  const hasConsents =
    Array.isArray(profile?.consents) && profile.consents.some(consent => consent?.agreed);
  if (!hasConsents) {
    redirect("/terms-consents");
  }

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
