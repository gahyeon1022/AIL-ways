import { Bell }  from "lucide-react";
import { Button } from "../ui/Button";
import { UserCircle } from "lucide-react";
import Link from "next/link";
//어디에 추가 안할지 정해야함.
export function Header() {
  return (
    <header className="w-full bg-gradient-to-r from-rose-quartz-500 to-serenity-500 px-6 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0">
          <h1 className="text-white text-2xl font-semibold tracking-tight">
            AIL-Ways
          </h1>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Button 
            variant="ghost" 
          >
            홈
          </Button>
          <Link href="/MentoringCurrent">
          <Button 
            variant="ghost" 
          >
            멘토링 현황
          </Button>
          </Link>
          <Link href="/BoardList">
          <Button
            variant="ghost" 
          >
            게시판
          </Button>
          </Link>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <Button 
              variant="ghost" 
            >
              <Bell className="h-6 w-6" />
            </Button>
            {/* <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
            >
              <span className="sr-only">New notifications</span>
            </Badge> */}
          </div>

          {/* Profile */}
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
            >
            <UserCircle className="h-7 w-7 text-gray-700"/>
            </Button>
          </div>
        </div>
    </div>
    </header>
  );
}