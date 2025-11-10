export default function WeeklyDashboardPage() {
  return (
    <main className="min-h-screen">
      <section className="w-[80%] mx-auto space-y-10">
        <div className="rounded-2xl border border-black/10 shadow-md bg-white p-5 sm:p-6 md:p-7 w-full">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">주간 리포트</h2>
          {/* 주간 리포트 내용 추가 */}
          <div className="w-full h-[150px] rounded-lg border bg-white/85">
            <p className="text-gray leading-relaxed px-5 py-5">
              주간 리포트(추후 백에서 받아올 예정)
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-black/10 shadow-md bg-white p-5 sm:p-6 md:p-7 w-full">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            주간 학습 요약
          </h2>
          {/* 주간 학습 요약 내용 추가 */}
          <div className="w-full h-[150px] rounded-lg border bg-white/85">
            <p className="text-gray leading-relaxed px-5 py-5">
              주간 학습 요약(추후 백에서 받아올 예정)
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
