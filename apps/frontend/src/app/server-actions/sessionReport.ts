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

