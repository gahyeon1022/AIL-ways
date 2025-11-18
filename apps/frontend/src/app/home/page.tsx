import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HomeShell from "./components/HomeShell.client";
import { fetchMyProfileAction } from "@/app/server-actions/select";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function buildQueryString(params?: Record<string, string | string[] | undefined>) {
  if (!params) return "";
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => {
        if (typeof v === "string") query.append(key, v);
      });
    } else if (typeof value === "string") {
      query.set(key, value);
    }
  });
  const result = query.toString();
  return result ? `?${result}` : "";
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tokenParamRaw = params?.token;
  const tokenParam = Array.isArray(tokenParamRaw) ? tokenParamRaw[0] : tokenParamRaw || null;

  const queryString = buildQueryString(params);
  const currentPath = `/home${queryString}`;

  const cookieStore = await cookies();
  const authToken = cookieStore.get("AUTH_TOKEN")?.value ?? null;
  const refreshToken = cookieStore.get("REFRESH_TOKEN")?.value ?? null;

  if (!authToken && !tokenParam) {
    if (refreshToken) {
      const next = encodeURIComponent(currentPath);
      redirect(`/refresh-session?next=${next}`);
    }
    redirect("/login");
  }
  const hasAuthToken = Boolean(authToken);

  let initialConsented = false;
  let initialActorRole: "MENTOR" | "MENTEE" | null = null;
  let initialProfileComplete: boolean | null = null;
  if (hasAuthToken) {
    try {
      const profile = await fetchMyProfileAction();
      initialConsented = Array.isArray(profile?.consents) && profile.consents.some(item => item?.agreed);
      initialActorRole = (profile?.role === "MENTOR" || profile?.role === "MENTEE") ? profile.role : null;
      initialProfileComplete =
        Boolean(profile?.role) && Array.isArray(profile?.interests) && profile.interests.length > 0;
    } catch {
      initialConsented = false;
    }
  }

  return (
    <HomeShell
      tokenParam={tokenParam}
      hasAuthToken={hasAuthToken}
      initialConsented={initialConsented}
      initialActorRole={initialActorRole}
      initialProfileComplete={initialProfileComplete}
    />
  );
}
