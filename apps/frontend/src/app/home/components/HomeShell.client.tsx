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
};

export default function HomeShell({ tokenParam, hasAuthToken, initialConsented }: Props) {
  const router = useRouter();
  const [tokenReady, setTokenReady] = useState(hasAuthToken);
  const [tokenPending, setTokenPending] = useState(false);
  const [consented, setConsented] = useState(initialConsented);

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
        if (!cancelled && hasConsents) {
          setConsented(true);
        }
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tokenReady, consented]);

  useEffect(() => {
    if (!tokenParam) return;
    if (!tokenReady || tokenPending) return;
    router.replace(consented ? "/select" : "/terms-consents");
  }, [tokenParam, tokenReady, tokenPending, consented, router]);

  useEffect(() => {
    if (!tokenParam && !hasAuthToken && !tokenReady) {
      router.replace("/login");
    }
  }, [tokenParam, hasAuthToken, tokenReady, router]);

  return <HomeLanding />;
}
