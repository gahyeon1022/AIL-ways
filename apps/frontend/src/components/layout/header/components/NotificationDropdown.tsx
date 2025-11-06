"use client";

import { X, Mail } from "lucide-react";
import { useEffect, useRef } from "react";

type NotificationDropdownProps = {
  open: boolean;
  onClose: () => void;
  count?: number; // 배지 숫자
};

export default function NotificationDropdown({
  open,
  onClose,
  count = 0,
}: NotificationDropdownProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // 바깥 클릭/ESC 닫기
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="알림"
      className="absolute right-0 top-full mt-2 w-[420px] max-w-[90vw] rounded-2xl border border-black/10 bg-white shadow-xl z-50 overflow-hidden"
    >
      {/* 상단 바 */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          <span className="text-base font-semibold">알림</span>
          <span className="ml-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#D33] px-2 text-xs font-bold text-white">
            {count}
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="닫기"
          className="p-1 rounded-md hover:bg-black/5"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* 본문 (빈 상태) */}
      <div className="h-[360px] flex items-center justify-center">
        <p className="text-gray-400 text-lg">알림이 없습니다</p>
      </div>
    </div>
  );
}
