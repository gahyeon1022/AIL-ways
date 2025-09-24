"use client";
import React from "react";

export default function QnaBoard() {
  return (
    <main className="min-h-screen w-full p-6">
      <div className="mx-auto max-w-6xl">
        <section className="relative rounded-[48px] bg-white/45 shadow-[0_20px_60px_rgba(0,0,0,0.08)] ring-1 ring-white/60 backdrop-blur-xl overflow-hidden">
          {/* 제목 */}
          <div className="pt-10 pb-4">
            <h1 className="text-center text-5xl font-semibold tracking-tight text-white drop-shadow-sm">
              Q&amp;A
            </h1>
          </div>

          {/* 헤더 */}
          <div className="border-t border-white/60" />
          <div
            className="text-center grid px-12 py-6 text-lg font-medium text-slate-700/80"
            style={{ gridTemplateColumns: "120px 1.6fr 1.6fr 1fr 1fr" }}
          >
            <div className="pr-6">질문 번호</div>
            <div className="pl-8">제목</div>
            <div className="pl-8">질문 내용</div>
            <div className="pl-8">작성일</div>
            <div className="pl-8">완료 여부</div>
          </div>
          <div className="border-t border-white/60" />

          {/* 데이터 행 */}
          <div
            className="text-center grid px-12 py-9 text-slate-700"
            style={{ gridTemplateColumns: "120px 1.8fr 1.6fr 1fr 1fr" }}
          >
            <div className="text-xl pr-6">1</div>
            <div className="pl-8">
              <div className="flex items-center gap-4">
                <span className="text-xl font-semibold leading-none">
                  2025.09.09
                </span>
                <span className="text-xl">첫번째 학습</span>
              </div>
            </div>
            <div className="pl-8 text-xl text-slate-500"></div>
            <div className="pl-8 text-xl text-slate-500"></div>
            <div className="pl-8 text-2xl font-semibold">
              미완료
            </div>
          </div>

          {/* 빈 줄 */}
          <div className="h-20 border-t border-white/60"></div>
          <div className="h-20 border-t border-white/60"></div>
          <div className="h-20 border-t border-white/60"></div>
          <div className="h-20 border-t border-white/60"></div>
          <div className="h-20 border-t border-white/60"></div>
          <div className="h-20 border-t border-white/60"></div>

          {/* 검색 영역 */}
          <div className="absolute inset-x-0 bottom-6 flex w-full items-center justify-center gap-3 px-6">
            <select className="h-9 rounded-full bg-white/90 px-4 text-sm text-slate-700 shadow-inner outline-none">
              <option>전체</option>
            </select>
            <input
              type="text"
              className="h-9 w-[520px] rounded-full bg-white/90 px-4 text-sm text-slate-700 shadow-inner outline-none"
            />
            <button className="h-9 rounded-full bg-white/95 px-4 text-sm font-medium text-slate-800 shadow">
              검색
            </button>
          </div>

          <div className="h-16"></div>
        </section>

        <div className="mt-6 h-6 rounded-full bg-transparent"></div>
      </div>
    </main>
  );
}
