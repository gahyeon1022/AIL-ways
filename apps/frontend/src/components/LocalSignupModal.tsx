"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = { //부모 컴포넌트에서 전달 받음. 모달 열렸는지
  open: boolean;
  onClose: () => void;
};

function formatNow(): string { //현재 시간을 문자열로 변환하는
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}

export default function LocalSignupModal({ open, onClose }: Props) { //회원가입 입력값 관리
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [userPw, setUserPw] = useState("");
  const [tos, setTos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdAt, setCreatedAt] = useState<string>(""); // 성공 시점에 채움


  async function onSubmit(e: React.FormEvent) { //폼 제출될때 호출되는 이벤트 핸들러
  e.preventDefault(); //새로고침 방지
    if (!tos) {
      alert("약관(TOS)에 동의해 주세요.");
      return;
    }
    setLoading(true);  //서버로 보낼 요청 생성
    try {
      const payload = {
        email,
        userName,
        userId,
        userPw,        // 서버에서 해시 처리
        creadtedAt: createdAt, // 요청하신 키 철자 그대로 사용
        consents: tos ? ["TOS"] : [],
      };
      {/* api 요청 */}
      const res = await fetch("api/auth/signup", { //api경로로 수정해주세요
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
      alert(err.message ?? "문제가 발생했습니다.");
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
          <button
            onClick={onClose}
            className="absolute inset-0 bg-black/40"
          />

          {/* Panel */}
          <motion.div
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="absolute left-1/2 top-10 w-[92vw] max-w-md -translate-x-1/2
                       rounded-2xl bg-white/90 backdrop-blur p-6 shadow-2xl"
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

              {/* email */}
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
                    className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                  >
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
