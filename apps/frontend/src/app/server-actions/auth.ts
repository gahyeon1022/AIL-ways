"use server";

import { cookies } from "next/headers";
import { callAPI, callAPIWithAuth } from "@/app/lib/api/http";           // 규약(Envelope)까지 처리하는 공통 호출
import { BackendError } from "@/app/lib/api/envelope";
import { BE } from "@/app/lib/server/env";              

function formatError(e: unknown, fallback: string) {
  if (e instanceof BackendError) {
    return `[${e.status}] ${e.message}${e.code ? ` (${e.code})` : ""}`;
  }
  if (e instanceof Error) {
    return e.message || fallback;
  }
  return fallback;
}

// 폼 헬퍼: 체크박스/토글 등 FormData → boolean
const asBool = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").toLowerCase();
  return s === "on" || s === "true" || s === "1";
};

// 백엔드 로그인 응답 DTO
type LoginDTO = {
  accessToken: string;
  tokenType: string; // "Bearer" 기대
  userId: string;
  refreshToken?: string;
  refreshTokenExpiresIn?: number; // (초)
};

// 로그인
export async function loginAction(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  const userPw = String(formData.get("userPw") ?? "");
  if (!userId || !userPw) return { ok: false, msg: "아이디/비밀번호 입력 필요" };

  try {
    const data = await callAPI<LoginDTO>(`/api/auth/local/login`, {
      method: "POST",
      body: JSON.stringify({ userId, userPw }),
    });

    if (!data?.accessToken) throw new Error("인증 토큰이 없습니다.");
    if (data.tokenType && data.tokenType.toLowerCase() !== "bearer") {
      throw new Error(`지원하지 않는 토큰 타입: ${data.tokenType}`);
    }

    const jar = await cookies();

    // access token (HttpOnly 쿠키로 Next 서버가 관리)
    jar.set({
      name: "AUTH_TOKEN",
      value: data.accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15, // 15분
    });

    // refresh token (있을 때만)
    if (data.refreshToken) {
      const rtMaxAge =
        typeof data.refreshTokenExpiresIn === "number" && data.refreshTokenExpiresIn > 0
          ? data.refreshTokenExpiresIn
          : 60 * 60 * 24 * 30; // 기본 30일

      jar.set({
        name: "REFRESH_TOKEN",
        value: data.refreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: rtMaxAge,
      });
    }

    return { ok: true, msg: "로그인 성공", data: { userId: data.userId } };
  } catch (e: unknown) {
    if (e instanceof BackendError) {
      if (e.status === 404 || e.code === "USER_NOT_FOUND" || /not[\s_-]*found/i.test(e.message)) {
        return { ok: false, msg: "존재하지 않는 아이디입니다." };
      }
      if (e.status === 401) {
        return { ok: false, msg: "비밀번호가 틀렸습니다." };
      }
    }
    return { ok: false, msg: formatError(e, "로그인 실패") };
  }
}

export async function logoutAction() {
  const jar = await cookies();
  try {
    await callAPIWithAuth<null>("/api/auth/logout", { method: "POST" });
  } catch {
  }
  jar.delete("AUTH_TOKEN");
  jar.delete("REFRESH_TOKEN");
  jar.delete("CONSENTS_CONFIRMED");
  return { ok: true, msg: "로그아웃 완료" };
}

export async function persistAuthToken(token: string) {
  if (!token) throw new Error("토큰이 필요합니다.");
  const jar = await cookies();
  jar.set({
    name: "AUTH_TOKEN",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15,
  });
  return { ok: true };
}

export type SocialConsentInput = {
  type: "TOS" | "PRIVACY" | "VIDEO_CAPTURE";
  agreed: boolean;
};

