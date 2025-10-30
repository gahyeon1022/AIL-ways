import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TermsConsentsScreen from "./TermsConsentsScreen.client";
import { fetchMyProfileAction } from "@/app/server-actions/select";

type SearchParamsPromise = Promise<Record<string, string | string[] | undefined>>;

export const dynamic = "force-dynamic";

export default async function TermsConsentsPage({
  searchParams,
}: {
  searchParams: SearchParamsPromise;
}) {
  const params = await searchParams;
  const tokenParamRaw = params?.token;
  const tokenParam = Array.isArray(tokenParamRaw) ? tokenParamRaw[0] : tokenParamRaw || null;

  const cookieStore = await cookies();
  const authToken = cookieStore.get("AUTH_TOKEN")?.value ?? null;
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
