import "./globals.css";
import NavBar from "../components/NavBar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col bg-gradient-to-r from-rose-quartz-500 to-serenity-500">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          {children}
        </div>
      </body>
    </html>
  );
}
