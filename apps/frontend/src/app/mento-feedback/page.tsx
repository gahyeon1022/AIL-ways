'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function MenteeSummaryPage() {
  const [inputValue, setInputValue] = useState('');

  return (
    <main className="min-h-screen">
      {/* 본문 */}
      <section className="w-[80%] mx-auto">
        {/* 멘티 이름 배지 */}
        <div className="inline-block bg-white/95 rounded-full px-10 py-3 shadow mb-4">
          <span className="text-xl font-semibold tracking-tight">OOO 멘티</span>
        </div>

        {/* 큰 카드 영역 */}
        <div
          className="rounded-2xl border border-black/10 shadow-md
                     bg-gradient-to-r from-white/95 via-white/85 to-rose-100/70
                     p-5 sm:p-6 md:p-7 w-full"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            학습 내용 요약
          </h2>

          {/* 요약 박스 */}
          <div
            className="w-full h-[340px] sm:h-[380px] md:h-[350px]
                       rounded-lg border bg-white/85"
          >
            <p className="text-gray leading-relaxed px-5 py-5">
              요약 내용(추후 백에서 받아올 예정)
            </p>
          </div>

          {/* 입력창 + 버튼 */}
          <div className="mt-6 flex gap-7 items-end">
            <textarea
              placeholder="피드백을 입력해주세요."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              rows={1}
              className="w-[90%] rounded-xl px-5 py-3 bg-gray-100/90 border
                   focus:outline-none focus:ring-2 focus:ring-black/10
                   resize-none overflow-hidden leading-relaxed"
              onInput={(e) => {
                e.currentTarget.style.height = 'auto'; // 높이 초기화
                e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`; // 자동 확장
              }}
            />
            <button
              type="button"
              disabled={inputValue.trim() === ''}
              className={`px-6 py-3 rounded-xl font-semibold transition
                ${
                  inputValue.trim() === ''
                    ? 'bg-gray-300 text-white'
                    : 'bg-rose-quartz-500 text-white hover:bg-rose-quartz-600 cursor-pointer'
                }`}
            >
              입력
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
