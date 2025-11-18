'use client';

// ReportHeader가 받을 Props 타입 정의
interface ReportHeaderProps {
  dateStr: string;
  onPrevClick: () => void;
  onNextClick: () => void;
  onDateClick: () => void;
  reportNav?: {
    index: number;
    total: number;
    onPrev: () => void;
    onNext: () => void;
  };
}

export default function ReportHeader({
  dateStr,
  onPrevClick,
  onNextClick,
  onDateClick,
  reportNav,
}: ReportHeaderProps) {
  return (
    <section className="mt-3">
      <div className="w-[80%] mx-auto flex items-center justify-between mt-3 px-6">
        {/* 날짜 컨트롤 */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="bg-white rounded-full px-3 py-3 shadow mb-4"
            onClick={onPrevClick} // Props로 받은 함수 연결
          >
            &lt;
          </button>
          <button
            type="button"
            onClick={onDateClick} // Props로 받은 함수 연결
            className="bg-white rounded-full px-4 py-3 shadow mb-4"
          >
            {dateStr}
          </button>
          <button
            type="button"
            className="bg-white rounded-full px-3 py-3 shadow mb-4"
            onClick={onNextClick} // Props로 받은 함수 연결
          >
            &gt;
          </button>
        </div>
        <div className="flex items-center justify-between">
          {reportNav && reportNav.total > 0 && (
            <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 shadow">
              <button
                disabled={reportNav.index === 0}
                onClick={reportNav.onPrev}
                className="rounded-full bg-gray-100 px-2 py-1 disabled:opacity-40"
              >
                ‹
              </button>
              <span className="text-sm text-gray-600">
                {reportNav.index + 1} / {reportNav.total}
              </span>
              <button
                disabled={reportNav.index === reportNav.total - 1}
                onClick={reportNav.onNext}
                className="rounded-full bg-gray-100 px-2 py-1 disabled:opacity-40"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
