"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ScrollableTerms from "@/components/ui/ScrollableTerms";
import { Button } from "@/components/ui/Button";
import { persistAuthToken, saveSocialConsentsAction } from "@/app/server-actions/auth";
import { fetchMyProfileAction } from "@/app/server-actions/select";

const CONSENT_ITEMS = [
  { type: "TOS" as const, label: "서비스 이용 약관", src: "/terms/tos.md" },
  { type: "PRIVACY" as const, label: "개인정보 처리방침", src: "/terms/privacy.md" },
  { type: "VIDEO_CAPTURE" as const, label: "영상 촬영·분석 동의", src: "/terms/video_capture.md" },
];

type ConsentType = (typeof CONSENT_ITEMS)[number]["type"];

type Props = {
  tokenParam: string | null;
  refreshTokenParam?: string | null;
  refreshTokenExpiresIn?: number | null;
  hasAuthToken: boolean;
  alreadyConsented: boolean;
};

const INITIAL_STATE = CONSENT_ITEMS.reduce(
  (acc, item) => {
    acc[item.type] = false;
    return acc;
  },
  {} as Record<ConsentType, boolean>
);

export default function TermsConsentsScreen({
  tokenParam,
  refreshTokenParam = null,
  refreshTokenExpiresIn = null,
  hasAuthToken,
  alreadyConsented,
}: Props) {
  const router = useRouter();
  const [checked, setChecked] = useState<Record<ConsentType, boolean>>(INITIAL_STATE);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitPending, setSubmitPending] = useState(false);

  const [tokenReady, setTokenReady] = useState(hasAuthToken && !tokenParam);
  const [tokenPending, setTokenPending] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [consented, setConsented] = useState(alreadyConsented);
  const [checkingConsent, setCheckingConsent] = useState(false);

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
          setTokenError(null);
        } else if (!cancelled) {
          setTokenError("로그인 정보를 저장하지 못했습니다. 다시 로그인해 주세요.");
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "로그인 정보를 저장하지 못했습니다. 다시 로그인해 주세요.";
          setTokenError(message);
        }
      } finally {
        if (!cancelled) setTokenPending(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tokenParam, refreshTokenParam, refreshTokenExpiresIn, tokenReady]);

  useEffect(() => {
    if (!tokenReady || consented) return;
    let cancelled = false;
    setCheckingConsent(true);
    (async () => {
      try {
        const profile = await fetchMyProfileAction();
        const hasConsents = Array.isArray(profile?.consents) && profile.consents.some(item => item?.agreed);
        if (!cancelled && hasConsents) {
          setConsented(true);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setCheckingConsent(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tokenReady, consented]);

  useEffect(() => {
    if (consented) {
      router.replace("/select");
    }
  }, [consented, router]);

  const allChecked = useMemo(() => CONSENT_ITEMS.every(item => checked[item.type]), [checked]);

  const toggle = (type: ConsentType) => {
    setChecked(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleSubmit = async () => {
    if (!tokenReady) {
      setSubmitError("로그인 상태를 확인하고 다시 시도해주세요.");
      return;
    }
    if (!allChecked) {
      setSubmitError("필수 약관에 모두 동의해야 합니다.");
      return;
    }

    setSubmitPending(true);
    setSubmitError(null);
    try {
      const result = await saveSocialConsentsAction(
        CONSENT_ITEMS.map(item => ({ type: item.type, agreed: true }))
      );
      if (!result.ok) {
        throw new Error(result.msg || "동의 정보를 저장하지 못했습니다.");
      }
      setConsented(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "처리 중 오류가 발생했습니다.";
      setSubmitError(message);
    } finally {
      setSubmitPending(false);
    }
  };

  if (!tokenParam && !hasAuthToken && !tokenReady) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center px-6">
        <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-2xl font-semibold text-gray-900">로그인 정보가 없습니다</h1>
          <p className="mt-3 text-sm text-gray-600">카카오 로그인을 다시 진행한 뒤 약관에 동의해 주세요.</p>
          <Button className="mt-6" onClick={() => router.replace("/login")}>
            로그인으로 이동
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <section className="rounded-3xl bg-white p-10 shadow-xl">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">약관 동의</h1>
          <p className="mt-2 text-sm text-gray-600">AIL-Ways 서비스를 이용하려면 필수 약관에 모두 동의해야 합니다.</p>
        </header>

        {(tokenError || checkingConsent) && (
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            {tokenError || "동의 상태를 확인하는 중입니다..."}
          </div>
        )}

        <div className="space-y-8">
          {CONSENT_ITEMS.map(item => (
            <article key={item.type}>
              <div className="mb-3 flex items-center justify-between">
                <label className="flex items-center gap-3 text-base font-medium text-gray-800">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-400"
                    checked={checked[item.type]}
                    onChange={() => toggle(item.type)}
                    disabled={submitPending || tokenPending}
                  />
                  {item.label}
                </label>
                <span className="text-xs text-gray-500">필수</span>
              </div>
              <ScrollableTerms src={item.src} />
            </article>
          ))}
        </div>

        {submitError && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <Button
          className="mt-8 w-full bg-gray-900 text-white hover:bg-gray-800"
          onClick={handleSubmit}
          disabled={submitPending || tokenPending || !allChecked || checkingConsent}
        >
          {submitPending ? "동의 내용을 저장하는 중..." : "모두 동의하고 계속하기"}
        </Button>
      </section>
    </main>
  );
}
