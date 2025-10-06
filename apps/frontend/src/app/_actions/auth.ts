"use server";
import { BE } from "@/app/lib/env"; 
import { cookies } from "next/headers";

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

//로그인 액션 함수
export async function loginAction(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  const userPw = String(formData.get("userPw") ?? "");
  if (!userId || !userPw) return { ok: false, msg: "아이디/비밀번호 입력 필요" };

   try {
    const { data } = await callAPI<{
      accessToken: string;
      tokenType: string;           
      userId: string;     
      refreshToken?: string;
      refreshTokenExpiresIn?: number; // (선택) 초 단위 만료시간
    }>(`/api/auth/local/login`, {
      method: "POST",
      body: JSON.stringify({ userId, userPw }),
    });

    if (!data?.accessToken) throw new Error("인증 토큰이 없습니다.");
    if (data?.tokenType && data.tokenType.toLowerCase() !== "bearer") {
      throw new Error(`지원하지 않는 토큰 타입: ${data.tokenType}`);
    }

   const jar = await cookies();

    // access token
    jar.set({
      name: "AUTH_TOKEN",
      value: data.accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15, // 15분
    });

    // refresh token
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

    return { ok: true, msg: "로그인 성공", data: { userId: data.userId} } }; // data.token, data.refreshToken 접근 가능.
  } catch (e: any) {
    return { ok: false, msg: String(e?.message || "로그인 실패") };
  }
}

//로그아웃 액션함수
// export async function logoutAction() {
//   cookies().delete("AUTH_TOKEN");
//   cookies().delete("REFRESH_TOKEN");
//   return { ok: true, msg: "로그아웃 완료" };
// }

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

//auth_token으로 헤더에 붙여 백엔드 호출해서, 토큰 인증하는
export async function fetchWithAuth(path: string, init?: RequestInit) {
  const jar = await cookies();           // Next 15는 await 필요
  const token = jar.get("AUTH_TOKEN")?.value;
  if (!token) throw new Error("인증 필요(로그인하세요)");

  const res = await fetch(`${BE}${path}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,  // 보호 API 핵심: 토큰 전송
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  return res; // 호출부에서 res.ok 검사/파싱
}