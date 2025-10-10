"use client";

import ScrollableTerms from "@/components/ui/ScrollableTerms";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  checkUserIdAction,
  sendEmailCodeAction,
  verifyEmailCodeAction,
  signupAction,
} from "@/app/_actions/auth";

const BTN =
  "inline-flex items-center justify-center shrink-0 min-w-[64px] " +
  "rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

type Props = { open: boolean; onClose: () => void };

export default function LocalSignupModal({ open, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [userPw, setUserPw] = useState("");
  const [tos, setTos] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [videoCapture, setVideoCapture] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [idChecking, setIdChecking] = useState(false);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  async function checkUserId() {
    if (idChecking) return;
    setIdChecking(true);
    const r = await checkUserIdAction(userId);
    alert(r.msg ?? (r.isAvailable ? "사용 가능" : "이미 사용 중"));
    setIdChecking(false);
  }

  async function sendEmailCode() {
    if (emailSending) return;
    setEmailSending(true);
    const r = await sendEmailCodeAction(email);
    alert(r.msg);
    setEmailSending(false);
  }

  async function verifyEmailCode() {
    if (verifying) return;
    setVerifying(true);
    const r = await verifyEmailCodeAction(email, code);
    alert(r.msg);
    setVerifying(false);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const r = await signupAction(formData);
    alert(r.msg);
    if (r.ok) onClose();
    setLoading(false);
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
          <button onClick={onClose} className="absolute inset-0 bg-black/40" />
          <motion.div
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="absolute left-1/2 top-10 w-[92vw] max-w-md -translate-x-1/2 rounded-2xl bg-white/90 backdrop-blur p-5 max-h-[90vh] flex flex-col shadow-2xl "
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">이메일로 회원가입</h2>
            <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 grid gap-3 text-left">
              <label className="text-sm font-medium text-gray-700">
                이름
                <input name="userName" value={userName} onChange={(e)=>setUserName(e.target.value)} required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"/>
              </label>

              <label className="text-sm font-medium text-gray-700">
                아이디
                <div className="mt-1 flex gap-2">
                  <input name="userId" value={userId} onChange={(e)=>setUserId(e.target.value)} required className="flex-1 rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"/>
                  <button type="button" onClick={checkUserId} disabled={idChecking} className={BTN}>
                    {idChecking ? "확인 중..." : "중복 확인"}
                  </button>
                </div>
              </label>

              <label className="text-sm font-medium text-gray-700">
                비밀번호(대소문자 + 특수문자 + 8자리 이상)
                <input name="userPw" type="password" value={userPw} onChange={(e)=>setUserPw(e.target.value)} required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"/>
              </label>

              <label className="text-sm font-medium text-gray-700">
                이메일
                <div className="mt-1 flex gap-2">
                  <input name="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="flex-1 rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"/>
                  <button type="button" onClick={sendEmailCode} disabled={emailSending} className={BTN}>
                    {emailSending ? "전송 중..." : "인증번호 받기"}
                  </button>
                </div>

                <div className="mt-1 flex items-center gap-3">
                  <input name="code" value={code} onChange={(e)=>setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} required className="!w-24 text-center rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"/>
                  <button type="button" onClick={verifyEmailCode} disabled={verifying} className={BTN}>
                    {verifying ? "확인 중..." : "인증번호 확인"}
                  </button>
                </div>
              </label>

              <div className="flex flex-col gap-1">
              <label className="mt-2 mb-0 flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" name="tos" checked={tos} onChange={(e)=>setTos(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                (필수) 서비스 이용 약관
              </label>
               <ScrollableTerms src="/terms/tos.md" className="mt-0 p-3 text-[12px] leading-5"/>
               </div>

               <div className="flex flex-col gap-1">
               <label className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" name="privacy" checked={privacy} onChange={(e)=>setPrivacy(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                (필수) 개인정보 처리방침
              </label>
               <ScrollableTerms src="/terms/privacy.md" />
               </div>

              <div className="flex flex-col gap-1">
               <label className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" name="videoCapture" checked={videoCapture} onChange={(e)=>setVideoCapture(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                (필수) 영상 촬영·분석 동의서
              </label>
               <ScrollableTerms src="/terms/video_capture.md" />
              </div>

              <button type="submit" disabled={loading} className="mt-3 w-full rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                {loading ? "처리 중..." : "가입하기"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
