// /app/terms-consents/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TermsConsentsScreen from "./terms-consents.client";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export const dynamic = "force-dynamic";

export default async function TermsConsentsPage({ searchParams }: PageProps) {
  const jar = await cookies();
  const tokenCookie = jar.get("AUTH_TOKEN")?.value ?? null;
  const consentsDone = jar.get("CONSENTS_CONFIRMED")?.value === "1";

  const queryTokenEntries = searchParams?.token;
  const queryToken = Array.isArray(queryTokenEntries)
    ? queryTokenEntries[0]
    : queryTokenEntries || null;

  if (consentsDone) {
    redirect("/select");
  }

  if (!tokenCookie && !queryToken) {
    redirect("/login");
  }

  return (
    <TermsConsentsScreen
      tokenParam={queryToken}
      hasAuthToken={Boolean(tokenCookie)}
    />
  );
}