export async function saveSocialConsentsAction(consents: SocialConsentInput[]) {
  if (!consents || consents.length === 0) {
    return { ok: false, msg: "동의 항목이 필요합니다." };
  }

  const allAgreed = consents.every(c => c.agreed);
  if (!allAgreed) {
    return { ok: false, msg: "필수 약관에 모두 동의해야 합니다." };
  }

  const payload = consents.map(c => ({
    type: c.type,
    agreed: true,
    agreedAt: new Date().toISOString(),
  }));

  try {
    await callAPIWithAuth("/api/auth/social/consents", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const jar = await cookies();
    jar.set({
      name: "CONSENTS_CONFIRMED",
      value: "1",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, msg: formatError(e, "약관 동의 저장에 실패했습니다.") };
  }
}

// 아이디 중복 확인
export async function checkUserIdAction(userId: string) {
  if (!userId) return { ok: false, msg: "아이디를 입력하세요" };
  try {
    const data = await callAPI<{ userId?: string; isAvailable: boolean }>(
      `/api/auth/check-userid?userId=${encodeURIComponent(userId)}`
    );
    const available = !!data?.isAvailable;
    return {
      ok: true,
      isAvailable: available,
      msg: available ? "사용 가능한 아이디입니다." : "이미 사용 중인 아이디입니다.",
    };
  } catch (e: unknown) {
    return { ok: false, msg: formatError(e, "요청 실패") };
  }
}

// 이메일 코드 발송
export async function sendEmailCodeAction(email: string) {
  if (!email) return { ok: false, msg: "이메일을 입력하세요" };
  try {
    const data = await callAPI<{ ttl?: number }>(`/api/auth/email/code`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return { ok: true, ttl: data?.ttl, msg: "인증번호를 전송했습니다." };
  } catch (e: unknown) {
    return { ok: false, msg: formatError(e, "요청 실패") };
  }
}

// 이메일 인증번호 검증
export async function verifyEmailCodeAction(email: string, code: string) {
  if (!email || !code) return { ok: false, msg: "이메일과 코드가 필요합니다" };
  try {
    await callAPI<null>(`/api/auth/email/verify-code`, {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });
    return { ok: true, msg: "인증 성공" };
  } catch (e: unknown) {
    return { ok: false, msg: formatError(e, "오류") };
  }
}

// 회원가입
export async function signupAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const userName = String(formData.get("userName") ?? "");
  const userId = String(formData.get("userId") ?? "");
  const userPw = String(formData.get("userPw") ?? "");
  const code = String(formData.get("code") ?? "");

  const CONSENTS = [
    { type: "TOS",           name: "tos",          label: "서비스 이용 약관",     required: true },
    { type: "PRIVACY",       name: "privacy",      label: "개인정보 처리방침",     required: true },
    { type: "VIDEO_CAPTURE", name: "videoCapture", label: "영상 촬영·분석 동의", required: true },
  ] as const;

  const consents = CONSENTS.map(c => ({ type: c.type, agreed: asBool(formData.get(c.name)) }));
  const missing  = CONSENTS.filter(c => c.required && !asBool(formData.get(c.name))).map(c => c.label);

  if (missing.length) {
    return { ok: false, msg: `다음 항목에 동의가 필요합니다: ${missing.join(", ")}` };
  }

  const payload = {
    email, userName, userId, userPw, code,
    createdAt: new Date().toISOString(), // 백엔드에서 UTC 파싱 권장
    consents,
  };

  try {
    await callAPI<null>(`/api/auth/local/signup`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return { ok: true, msg: "회원가입 성공" };
  } catch (e: unknown) {
    return { ok: false, msg: formatError(e, "회원가입 실패") };
  }
}

// 보호 API 비상구(원시 Response 필요 시만 사용)
export async function fetchWithAuth(path: string, init?: RequestInit) {
  const jar = await cookies();
  const token = jar.get("AUTH_TOKEN")?.value;
  if (!token) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401, headers: { "Content-Type": "application/json" },
    });
  }

  const headers = new Headers(init?.headers || {});
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  return fetch(`${BE}${path}`, { cache: "no-store", ...init, headers });
}
