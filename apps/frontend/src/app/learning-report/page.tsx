'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CalendarModal from './components/CalendarModal';
import ReportHeader from './components/ReportHeader'; // 1. 헤더 임포트
import ReportSection from './components/ReportSection'; // 2. 섹션 임포트
import {
  getReportsByMatchId,
  type Report,
  type ReportDistractionLog,
} from '@/app/server-actions/sessionReport';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export default function LearingReportPage() {
  const searchParams = useSearchParams();
  const matchId = searchParams.get('matchId') ?? '';
  const dateParam = searchParams.get('date');
  const parsedDate = dateParam ? new Date(dateParam) : null;
  const hasValidDate =
    parsedDate !== null && !Number.isNaN(parsedDate.getTime());

  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() =>
    hasValidDate ? parsedDate! : new Date()
  );
  const [report, setReport] = useState<Report | null>(null);
  const [dailyReports, setDailyReports] = useState<Report[]>([]);
  const [dailyReportIndex, setDailyReportIndex] = useState(0);
  const [preferLatest, setPreferLatest] = useState(hasValidDate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasReport = Boolean(report);

  const dateStr = `${selectedDate.getFullYear()}-${pad(
    selectedDate.getMonth() + 1
  )}-${pad(selectedDate.getDate())}`;

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setPreferLatest(false);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setPreferLatest(false);
    setSelectedDate(newDate);
  };

  const handleCalendarPick = (value: string) => {
    const picked = new Date(value);
    if (Number.isNaN(picked.getTime())) return;
    setPreferLatest(false);
    setSelectedDate(picked);
    setOpen(false);
  };

  useEffect(() => {
    let cancelled = false;

    async function fetchReport() {
      if (!matchId) {
        setReport(null);
        setError('매칭 정보가 필요합니다.');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const reports = await getReportsByMatchId(matchId);
        const sameDayReports = reports
          .filter((item) => isSameDay(new Date(item.createdAt), selectedDate))
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

        if (!cancelled) {
          const defaultIndex =
            sameDayReports.length === 0
              ? 0
              : preferLatest
              ? sameDayReports.length - 1
              : 0;

          setDailyReports(sameDayReports);
          setDailyReportIndex(defaultIndex);
          setReport(sameDayReports[defaultIndex] ?? null);
          if (preferLatest) {
            setPreferLatest(false);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchReport();
    return () => {
      cancelled = true;
    };
  }, [matchId, selectedDate]);

  useEffect(() => {
    setReport(dailyReports[dailyReportIndex] ?? null);
  }, [dailyReports, dailyReportIndex]);

  const selfFeedbacks = useMemo(() => {
    if (!report) return [];
    return report.distractionLogs
      .filter(
        (
          log
        ): log is ReportDistractionLog & {
          selfFeedback: NonNullable<ReportDistractionLog['selfFeedback']>;
        } => !!log.selfFeedback
      )
      .map((log) => ({
        comment: log.selfFeedback!.comment,
        createdAt: log.selfFeedback!.createdAt,
        activity: log.activity,
      }));
  }, [report]);

  return (
    <main className="min-h-screen">
      {/* === 1. ReportHeader 컴포넌트로 교체 === */}
      <ReportHeader
        dateStr={dateStr}
        onPrevClick={handlePrevDay}
        onNextClick={handleNextDay}
        onDateClick={() => setOpen(true)}
        reportNav={
          dailyReports.length > 0
            ? {
                index: dailyReportIndex,
                total: dailyReports.length,
                onPrev: () =>
                  setDailyReportIndex((prev) => Math.max(prev - 1, 0)),
                onNext: () =>
                  setDailyReportIndex((prev) =>
                    Math.min(prev + 1, dailyReports.length - 1)
                  ),
              }
            : undefined
        }
      />

      <section className="w-[100vw] min-h-[80vh] mx-auto space-y-6">
        {loading && (
          <div className="relative mx-auto h-[100px] w-[350px] max-w-[1040px] overflow-hidden rounded-2xl bg-[#d6d4e6] p-8 flex items-center justify-center text-center">
            데이터를 불러오는 중입니다.
          </div>
        )}

        {error && !loading && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && !hasReport && (
          <div className="relative mx-auto h-[100px] w-[350px] max-w-[1040px] overflow-hidden rounded-2xl bg-[#d6d4e6] p-8 flex items-center justify-center text-center">
            선택한 날짜에 대한 보고서가 없습니다.
          </div>
        )}

        {/* === 2. ReportSection 컴포넌트로 교체 === */}
        {hasReport && (
          <>
            <ReportSection title="학습 내용 요약">
              {/* 자식(children)으로 기존 내부 컨텐츠를 그대로 넣어줍니다 */}
              <div className="w-full h-[150px] rounded-lg border bg-white/85 px-5 py-5">
                {report?.aiSummary ?? 'AI 요약이 없습니다.'}
              </div>
            </ReportSection>

            <ReportSection title="학습 행동 분석">
              <div className="w-full min-h-[150px] rounded-lg border bg-white/85 p-5 px-5 py-5">
                {report?.distractionLogs.length === 0 ? (
                  <p className="text-gray-500">
                    분석 가능한 딴짓 로그가 없습니다.
                  </p>
                ) : (
                  <ul className="space-y-3 text-sm text-gray-700">
                    {report?.distractionLogs.map((log) => (
                      <li
                        key={`${log.detectedAt}-${log.activity}`}
                        className="rounded-md border border-gray-200 p-3"
                      >
                        <p className="font-medium">{log.activity}</p>
                        <p className="text-xs text-gray-500">
                          감지 시각: {new Date(log.detectedAt).toLocaleString()}
                        </p>
                        {log.selfFeedback && (
                          <p className="mt-1 text-xs text-gray-600">
                            자기 피드백: {log.selfFeedback.comment}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </ReportSection>

            <ReportSection title="자기 피드백">
              <div className="w-full min-h-[150px] rounded-lg border bg-white/85 p-5">
                {selfFeedbacks.length === 0 ? (
                  <p className="text-gray-500">자기 피드백 기록이 없습니다.</p>
                ) : (
                  <ul className="space-y-3 text-gray-700 text-sm">
                    {selfFeedbacks.map((item) => (
                      <li
                        key={`${item.createdAt}-${item.activity}`}
                        className="rounded-md border border-gray-200 p-3"
                      >
                        <p className="font-medium">{item.comment}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleString()} · 관련
                          이벤트: {item.activity}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </ReportSection>

            <ReportSection title="멘토 피드백">
              <div className="w-full h-[150px] rounded-lg border bg-white/85">
                <p className="text-gray-500 leading-relaxed px-5 py-5">
                  피드백 내용(추후 백에서 받아올 예정)
                </p>
              </div>
            </ReportSection>
          </>
        )}
      </section>

      {/* 캘린더 모달은 페이지 레벨에 둡니다 */}
      <CalendarModal
        open={open}
        onClose={() => setOpen(false)}
        onPick={handleCalendarPick}
        initialMonth={selectedDate}
        title="날짜 선택"
      />
    </main>
  );
}
