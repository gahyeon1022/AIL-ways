'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CalendarModal from './components/CalendarModal';
import ReportHeader from './components/ReportHeader';
import ReportSection from './components/ReportSection';
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

export default function LearningReportClient() {
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
  }, [matchId, selectedDate, preferLatest]);

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
        ...log.selfFeedback!,
        activity: log.activity,
      }));
  }, [report]);

  return (
    <main className="flex h-full w-full flex-col">
      <ReportHeader
        dateStr={dateStr}
        onPrevClick={handlePrevDay}
        onNextClick={handleNextDay}
        onDateClick={() => setOpen(true)}
      />

      <CalendarModal
        open={open}
        onClose={() => setOpen(false)}
        onPick={handleCalendarPick}
        initialMonth={selectedDate}
      />

      <section className="flex-1 overflow-y-auto py-6">
        <ReportSection
          selectedDate={selectedDate}
          report={report}
          reports={dailyReports}
          dailyReportIndex={dailyReportIndex}
          onSelectIndex={setDailyReportIndex}
          activityCounts={activityCounts}
          selfFeedbacks={selfFeedbacks}
          loading={loading}
          error={error}
        />
      </section>
    </main>
  );
}
