"use server";
import { BE } from "@/app/lib/env"; 
// 왜 no-store?
// 인증/회원가입/중복확인/이메일 인증은 항상 최신이어야 함
// 개인화/보안 데이터가 캐시에 남지 않도록 방지

// 아이디 중복 확인
export async function checkUserIdAction(userId: string) {
  if (!userId) return { ok: false, msg: "아이디를 입력하세요" };

  const res = await fetch(`${BE}/api/auth/check-userid?userId=${encodeURIComponent(userId)}`, {
    cache: "no-store",
  });
  if (!res.ok) return { ok: false, msg: "요청 실패" };
  const data = await res.json().catch(() => ({}));
  return { ok: true, isAvailable: Boolean(data?.isAvailable) };
}

// 이메일 코드 발송
export async function sendEmailCodeAction(email: string) {
  if (!email) return { ok: false, msg: "이메일을 입력하세요" };

  const res = await fetch(`${BE}/api/auth/email/code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ email }),
  });

  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, msg: data?.message ?? "요청 완료" };
}

// 인증번호 확인
export async function verifyEmailCodeAction(email: string, code: string) {
  if (!email || !code) return { ok: false, msg: "이메일과 코드가 필요합니다" };

  const res = await fetch(`${BE}/api/auth/email/verify-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ email, code }),
  });
  if (res.status === 200) return { ok: true, msg: "인증 성공" };
  if (res.status === 409) return { ok: false, msg: "이미 사용된 이메일" };
  if (res.status === 400) return { ok: false, msg: "코드 불일치" };
  return { ok: false, msg: "오류" };
}

// 회원가입 제출
export async function signupAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const userName = String(formData.get("userName") ?? "");
  const userId = String(formData.get("userId") ?? "");
  const userPw = String(formData.get("userPw") ?? "");
  const code = String(formData.get("code") ?? "");
  const tos = formData.get("tos") === "on";

  if (!tos) return { ok: false, msg: "약관 동의 필요" };

  const payload = {
    email, userName, userId, userPw, code,
    createdAt: new Date().toISOString().replace("T", " ").slice(0, 19),
    consents: [
      { type: "TOS", agreed: true },
      { type: "PRIVACY", agreed: true },
      { type: "VIDEO_CAPTURE", agreed: true },
    ],
  };

  const res = await fetch(`${BE}/api/auth/local/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(payload),
  });

  if (!res.ok) return { ok: false, msg: "회원가입 실패" };
  return { ok: true, msg: "회원가입 성공" };
}
