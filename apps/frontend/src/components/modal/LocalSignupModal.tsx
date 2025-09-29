"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

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
  const [tos, setTos] = useState(false);

  const [loading, setLoading] = useState(false);        // 회원가입 버튼 로딩
  const [emailSending, setEmailSending] = useState(false); // 인증메일 버튼 로딩

  const [createdAt, setCreatedAt] = useState<string>("");

  // 가벼운 이메일 형식 검증
  const isValidEmail = (v: string) => /\S+@\S+\.\S+/.test(v);

  // 인증번호 발송
  async function sendEmailCode() {
    if (emailSending) return; // 중복 클릭 방지
    if (!isValidEmail(email)) {
      alert("올바른 이메일 주소를 입력해 주세요.");
      return;
    }
    setEmailSending(true);
    try {
      const endpoint = API_BASE
        ? `${API_BASE}/api/auth/email/code`
        : "/api/auth/email/code";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      if (!res.ok) {
        let msg = "인증번호 발송에 실패했습니다.";
        try {
          const problem = await res.json();
          if (problem?.message) msg = problem.message;
          if (problem?.code) msg += `\n(code: ${problem.code})`;
        } catch {
        }
        throw new Error(msg);
      }
      alert("인증번호를 이메일로 보냈습니다. 메일함을 확인해 주세요.");
    } catch (err: any) {
      alert(err?.message ?? "문제가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setEmailSending(false);
    }
  }

  // 회원가입 제출
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
        userPw,                 // 서버에서 해시 처리
        creadtedAt: createdAt,  
        consents: tos ? ["TOS"] : [],
      };

      const endpoint = API_BASE
        ? `${API_BASE}/api/auth/signup`
        : "/api/auth/signup";

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

              {/* userId */}
              <label className="text-left text-sm font-medium text-gray-700">
                아이디
                <input
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="아이디를 입력해주세요."
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>

              {/* userPw */}
              <label className="text-left text-sm font-medium text-gray-700">
                비밀번호
                <input
                  type="password"
                  required
                  value={userPw}
                  onChange={(e) => setUserPw(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>

              {/* email + 인증코드 발송 */}
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
                    disabled={emailSending || !email}
                    className={BTN}
                  >
                    {emailSending ? "전송 중..." : "인증번호 받기"}
                  </button>
                </div>

                {/* 인증코드 입력 + 인증하기 */}
                <div className="mt-1 flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="999999"
                    step="1"
                    required
                    placeholder="인증코드"
                    // flex 영향 완전 차단 + 고정 너비 강제 + 중앙 정렬
                    className="
                      flex-none grow-0 shrink-0
                      !w-24 md:!w-28
                      text-center rounded-lg border border-gray-300 px-3 py-2
                      outline-none focus:ring-2 focus:ring-indigo-500
                      [&::-webkit-outer-spin-button]:appearance-none
                      [&::-webkit-inner-spin-button]:appearance-none
                    "
                  />
                  <button type="button" className={BTN}>
                    인증하기
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
