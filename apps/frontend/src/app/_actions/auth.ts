"use server";
import { BE } from "@/app/lib/env"; 

// ── 응답 규약: { success, data, error } ─────────────────────────
type ApiEnvelope<T = unknown> = {
  success: boolean;
  data?: T;
  error?: { code?: string; message?: string } | string | null;
};

const asBool = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").toLowerCase();
  return s === "on" || s === "true" || s === "1";
};

async function callAPI<T>(path: string, init?: RequestInit): Promise<{ data: T }> {
  const res = await fetch(`${BE}${path}`, {
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });

  // HTTP 에러 우선 처리
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    try {
      const j = JSON.parse(txt) as ApiEnvelope;
      const msg = typeof j.error === "string" ? j.error : (j.error?.message ?? "요청 실패");
      throw new Error(msg);
    } catch {
      throw new Error("요청 실패");
    }
  }

  // 규약 파싱
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!json || typeof json.success !== "boolean") throw new Error("서버 응답 형식 오류");
  if (!json.success) {
    const msg = typeof json.error === "string" ? json.error : (json.error?.message ?? "오류");
    throw new Error(msg);
  }
  return { data: json.data as T };
}

// -서버액션함수들-

// 아이디 중복 확인
export async function checkUserIdAction(userId: string) {
  if (!userId) return { ok: false, msg: "아이디를 입력하세요" };
  try {
    const { data } = await callAPI<{ userId?: string; isAvailable: boolean }>(
      `/api/auth/check-userid?userId=${encodeURIComponent(userId)}`
    );
    const available = !!data?.isAvailable;
    return { ok: true, isAvailable: available, msg: available ? "사용 가능한 아이디입니다." : "이미 사용 중인 아이디입니다." };
  } catch (e: any) {
    return { ok: false, msg: String(e?.message || "요청 실패") };
  }
}

// 이메일 코드 발송
export async function sendEmailCodeAction(email: string) {
  if (!email) return { ok: false, msg: "이메일을 입력하세요" };
  try {
    const { data } = await callAPI<{ ttl?: number }>(`/api/auth/email/code`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return { ok: true, ttl: data?.ttl, msg: "인증번호 전송 완료" };
  } catch (e: any) {
    return { ok: false, msg: String(e?.message || "요청 실패") };
  }
}

// 인증번호 확인
export async function verifyEmailCodeAction(email: string, code: string) {
  if (!email || !code) return { ok: false, msg: "이메일과 코드가 필요합니다" };
  try {
    await callAPI<null>(`/api/auth/email/verify-code`, {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });
    return { ok: true, msg: "인증 성공" };
  } catch (e: any) {
    return { ok: false, msg: String(e?.message || "오류") };
  }
}

export async function signupAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const userName = String(formData.get("userName") ?? "");
  const userId = String(formData.get("userId") ?? "");
  const userPw = String(formData.get("userPw") ?? "");
  const code = String(formData.get("code") ?? "");
  const tos = asBool(formData.get("tos"));

  if (!tos) return { ok: false, msg: "약관 동의 필요가 필요합니다." };

  const payload = {
    email, userName, userId, userPw, code,
    createdAt: new Date().toISOString(), // 백엔드에서 UTC 파싱 권장
    consents: [
      { type: "TOS", agreed: true },
      { type: "PRIVACY", agreed: true },
      { type: "VIDEO_CAPTURE", agreed: true },
    ],
  };

  try {
    await callAPI<null>(`/api/auth/local/signup`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return { ok: true, msg: "회원가입 성공" };
  } catch (e: any) {
    return { ok: false, msg: String(e?.message || "회원가입 실패") };
  }
}
