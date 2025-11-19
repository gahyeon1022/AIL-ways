"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HomeLanding from "./HomeLanding.client";
import { persistAuthToken } from "@/app/server-actions/auth";
import { fetchMyProfileAction } from "@/app/server-actions/select";

type Props = {
  tokenParam: string | null;
  refreshTokenParam?: string | null;
  refreshTokenExpiresIn?: number | null;
  hasAuthToken: boolean;
  initialConsented: boolean;
  initialActorRole?: "MENTOR" | "MENTEE" | null;
  initialProfileComplete?: boolean | null;
};

export default function HomeShell({
  tokenParam,
  refreshTokenParam = null,
  refreshTokenExpiresIn = null,
  hasAuthToken,
  initialConsented,
  initialActorRole,
  initialProfileComplete,
}: Props) {
  const router = useRouter();
  const normalizeRole = (role: unknown): "MENTOR" | "MENTEE" | null =>
    role === "MENTOR" || role === "MENTEE" ? role : null;

  const [tokenReady, setTokenReady] = useState(hasAuthToken && !tokenParam);
  const [tokenPending, setTokenPending] = useState(false);
  const [consented, setConsented] = useState(initialConsented);
  const [actorRole, setActorRole] = useState<"MENTOR" | "MENTEE" | null>(normalizeRole(initialActorRole));
  const [profileComplete, setProfileComplete] = useState<boolean | null>(
    typeof initialProfileComplete === "boolean" ? initialProfileComplete : null
  );

  useEffect(() => {
    if (!tokenParam || tokenReady) return;
    let cancelled = false;
    setTokenPending(true);
    (async () => {
      try {
        const result = await persistAuthToken(tokenParam, {
          refreshToken: refreshTokenParam ?? undefined,
          refreshTokenExpiresIn: refreshTokenExpiresIn ?? undefined,
        });
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
  }, [tokenParam, refreshTokenParam, refreshTokenExpiresIn, tokenReady, router]);

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
          const nextRole = normalizeRole(profile?.role);
          if (nextRole && nextRole !== actorRole) {
            setActorRole(nextRole);
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
          const nextRole = normalizeRole(profile.role);
          if (nextRole && nextRole !== actorRole) {
            setActorRole(nextRole);
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
