"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import LocalLoginModal from "@/components/modal/LocalLoginModal"; // 경로는 프로젝트 구조에 맞게

export default function LoginPage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white/70 p-8 rounded-2xl shadow-lg text-center w-full max-w-sm">
      <div className="grid gap-3">
        <Link
          href="/auth/kakao" // /api/auth/signin/kakao, 직접 구현이면 백엔드 시작점으로 변경
          className="relative item-center w-full justify-center rounded-xl px-4 py-3 font-medium bg-[#FEE500] text-black hover:brightness-95 transition inline-block">
          <Image src="/kakao_logo.png" alt="Kakao" width={23} height={23} className="absolute left-5 top-3.5"/>
          <span className="leading-none">카카오로 로그인</span>
        </Link>
 
        <Link
          href="/auth/google" // /api/auth/signin/google 로 변경
          className="relative item-center justify-center w-full rounded-xl px-4 py-3 font-medium bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 transition inline-block">
          <Image src="/google_logo.png" alt="google" width={20} height={20} className="absolute left-5 top-4"/>
          <span className="leading-none">구글로 로그인</span>
        </Link>

        <button
          onClick={() => setOpen(true)}
          className="relative item-center justify-center w-full rounded-xl px-4 py-3 font-medium bg-indigo-500 text-white hover:bg-indigo-500 transition inline-block">
          <Image src="/letter.png" alt="letter" width={23} height={23} className="absolute left-5 top-3"/>
          이메일로 로그인
        </button>
        
        <div className="h-[1px] bg-gray-300"/>
        <div className="relative">
          <span className="absolute left-1/2 -translate-x-1/2 -top-1 text-xs text-gray-500 rounded">
            회원이 아니신가요?{" "}
              <Link href="/signup" className="text-blue-500 hover:underline">
                회원가입
              </Link>
          </span>
        </div>
      </div>
      <LocalLoginModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
