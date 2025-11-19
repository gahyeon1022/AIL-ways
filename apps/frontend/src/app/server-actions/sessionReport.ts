'use server';

import { callAPIWithAuth } from '@/app/lib/api/http';

export type ReportSelfFeedback = {
  comment: string;
  createdAt: string;
};

export type ReportDistractionLog = {
  detectedAt: string;
  activity: string;
  detectionType: string;
  selfFeedback?: ReportSelfFeedback | null;
};

export type ReportMentorFeedback = {
  mentorUserId: string;
  comment: string;
  createdAt: string;
};

export type Report = {
  id: string;
  matchId: string;
  menteeUserId: string;
  aiSummary?: string | null;
  distractionLogs: ReportDistractionLog[];
  mentorFeedback?: ReportMentorFeedback | null;
  createdAt: string;
};

export async function getReportsByMatchId(matchId: string): Promise<Report[]> {
  const trimmed = matchId?.trim();
  if (!trimmed) {
    throw new Error('유효하지 않은 matchId');
  }

  return callAPIWithAuth<Report[]>(
    `/api/reports/by-match/${encodeURIComponent(trimmed)}`
  );
}

export async function saveMentorFeedback(
  reportId: string,
  comment: string
): Promise<void> {
  const trimmedReportId = reportId?.trim();
  const trimmedFeedback = comment?.trim();

  if (!trimmedReportId) throw new Error('유효하지 않은 reportId');
  if (!trimmedFeedback) throw new Error('유효하지 않은 feedback');

  await callAPIWithAuth<void>(
    `/api/reports/${encodeURIComponent(trimmedReportId)}/feedback`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment: trimmedFeedback }),
    }
  );
}
