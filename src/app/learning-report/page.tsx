export default function LearingReportPage() {
  return (
    <main className="min-h-screen">
      <header className="from-rose-quartz-500 to-serenity-500 p-4">
        <div className="flex flex-col items-center">
          {/* 상단 로고 / 타이틀 */}
          <h1 className="text-xl font-bold mb-2 self-start">AIL-Ways</h1>

          {/* 네비게이션 메뉴 */}
          <nav className="flex gap-30 space-x-8">
            <a href="#" className="hover:underline">
              멘토링 현황
            </a>
            <a href="#" className="hover:underline">
              홈
            </a>
            <a href="#" className="hover:underline">
              게시판
            </a>
          </nav>
        </div>
      </header>

      {/* 본문 */}
      <section className="flex-1 flex items-center justify-center">
        <div className="w-[80%] flex items-center justify-between">
          {/* 멘티 이름 및 화살표&달력 */}
          <div className="inline-block bg-white/95 rounded-full px-10 py-3 shadow mb-4">
            <span className="text-xl font-semibold tracking-tight">
              OOO 멘티
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="bg-white rounded-full px-3 py-3 shadow mb-4 hover: cursor-pointer"
            >
              &lt;
            </button>
            <button
              type="button"
              className="bg-white rounded-full px-3 py-3 shadow mb-4 hover: cursor-pointer"
            >
              &gt;
            </button>
            <button
              type="button"
              className="bg-white rounded-full px-3 py-3 shadow mb-4 hover: cursor-pointer"
            >
              YYYY-MM-DD
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto">
        {/*  학습 내용 요약 */}
        <div
          className="rounded-2xl border border-black/10 shadow-md
                     bg-gradient-to-r from-white/95 via-white/85 to-rose-100/70
                     flex-1 p-5 w-[80%] mx-auto mb-5"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            학습 내용 요약
          </h2>

          <div className="w-full h-[150px] rounded-lg border bg-white/85">
            <p className="text-gray leading-relaxed px-5 py-5">
              요약 내용(추후 백에서 받아올 예정)
            </p>
          </div>
        </div>

        {/*  학습 행동 분석 */}
        <div
          className="rounded-2xl border border-black/10 shadow mb-4
                     bg-gradient-to-r from-white/95 via-white/85 to-rose-100/70
                     flex-1 p-5 w-[80%] mx-auto mb-5"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            학습 행동 분석
          </h2>

          <div className="w-full h-[150px] rounded-lg border bg-white/85">
            <p className="text-gray leading-relaxed px-5 py-5">
              분석 내용(추후 백에서 받아올 예정)
            </p>
          </div>
        </div>

        {/*  자기 피드백 */}
        <div
          className="rounded-2xl border border-black/10 shadow-md
                     bg-gradient-to-r from-white/95 via-white/85 to-rose-100/70
                     flex-1 p-5 w-[80%] mx-auto mb-5"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">자기 피드백</h2>

          <div className="w-full h-[150px] rounded-lg border bg-white/85">
            <p className="text-gray leading-relaxed px-5 py-5">
              피드백 내용(추후 백에서 받아올 예정)
            </p>
          </div>
        </div>

        {/*  멘토 피드백 */}
        <div
          className="rounded-2xl border border-black/10 shadow-md
                     bg-gradient-to-r from-white/95 via-white/85 to-rose-100/70
                     flex-1 p-5 w-[80%] mx-auto mb-5"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">멘토 피드백</h2>

          <div
            className="w-full h-[340px] sm:h-[380px] md:h-[150px]
                       rounded-lg border bg-white/85"
          >
            <p className="text-gray leading-relaxed px-5 py-5">
              피드백 내용(추후 백에서 받아올 예정)
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
