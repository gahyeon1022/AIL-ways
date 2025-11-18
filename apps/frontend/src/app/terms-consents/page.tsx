import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TermsConsentsScreen from "./components/TermsConsentsScreen.client";
import { fetchMyProfileAction } from "@/app/server-actions/select";

type SearchParamsPromise = Promise<Record<string, string | string[] | undefined>>;

export const dynamic = "force-dynamic";

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

export default async function TermsConsentsPage({
  searchParams,
}: {
  searchParams: SearchParamsPromise;
}) {
  const params = await searchParams;
  const tokenParamRaw = params?.token;
  const tokenParam = Array.isArray(tokenParamRaw) ? tokenParamRaw[0] : tokenParamRaw || null;
  const queryString = buildQueryString(params);
  const currentPath = `/terms-consents${queryString}`;

  const cookieStore = await cookies();
  const authToken = cookieStore.get("AUTH_TOKEN")?.value ?? null;
  const refreshToken = cookieStore.get("REFRESH_TOKEN")?.value ?? null;

  if (!authToken && !tokenParam && refreshToken) {
    const next = encodeURIComponent(currentPath);
    redirect(`/refresh-session?next=${next}`);
  }
  const hasAuthToken = Boolean(authToken);

  let alreadyConsented = false;
  if (hasAuthToken) {
    try {
      const profile = await fetchMyProfileAction();
      alreadyConsented = Array.isArray(profile?.consents) && profile.consents.some(item => item?.agreed);
    } catch {
      alreadyConsented = false;
    }
  }

  if (alreadyConsented) {
    redirect("/select");
  }

  if (!tokenParam && !hasAuthToken) {
    return <TermsConsentsScreen tokenParam={null} hasAuthToken={false} alreadyConsented={false} />;
  }

  return (
    <TermsConsentsScreen
      tokenParam={tokenParam}
      hasAuthToken={hasAuthToken}
      alreadyConsented={alreadyConsented}
    />
  );
}
