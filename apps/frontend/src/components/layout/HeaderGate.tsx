"use client";

// Gate는 "표시 여부"만 담당하고, 실제 UI는 Header가 책임지도록 분리.

import { usePathname } from "next/navigation";
import Header from "@/components/layout/header"; // index.tsx의 default export

const HIDE_ROUTES = new Set<string>(["/", "/login", "/signup", "/select"]);

export default function HeaderGate() {
  const pathname = usePathname();
  if (HIDE_ROUTES.has(pathname)) return null; // 숨길 페이지는 헤더 생략
  return <Header />; // 나머지 페이지에서는 헤더 노출
}
