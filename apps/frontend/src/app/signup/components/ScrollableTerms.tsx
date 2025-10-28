"use client";

import { useEffect, useState } from "react";

export default function ScrollableTerms({
  src,
  className = "",
}: {
  src: string;      // 예: "/terms/tos.md"
  className?: string;
}) {
  const [text, setText] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    fetch(src, { cache: "force-cache" })
      .then(async (res) => {
        if (!res.ok) throw new Error("약관을 불러오지 못했습니다.");
        const t = await res.text();
        if (alive) setText(t);
      })
      .catch((error: unknown) => {
        if (!alive) return;
        const message = error instanceof Error ? error.message : "로드 오류";
        setErr(message);
      });
    return () => { alive = false; };
  }, [src]);

  return (
    <div
      className={
        "mt-2 max-h-[80px] overflow-y-auto rounded-lg border border-gray-200 " +
        "bg-gray-50 p-5 text-[13px] leading-6 text-gray-800 whitespace-pre-wrap " +
        className
      }
    >
      {!text && !err && "불러오는 중..."}
      {err ? err : text}
    </div>
  );
}
