"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HomeLanding from "./HomeLanding.client";
import { persistAuthToken } from "@/app/server-actions/auth";
import { fetchMyProfileAction } from "@/app/server-actions/select";

type Props = {
  tokenParam: string | null;
  hasAuthToken: boolean;
  initialConsented: boolean;
  initialActorRole?: "MENTOR" | "MENTEE" | null;
  initialProfileComplete?: boolean | null;
};

export default function HomeShell({
  tokenParam,
  hasAuthToken,
  initialConsented,
  initialActorRole,
  initialProfileComplete,
}: Props) {
  const router = useRouter();
  const [tokenReady, setTokenReady] = useState(hasAuthToken);
  const [tokenPending, setTokenPending] = useState(false);
  const [consented, setConsented] = useState(initialConsented);
  const [actorRole, setActorRole] = useState<"MENTOR" | "MENTEE" | null>(initialActorRole ?? null);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(
    typeof initialProfileComplete === "boolean" ? initialProfileComplete : null
  );

  useEffect(() => {
    if (!tokenParam || hasAuthToken || tokenReady) return;
    let cancelled = false;
    setTokenPending(true);
    (async () => {
      try {
        const result = await persistAuthToken(tokenParam);
        if (!cancelled && result?.ok) {
          setTokenReady(true);
        }
      } catch {
        if (!cancelled) {
          router.replace("/login");
        }
      } finally {
        if (!cancelled) setTokenPending(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tokenParam, hasAuthToken, tokenReady, router]);

  useEffect(() => {
    if (!tokenReady || consented) return;
    let cancelled = false;
    (async () => {
      try {
        const profile = await fetchMyProfileAction();
        const hasConsents = Array.isArray(profile?.consents) && profile.consents.some(item => item?.agreed);
        if (!cancelled) {
          if (hasConsents) {
            setConsented(true);
          }
          if (profile?.role && profile.role !== actorRole) {
            setActorRole(profile.role);
          }
          const completed = Boolean(profile?.role) && Array.isArray(profile?.interests) && profile.interests.length > 0;
          setProfileComplete(completed);
        }
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tokenReady, consented, actorRole]);

  useEffect(() => {
    if (!tokenParam) return;
    if (!tokenReady || tokenPending) return;
    if (!consented) {
      router.replace("/terms-consents");
      return;
    }
    if (profileComplete === null) return;
    if (profileComplete) {
      return;
    }
    router.replace("/select");
  }, [tokenParam, tokenReady, tokenPending, consented, profileComplete, router]);

  useEffect(() => {
    if (!tokenParam && !hasAuthToken && !tokenReady) {
      router.replace("/login");
    }
  }, [tokenParam, hasAuthToken, tokenReady, router]);

  useEffect(() => {
    if (!tokenReady || (actorRole && profileComplete !== null)) return;
    let cancelled = false;
    (async () => {
      try {
        const profile = await fetchMyProfileAction();
        if (!cancelled && profile) {
          if (profile.role) {
            setActorRole(profile.role);
          }
          const completed = Boolean(profile.role) && Array.isArray(profile.interests) && profile.interests.length > 0;
          setProfileComplete(completed);
        }
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tokenReady, actorRole, profileComplete]);

  return <HomeLanding actorRole={actorRole} />;
}
