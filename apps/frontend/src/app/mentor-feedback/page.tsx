'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CalendarModal from '@/app/learning-report/components/CalendarModal';
import ReportHeader from '@/app/learning-report/components/ReportHeader';
import ReportSection from '@/app/learning-report/components/ReportSection';
import {
  getReportsByMatchId,
  saveMentorFeedback,
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

export default function MentorFeedbackPage() {
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

  const mentorFeedbackRef = useRef<HTMLTextAreaElement>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  const handleMentorFeedbackSubmit = async () => {
    const feedback = mentorFeedbackRef.current?.value.trim() || '';
    if (!report) return;
    setSaving(true);
    setSaveError(null);

    try {
      await saveMentorFeedback(report.id, feedback);
      alert('멘토 피드백이 저장되었습니다.');
      window.location.reload();
    } catch (err) {
      console.error(err);
      setSaveError('멘토 피드백 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
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
          .filter(
            (item) =>
              isSameDay(new Date(item.createdAt), selectedDate) &&
              !item.mentorFeedback // mentorFeedback이 없는 리포트만 필터링
          )
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

  const activityCounts = useMemo(() => {
    if (!report)
      return [
        { activity: '스마트폰 사용', count: 0 },
        { activity: '자리 이탈', count: 0 },
        { activity: '졸음', count: 0 },
      ];
    const counts = new Map<string, number>([
      ['스마트폰 사용', 0],
      ['자리 이탈', 0],
      ['졸음 감지', 0],
    ]);

    report.distractionLogs.forEach((log) => {
      const key = log.activity;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    return Array.from(counts.entries()).map(([activity, count]) => ({
      activity,
      count,
    }));
  }, [report]);

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

        {hasReport && (
          <>
            <ReportSection title="학습 내용 요약">
              <div className="w-full h-[150px] rounded-lg border bg-white/85 px-5 py-5">
                {report?.aiSummary ?? 'AI 요약이 없습니다.'}
              </div>
            </ReportSection>

            <ReportSection title="학습 행동 분석">
              <div className="w-full min-h-[150px] rounded-lg border bg-white/85 p-5 px-5 py-5">
                {
                  <ul className="space-y-3 text-sm text-gray-700">
                    {activityCounts.map(({ activity, count }) => (
                      <li
                        key={activity}
                        className="flex items-center justify-between rounded-md border border-gray-200 px-4 py-3"
                      >
                        <span className="font-medium">
                          {activity} - {count}회
                        </span>
                      </li>
                    ))}
                  </ul>
                }
              </div>
            </ReportSection>

            <ReportSection title="자기 피드백">
              <div className="w-full min-h-[150px] rounded-lg border bg-white/85 p-5">
                {
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
                }
              </div>
            </ReportSection>

            <ReportSection title="멘토 피드백">
              <textarea
                className="w-full min-h-[100px] rounded-lg border bg-white/85 p-5 flex flex-col gap-3"
                placeholder="멘토 피드백을 입력하세요."
                ref={mentorFeedbackRef}
              />
              <div className="flex justify-end mt-3">
                <button
                  className="self-end px-4 py-2 rounded bg-emerald-500 text-white text-sm"
                  onClick={handleMentorFeedbackSubmit}
                  disabled={saving}
                >
                  {saving ? '저장 중...' : '피드백 저장'}
                </button>
              </div>
            </ReportSection>
          </>
        )}
      </section>

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
