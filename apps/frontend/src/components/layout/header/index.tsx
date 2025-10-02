"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

import { Button } from "../../ui/Button";           
import UserMenu from "./ProfileDropdown";           
import NotificationDropdown from "./NotificationDropdown"; 

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full bg-gradient-to-r from-rose-quartz-500 to-serenity-500 px-6 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto relative h-14">
        {/* Logo */}
        <div className="absolute left-0 inset-y-0 flex items-center">
          <h1 className="text-white text-2xl font-semibold tracking-tight">
            AIL-Ways
          </h1>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center justify-center h-full space-x-8">
          <Link href="/mentoring-current">
            <Button variant="ghost">멘토링 현황</Button>
          </Link>
          <Button variant="ghost">홈</Button>
          <Link href="/board-list">
            <Button variant="ghost">게시판</Button>
          </Link>
        </nav>

        {/* Right side actions */}
        <div className="absolute right-0 inset-y-0 flex items-center gap-4">
          <div className="relative">
            <Button
              variant="ghost"
              aria-haspopup="dialog"
              aria-expanded={open}
              onClick={() => setOpen(v => !v)}
            >
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
