"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

import { Button } from "../../ui/Button";
import UserMenu from "./components/ProfileDropdown";
import NotificationDropdown from "./components/NotificationDropdown";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full px-8 py-4">
      <div className="mx-auto grid h-16 grid-cols-[auto_1fr_auto] items-center">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="bg-gradient-to-r text-white bg-clip-text text-3xl font-semibold tracking-tight drop-shadow-[0_4px_14px_rgba(0,0,0,0.35)]">
            AIL-Ways
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex h-full items-center justify-center space-x-10 text-[20px] text-white/90 px-8">
          <Link href="/mentoring-current" className="group inline-flex flex-col items-center mr-4">
            <Button variant="ghost" className="text-[20px] font-normal w-[150px] justify-center">
              멘토링 현황
            </Button>
            <span className="mt-1 block h-[2px] w-full max-w-[130px] rounded-full bg-white/50 transition group-hover:bg-white" />
          </Link>
          <Link href="/home" className="group inline-flex flex-col items-center">
            <Button variant="ghost" className="text-[20px] font-normal w-[150px] justify-center">
              홈
            </Button>
            <span className="mt-1 block h-[2px] w-full max-w-[70px] rounded-full bg-white/50 transition group-hover:bg-white" />
          </Link>
          <Link href="/mentoring-current?intent=board" className="group inline-flex flex-col items-center -ml-10">
            <Button variant="ghost" className="text-[20px] font-normal w-[150px] justify-center">
              게시판
            </Button>
            <span className="mt-1 block h-[2px] w-full max-w-[90px] rounded-full bg-white/50 transition group-hover:bg-white" />
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
