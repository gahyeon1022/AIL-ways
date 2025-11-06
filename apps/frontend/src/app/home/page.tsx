import { cookies } from "next/headers";
import HomeShell from "./components/HomeShell.client";
import { fetchMyProfileAction } from "@/app/server-actions/select";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tokenParamRaw = params?.token;
  const tokenParam = Array.isArray(tokenParamRaw) ? tokenParamRaw[0] : tokenParamRaw || null;

  const cookieStore = await cookies();
  const authToken = cookieStore.get("AUTH_TOKEN")?.value ?? null;
  const hasAuthToken = Boolean(authToken);

  let initialConsented = false;
  if (hasAuthToken) {
    try {
      const profile = await fetchMyProfileAction();
      initialConsented = Array.isArray(profile?.consents) && profile.consents.some(item => item?.agreed);
    } catch {
      initialConsented = false;
    }
  }

  return (
    <HomeShell
      tokenParam={tokenParam}
      hasAuthToken={hasAuthToken}
      initialConsented={initialConsented}
    />
  );
}
