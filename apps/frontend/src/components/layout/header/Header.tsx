"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { Bell } from "lucide-react";

import { Button } from "../../ui/Button";
import UserMenu from "./components/ProfileDropdown";
import NotificationDropdown from "./components/NotificationDropdown";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const intent = searchParams?.get("intent");

  const { isMentoring, isBoard, isHome } = useMemo(() => {
    const onMentoringRoute = pathname?.startsWith("/mentoring-current") ?? false;
    const boardByIntent = onMentoringRoute && intent === "board";
    const onBoardPage = boardByIntent || (pathname?.startsWith("/qna-boards") ?? false);
    return {
      isMentoring: onMentoringRoute && !onBoardPage,
      isBoard: onBoardPage,
      isHome: pathname === "/home" || pathname === "/",
    };
  }, [intent, pathname]);

  const navBtnClass = (active: boolean) =>
    clsx(
      "text-[20px] font-medium w-[150px] justify-center transition-all duration-200",
      active
        ? "text-white bg-white/15 border border-white/30 shadow-[0_10px_30px_rgba(15,23,42,0.28)]"
        : "text-white/80 hover:text-white"
    );

  const underlineClass = (active: boolean) =>
    clsx(
      "mt-1 block h-[2px] rounded-full transition-all duration-200",
      active ? "bg-white opacity-100" : "bg-white/50 opacity-100"
    );

  return (
    <header className="w-full px-8 py-4">
      <div className="mx-auto grid h-16 grid-cols-[auto_1fr_auto] items-center">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="bg-gradient-to-r text-white bg-clip-text text-3xl font-semibold tracking-tight drop-shadow-[0_4px_14px_rgba(0,0,0,0.35)]">
            AIL-ways
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex h-full items-center justify-center space-x-10 text-[20px] text-white/90 px-10 translate-x-[11px]">
          <Link href="/mentoring-current" className="group inline-flex flex-col items-center mr-4">
            <Button variant="ghost" className={navBtnClass(isMentoring)}>
              멘토링 현황
            </Button>
            <span className={clsx(underlineClass(isMentoring), "w-full max-w-[130px]")} />
          </Link>
          <Link href="/home" className="group inline-flex flex-col items-center">
            <Button variant="ghost" className={navBtnClass(false)}>
              홈
            </Button>
            <span className={clsx(underlineClass(false), "w-full max-w-[70px]")} />
          </Link>
          <Link href="/mentoring-current?intent=board" className="group inline-flex flex-col items-center -ml-6">
            <Button variant="ghost" className={navBtnClass(isBoard)}>
              게시판
            </Button>
            <span className={clsx(underlineClass(isBoard), "w-full max-w-[90px]")} />
          </Link>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center justify-self-end gap-3">
          <div className="relative">
            <Button variant="ghost" onClick={() => setOpen(v => !v)}>
              <Bell className="h-6 w-6" />
            </Button>
            <NotificationDropdown open={open} onClose={() => setOpen(false)} count={3} />
          </div>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
