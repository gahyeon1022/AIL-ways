"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/Button"; 
import { UserCircle } from "lucide-react";

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null); 
  const menuRef = useRef<HTMLDivElement>(null);  
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  // --- 위치 계산: 버튼 바로 아래, 우측 정렬(너비 고정으로 계산 단순화) ---
  const MENU_W = 160;
  const GAP = 8;
  const compute = () => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const left = Math.max(8, Math.min(r.right - MENU_W, window.innerWidth - MENU_W - 8));
    const top = Math.min(r.bottom + GAP, window.innerHeight - 8);
    setPos({ top, left });
  };

  // 열릴 때만 스크롤/리사이즈에 반응으로 불필요 리스너 최소화
  useLayoutEffect(() => {
    if (!open) return;
    compute();
    const onScroll = () => compute();
    const onResize = () => compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  // 외부 클릭/ESC로 닫기(열렸을 때만)
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        anchorRef.current?.contains(t) ||
        menuRef.current?.contains(t)
      ) return; 
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <div ref={anchorRef} className="relative flex-shrink-0">
        <Button variant="ghost" onClick={() => setOpen((v) => !v)}>
          <UserCircle className="h-7 w-7 text-gray-700" />
        </Button>
      </div>

      {open && typeof window !== "undefined" && createPortal(
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            width: MENU_W,
            zIndex: 1000, // 충분히 큰 값
          }}
          className="rounded-md border border-gray-200 bg-white shadow-lg"
        >
          <Link
            href="/profile"
            className="block w-full px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            내 정보
          </Link>
        </div>,
        document.body
      )}
    </>
  );
}
