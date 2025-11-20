// apps/frontend/src/app/server-actions/weeklyReport.ts
'use server';

import { callAPIWithAuth } from '@/app/lib/api/http';
import type { WeeklyReport } from '@/app/types/weekly-report';

export async function getWeeklyReportsByMatchId(matchId: string) {
  const trimmed = matchId?.trim();
  if (!trimmed) throw new Error('유효한 matchId가 필요합니다.');
  return callAPIWithAuth<WeeklyReport[]>(
    `/api/reports/weekly/by-match/${encodeURIComponent(trimmed)}`,
    { cache: 'no-store' }
  );
}
