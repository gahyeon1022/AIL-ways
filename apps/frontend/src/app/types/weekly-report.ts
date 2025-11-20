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
