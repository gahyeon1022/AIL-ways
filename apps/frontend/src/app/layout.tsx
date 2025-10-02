"use client"

import "./globals.css";
import Header from "@/components/layout/header";
import { usePathname } from "next/navigation";


export default function RootLayout({ children }: { children: React.ReactNode }) { //children은 모든 타입 다 수용
  const pathname = usePathname();

  const hideHeaderRoutes = ["/", "/login", "/signup", "/select"];

  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col bg-gradient-to-r from-rose-quartz-500 to-serenity-500">
          {!hideHeaderRoutes.includes(pathname) && <Header />} 
        <div className="flex-1 flex items-center justify-center">
          {children}    {/*부모가 넘긴 페이지 내용이 그대로 꽃힘 */}
        </div>
      </body>
    </html>
  );
}
