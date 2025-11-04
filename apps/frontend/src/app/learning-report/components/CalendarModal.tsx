"use client";
import React, { useMemo, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onPick: (dateStr: string) => void; // 날짜 선택 콜백
  initialMonth?: Date;
  title?: string;
};

const W = ["일","월","화","수","목","금","토"];
const pad = (n: number) => String(n).padStart(2,"0");
const fmt = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const daysInMonth = (y:number,m0:number) => new Date(y, m0+1, 0).getDate();

export default function CalendarModal({
  open,
  onClose,
  onPick,
  initialMonth,
  title="날짜 선택",
}: Props) {
  const today = useMemo(()=>new Date(),[]);
  const [view, setView] = useState<Date>(initialMonth ?? today);
  if (!open) return null;

  const y = view.getFullYear();
  const m = view.getMonth();
  const first = new Date(y,m,1);
  const firstDow = first.getDay();
  const dim = daysInMonth(y,m);

  const cells: (Date|null)[] = [];
  for (let i=0;i<firstDow;i++) cells.push(null);
  for (let d=1; d<=dim; d++) cells.push(new Date(y,m,d));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog" aria-modal="true" onClick={onClose}
    >
      <div
        className="w-[92vw] max-w-md rounded-2xl bg-white p-5 shadow-2xl"
        onClick={(e)=>e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded px-2 py-1 text-gray-500 hover:bg-gray-100">✕</button>
        </div>

        {/* 월 이동 */}
        <div className="mb-3 flex items-center justify-between">
          <button onClick={()=>setView(new Date(y,m-1,1))} className="rounded border px-3 py-1 hover:bg-gray-50">◀</button>
          <div className="text-sm font-medium">{y}년 {m+1}월</div>
          <button onClick={()=>setView(new Date(y,m+1,1))} className="rounded border px-3 py-1 hover:bg-gray-50">▶</button>
        </div>

        {/* 요일 */}
        <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-600">
          {W.map(w => <div key={w} className="py-1">{w}</div>)}
        </div>

        {/* 날짜 그리드 (모두 클릭 가능) */}
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((c, i) => {
            if (!c) return <div key={i} />;
            const isToday =
              c.getFullYear()===today.getFullYear() &&
              c.getMonth()===today.getMonth() &&
              c.getDate()===today.getDate();
            return (
              <button
                key={i}
                onClick={()=>onPick(fmt(c))}
                className={[
                  "flex h-12 items-center justify-center rounded-md border",
                  "border-gray-200 bg-white hover:border-indigo-400 hover:shadow",
                  isToday ? "ring-2 ring-indigo-400" : ""
                ].join(" ")}
                title="날짜 선택"
              >
                <span className="text-sm">{c.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
