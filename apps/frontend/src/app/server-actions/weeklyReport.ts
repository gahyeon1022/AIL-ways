// apps/frontend/src/app/server-actions/weeklyReport.ts
'use server';

import { callAPIWithAuth } from '@/app/lib/api/http';

export type WeeklyReport = {
  id: string;
  matchId: string;
  mentorUserId: string;
  menteeUserId: string;
  weekStart: string;
  weekEnd: string;
  studyHours: Record<string, number>;
  totalHours: number;
  netStudyHours: number;
  focusMe: number;
  focusAvg: number;
  aiSummary?: string | null;
  generatedAt: string;
};

export async function getWeeklyReportsByMatchId(matchId: string) {
  const trimmed = matchId?.trim();
  if (!trimmed) throw new Error('유효한 matchId가 필요합니다.');
  return callAPIWithAuth<WeeklyReport[]>(
    `/api/reports/weekly/by-match/${encodeURIComponent(trimmed)}`,
    { cache: 'no-store' }
  );
}
