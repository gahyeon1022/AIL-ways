"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LocalSignupModal from "@/app/signup/components/LocalSignupModal";

export default function SignupPage() {
    const [open, setOpen] = useState(false);
  return (
    <div className="h-[200px] flex flex-col justify-center bg-white/70 p-8 rounded-2xl shadow-lg text-center w-full max-w-sm">
      <div className="grid gap-3">

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

        <div className= "h-[1px] bg-gray-300"/>
        <div className= "relative">
          <Link href="/login" className="text-blue-500 hover:underline text-sm">
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
       <LocalSignupModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
