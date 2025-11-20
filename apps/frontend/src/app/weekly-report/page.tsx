import WeeklyReportClient from './WeeklyReportClient';
import { getWeeklyReportsByMatchId } from '@/app/server-actions/weeklyReport';
import type { WeeklyReport } from '@/app/types/weekly-report';

export const dynamic = 'force-dynamic';

type WeeklyReportPageProps = {
  searchParams?: {
    matchId?: string | string[];
  };
};

type WeeklyReportPayload = {
  reports: WeeklyReport[];
  error: string | null;
};

async function loadWeeklyReports(matchId: string): Promise<WeeklyReportPayload> {
  if (!matchId) {
    return {
      reports: [],
      error: 'matchId 쿼리 파라미터가 필요합니다.',
    };
  }

  try {
    const reports = await getWeeklyReportsByMatchId(matchId);
    return { reports, error: null };
  } catch (err) {
    return {
      reports: [],
      error:
        err instanceof Error
          ? err.message
          : '주간 리포트를 불러오지 못했습니다.',
    };
  }
}

export default async function WeeklyReportPage({
  searchParams,
}: WeeklyReportPageProps) {
  const matchIdParam = searchParams?.matchId;
  const matchId = Array.isArray(matchIdParam)
    ? matchIdParam[0] ?? ''
    : matchIdParam ?? '';

  const data = await loadWeeklyReports(matchId);

  return (
    <WeeklyReportClient reports={data.reports} error={data.error} />
  );
}
