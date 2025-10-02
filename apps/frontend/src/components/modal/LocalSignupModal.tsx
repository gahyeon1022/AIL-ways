"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

const BTN =
  "inline-flex items-center justify-center shrink-0 min-w-[64px] " +
  "rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

type Props = {
  open: boolean;
  onClose: () => void;
};

function formatNow(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}

export default function LocalSignupModal({ open, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [userPw, setUserPw] = useState("");
  const [tos, setTos] = useState(false); //약관동의

  const [loading, setLoading] = useState(false);           
  const [emailSending, setEmailSending] = useState(false); 
  const [createdAt, setCreatedAt] = useState<string>("");
  const [idChecking, setIdChecking] = useState(false); //아이디 중복 확인 로딩 상태
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);


  //아이디 중복 확인 요청
   async function checkUserId() {
    if (idChecking) return;
    setIdChecking(true);
    try {
      const endpoint = `/api/auth/check-userid?userId=${encodeURIComponent(userId)}`;
      const res = await fetch(endpoint, { method: "GET", credentials: "include" });
      if (res.status === 200) alert("성공");
      else if (res.status === 400) alert("잘못된 요청입니다");
      else alert("요청 처리 중 오류가 발생했습니다.");
    } catch {
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setIdChecking(false);
    }
  }

  async function sendEmailCode() {
    if (emailSending) return;
    setEmailSending(true);
    try {
      const endpoint = `/api/auth/email/code`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

        let data: { message?: string; verified?: boolean } | null = null;
    try {
      data = await res.json();
    } catch {
    }

    // 상태코드별 처리
    if (res.status === 400) {
      alert("인증코드가 일치하지 않습니다");
      return;
    }
    if (res.status === 404) {
      alert("인증 요청을 찾을 수 없습니다");
      return;
    }

    if (res.ok) {
      if (data?.message) alert(data.message);
      else alert("요청이 처리되었습니다.");
      if (typeof data?.verified === "boolean") {
        console.log("[email verified]:", data.verified);
      }
      return;
    }

    alert(data?.message ?? "요청 처리 중 오류가 발생했습니다.");
  } finally {
    setEmailSending(false);
  }
}
// 인증번호 확인
  async function verifyEmailCode() {
    if (verifying) return;             // 중복 클릭 방지
    setVerifying(true);
    try {
      const res = await fetch(`/api/auth/email/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email, 
          code,  
        }),
      });

      if (res.status === 200) { alert("인증 성공"); return; }
      if (res.status === 409) { alert("이미 사용된 이메일입니다"); return; }
      if (res.status === 400) { alert("이메일 누락입니다"); return; }

      alert("요청 처리 중 오류가 발생했습니다.");
    } catch {
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setVerifying(false);
    }
  }


  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tos) {
      alert("약관(TOS)에 동의해 주세요.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        email,
        userName,
        userId,
        userPw,     
        code,            // 서버에서 해시 처리
        creadtedAt: createdAt,  // (원본 키 유지)
        consents: [
          { type: "TOS",          agreed: true },
          { type: "PRIVACY",      agreed: true },
          { type: "VIDEO_CAPTURE",agreed: true },
        ],
      };

      const endpoint = `/api/auth/local/signup`;
      console.log("[SIGNUP] POST /api/auth/local/signup", payload);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) throw new Error("회원가입 실패");

      const now = formatNow();
      setCreatedAt(now);
      alert(`회원가입 성공!\n생성 시각: ${now}`);
      onClose();
    } catch (err: any) {
      alert(err?.message ?? "문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <button onClick={onClose} className="absolute inset-0 bg-black/40" />

          {/* Panel */}
          <motion.div
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="absolute left-1/2 top-10 w-[92vw] max-w-md -translate-x-1/2 rounded-2xl bg-white/90 backdrop-blur p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">이메일로 회원가입</h2>
              <button
                onClick={onClose}
                className="rounded p-1 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={onSubmit} className="grid gap-3 text-left">
              {/* userName */}
              <label className="text-left text-sm font-medium text-gray-700">
                이름
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="이름을 입력해주세요."
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>

              <label className="text-left text-sm font-medium text-gray-700">
                아이디
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    required
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="아이디를 입력해주세요."
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={checkUserId}
                    disabled={idChecking}
                    className={BTN}
                  >
                    {idChecking ? "확인 중..." : "중복 확인"}
                  </button>
                </div>
              </label>

              {/* userPw */}
              <label className="text-left text-sm font-medium text-gray-700">
                비밀번호 (영어 대소문자+숫자+특수문자 조합)
                <input
                  type="password"
                  required
                  value={userPw}
                  onChange={(e) => setUserPw(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>

              {/* email + 인증코드 요청 버튼 */}
              <label className="text-left text-sm font-medium text-gray-700">
                이메일
                <div className="mt-1 flex gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="이메일을 입력해주세요."
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={sendEmailCode}
                    disabled={emailSending}
                    className={BTN}
                  >
                    {emailSending ? "전송 중..." : "인증번호 받기"}
                  </button>
                </div>

                <div className="mt-1 flex items-center gap-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="인증번호"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="
                      flex-none grow-0 shrink-0
                      !w-24 md:!w-28
                      text-center rounded-lg border border-gray-300 px-3 py-2
                      outline-none focus:ring-2 focus:ring-indigo-500
                    "
                  />
                      <button
                        type="button"
                        onClick={verifyEmailCode}
                        disabled={verifying}
                        className={BTN}
                      >
                        {verifying ? "확인 중..." : "인증번호 확인"}
                      </button>
                </div>
              </label>

              {/* consents */}
              <label className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={tos}
                  onChange={(e) => setTos(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                (필수) 약관 동의
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-3 w-full rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "처리 중..." : "가입하기"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
