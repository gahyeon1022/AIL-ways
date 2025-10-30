"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="text-center">
      <h1 className="relative top-[-10px] text-[15rem] font-extrabold tracking-tight text-white drop-shadow -mt-[40px]">
        AIL-ways
      </h1>

        <div className="relative -top-5 flex items-baseline justify-center text-2xl mt-3 text-white/90 gap-2">
          <Image src="/wing_left.png" alt="왼쪽 날개" width={100} height={100} className="relative top-4 left-3"/>
              학습에 날개를 달아보세요!
          <Image src="/wing_right.png" alt="오른쪽 날개" width={100} height={100} className="relative top-4 right-3" />
        </div>

      <div className="mt-8">
        <motion.div
        animate={{ rotate: [0, -5, 5, -5, 0] }} // 좌우로 흔들림
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <Link
          href="/login"
          className="inline-block rounded-full px-10 py-4 text-lg font-semibold 
                     bg-white/50  text-gray-900 shadow-lg 
                     hover:bg-white transition 
                     focus:outline-none focus:ring-2 focus:ring-white/70
                     active:scale-95"
          >
          시작하기
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
