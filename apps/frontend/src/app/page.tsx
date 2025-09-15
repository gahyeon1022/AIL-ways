import Link from "next/link";

export default function HomePage() {
  return (
    <div className="text-center">
      <h1 className="text-9xl md:text-12xl font-extrabold tracking-tight text-white drop-shadow">
        AIL-ways
      </h1>

      <p className="text-2xl mt-3 text-white/90">학습에 날개를 달아보세요🪽</p>

      <div className="mt-8">
        <Link
          href="/signin"
          className="inline-block rounded-full px-10 py-4 text-lg font-semibold 
                     bg-white/90 text-gray-900 shadow-lg 
                     hover:bg-white transition 
                     focus:outline-none focus:ring-2 focus:ring-white/70 
                     active:scale-95"
          aria-label="시작하기"
        >
          시작하기
        </Link>
      </div>
    </div>
  );
}
