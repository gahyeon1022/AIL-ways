import "./globals.css";
import HeaderGate from "@/components/layout/HeaderGate";

export const metadata = {
  icons: {
    icon: [ { url: "/AIL-ways_fav.ico" }
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col bg-gradient-to-r from-rose-quartz-500 to-serenity-500">
        <HeaderGate /> {/* 경로 기반 노출 제어는 얇은 클라에서 처리 */}
        <div className="flex-1 flex items-center justify-center">
          {children}
        </div>
      </body>
    </html>
  );
}
