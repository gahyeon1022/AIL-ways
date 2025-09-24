"use client"

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

type Props = { //부모 컴포넌트에서 전달 받음. 모달 열렸는지
  open: boolean;
  onClose: () => void;
};

export default function LocalSignupModal({ open, onClose }: Props) { //회원가입 입력값 관리
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [userPw, setUserPw] = useState("");
  const [loading, setLoading] = useState(false);


  async function onSubmit(e: React.FormEvent) { //폼 제출될때 호출되는 이벤트 핸들러
  e.preventDefault(); //새로고침 방지
   if (!userId || !userPw) return;

    setLoading(true);  //서버로 보낼 요청 생성
    try {
      {/* api 요청 */}
      const res = await fetch("http://localhost:8080/api/auth/local/signup", { //api경로로 수정해주세요
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
         body: JSON.stringify({
          userId,      // string
          userPw,      // string
        }),
      });

      if (!res.ok) throw new Error("로그인 실패");
      router.replace("/select");
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
              <h2 className="text-lg font-semibold text-gray-800">이메일로 로그인</h2>
              <button
                onClick={onClose}
                className="rounded p-1 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={onSubmit} className="grid gap-3 text-left">
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

              <button
                type="submit"
                disabled={loading}
                className="mt-3 w-full rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "처리 중..." : "로그인"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
