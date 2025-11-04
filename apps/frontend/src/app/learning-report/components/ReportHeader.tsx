'use client';

// ReportHeader가 받을 Props 타입 정의
interface ReportHeaderProps {
  menteeName: string;
  dateStr: string;
  onPrevClick: () => void;
  onNextClick: () => void;
  onDateClick: () => void;
}

export default function ReportHeader({
  menteeName,
  dateStr,
  onPrevClick,
  onNextClick,
  onDateClick,
}: ReportHeaderProps) {
  return (
    <section className="flex-1 flex items-center justify-center">
      <div className="w-[80%] flex items-center justify-between">
        {/* 멘티 이름 */}
        <div className="inline-block bg-white/95 rounded-full px-10 py-3 shadow mb-4">
          <span className="text-xl font-semibold tracking-tight">
            {menteeName}
          </span>
        </div>
        
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
            className="bg-white rounded-full px-3 py-3 shadow mb-4"
            onClick={onNextClick} // Props로 받은 함수 연결
          >
            &gt;
          </button>
          <button
            type="button"
            onClick={onDateClick} // Props로 받은 함수 연결
            className="bg-white rounded-full px-4 py-3 shadow mb-4"
          >
            {dateStr}
          </button>
        </div>
      </div>
    </section>
  );
}