import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">AIL-ways 메인</h1>
      <nav className="flex flex-col gap-4 items-center">
        <Link href="/learning-report" className="text-blue-600 hover:underline">
          학습 리포트
        </Link>
        <Link href="/mentee-summary" className="text-blue-600 hover:underline">
          멘티 학습 요약
        </Link>
        <Link href="/learning-screen" className="text-blue-600 hover:underline">
          학습 화면
        </Link>
        <Link
          href="/weekly-dashboard"
          className="text-blue-600 hover:underline"
        >
          주간 대시보드
        </Link>
      </nav>
    </main>
  );
}
