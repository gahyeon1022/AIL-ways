"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HomeLanding() {
  return (
    <div className="text-center">
      <h1 className="relative -mt-[40px] top-[-10px] text-[15rem] font-extrabold tracking-tight text-white drop-shadow">
        AIL-ways
      </h1>

      <div className="relative -top-5 mt-3 flex items-baseline justify-center gap-2 text-2xl text-white/90">
        <Image
          src="/wing_left.png"
          alt="왼쪽 날개"
          width={100}
          height={100}
          className="relative left-3 top-4"
        />
        학습에 날개를 달아보세요!
        <Image
          src="/wing_right.png"
          alt="오른쪽 날개"
          width={100}
          height={100}
          className="relative right-3 top-4"
        />
      </div>

      <div className="mt-8">
        <motion.div
          animate={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <Link
            href="/login"
            className="inline-block rounded-full bg-white/50 px-10 py-4 text-lg font-semibold text-gray-900 shadow-lg transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-white/70 active:scale-95"
          >
            학습하러가기
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
