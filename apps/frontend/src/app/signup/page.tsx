"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LocalSignupModal from "@/components/LocalSignupModal";

export default function SignupPage() {
    const [open, setOpen] = useState(false);
  return (
    <div className="bg-white/70 p-8 rounded-2xl shadow-lg text-center w-full max-w-sm">
      <div className="grid gap-3">
        <Link
          href="/auth/kakao" // /api/auth/signin/kakao, 직접 구현이면 백엔드 시작점으로 변경
          className="relative flex item-center w-full justify-center rounded-xl px-4 py-3 font-medium bg-[#FEE500] text-black hover:brightness-95 transition inline-block">
          <Image src="/kakao_logo.png" alt="Kakao" width={23} height={23} className="absolute left-5 top-3.5"/>
          <span className="leading-none">카카오로 회원가입</span>
        </Link>

        <Link
          href="/auth/google" // /api/auth/signin/google 로 변경
          className="relative flex item-center justify-center w-full rounded-xl px-4 py-3 font-medium bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 transition inline-block">
          <Image src="/google_logo.png" alt="google" width={20} height={20} className="absolute left-5 top-4"/>
          <span className="leading-none">구글로 회원가입</span>
        </Link>

         <button
          onClick={() => setOpen(true)}
          className="relative flex items-center justify-center w-full rounded-xl px-4 py-3 font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition"
        >
          <Image
            src="/letter.png"
            alt="letter"
            width={23}
            height={23}
            className="absolute left-5 top-3"
          />
          이메일로 회원가입
        </button>
      </div>

       <LocalSignupModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
