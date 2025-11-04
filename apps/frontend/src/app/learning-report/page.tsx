'use client';
import { useState } from 'react';
import CalendarModal from './components/CalendarModal';
import ReportHeader from './components/ReportHeader'; // 1. 헤더 임포트
import ReportSection from './components/ReportSection'; // 2. 섹션 임포트

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function LearingReportPage() {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dateStr = `${selectedDate.getFullYear()}-${pad(
    selectedDate.getMonth() + 1
  )}-${pad(selectedDate.getDate())}`;

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  return (
    <main className="min-h-screen">
      {/* === 1. ReportHeader 컴포넌트로 교체 === */}
      <ReportHeader
        menteeName="OOO 멘티"
        dateStr={dateStr}
        onPrevClick={handlePrevDay}
        onNextClick={handleNextDay}
        onDateClick={() => setOpen(true)}
      />

      <section className="mx-auto">
        {/* === 2. ReportSection 컴포넌트로 교체 === */}
        <ReportSection title="학습 내용 요약">
          {/* 자식(children)으로 기존 내부 컨텐츠를 그대로 넣어줍니다 */}
          <div className="w-full h-[150px] rounded-lg border bg-white/85">
            <p className="text-gray-500 leading-relaxed px-5 py-5">
              요약 내용(추후 백에서 받아올 예정)
            </p>
          </div>
        </ReportSection>

        <ReportSection title="학습 행동 분석">
          <div className="w-full h-[150px] rounded-lg border bg-white/85">
            <p className="text-gray-500 leading-relaxed px-5 py-5">
              분석 내용(추후 백에서 받아올 예정)
            </p>
          </div>
        </ReportSection>

        <ReportSection title="자기 피드백">
          <div className="w-full h-[150px] rounded-lg border bg-white/85">
            <p className="text-gray-500 leading-relaxed px-5 py-5">
              피드백 내용(추후 백에서 받아올 예정)
            </p>
          </div>
        </ReportSection>

        <ReportSection title="멘토 피드백">
          {/* 높이가 다른 섹션도 children 덕분에 문제없이 처리됩니다 */}
          <div
            className="w-full h-[340px] sm:h-[380px] md:h-[150px]
                       rounded-lg border bg-white/85"
          >
            <p className="text-gray-500 leading-relaxed px-5 py-5">
              피드백 내용(추후 백에서 받아올 예정)
            </p>
          </div>
        </ReportSection>
      </section>

      {/* 캘린더 모달은 페이지 레벨에 둡니다 */}
      <CalendarModal
        open={open}
        onClose={() => setOpen(false)}
        onPick={(d) => {
          setSelectedDate(new Date(d));
          setOpen(false);
        }}
        initialMonth={selectedDate}
        title="날짜 선택"
      />
    </main>
  );
}
