'use client';

import type { Report } from '@/app/server-actions/sessionReport';
import { type RefObject } from 'react';

type ActivityCount = { activity: string; count: number };
type SelfFeedbackSummary = { activity: string; comment: string; createdAt: string };

interface ReportSectionProps {
  selectedDate: Date;
  report: Report | null;
  reports: Report[];
  dailyReportIndex: number;
  onSelectIndex: (index: number) => void;
  activityCounts: ActivityCount[];
  selfFeedbacks: SelfFeedbackSummary[];
  loading: boolean;
  error: string | null;
  mentorFeedbackRef?: RefObject<HTMLTextAreaElement | null>;
  onSaveFeedback?: () => void;
  saving?: boolean;
}

const formatDateTime = (input: string | Date) => {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return typeof input === 'string' ? input : '';
  return new Intl.DateTimeFormat('ko', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export default function ReportSection({
  selectedDate,
  report,
  reports,
  dailyReportIndex,
  onSelectIndex,
  activityCounts,
  selfFeedbacks,
  loading,
  error,
  mentorFeedbackRef,
  onSaveFeedback,
  saving,
}: ReportSectionProps) {
  return (
    <div className="space-y-6 px-4">
      <div className="rounded-2xl border border-black/10 bg-white/90 p-5 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{formatDateTime(selectedDate)}</h2>
          {loading && <span className="text-sm text-gray-500">불러오는 중...</span>}
        </div>
        {error && <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>}
        {!loading && reports.length === 0 && (
          <p className="text-sm text-gray-500">이 날짜에는 리포트가 없습니다.</p>
        )}
        {reports.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {reports.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => onSelectIndex(idx)}
                className={`rounded-full border px-4 py-1 text-sm ${
                  idx === dailyReportIndex ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                }`}
              >
                {formatDateTime(item.createdAt)}
              </button>
            ))}
          </div>
        )}
      </div>

      {report ? (
        <>
          <div className="rounded-2xl border border-black/10 bg-white/90 p-5 shadow-md">
            <h3 className="mb-3 text-lg font-semibold">AI 요약</h3>
            <p className="text-sm text-gray-700">
              {report.aiSummary ?? 'AI 요약이 아직 생성되지 않았습니다.'}
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white/90 p-5 shadow-md">
            <h3 className="mb-3 text-lg font-semibold">활동 통계</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {activityCounts.map((item) => (
                <div
                  key={item.activity}
                  className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm"
                >
                  <p className="text-sm text-gray-600">{item.activity}</p>
                  <p className="text-2xl font-bold text-indigo-600">{item.count}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white/90 p-5 shadow-md">
            <h3 className="mb-3 text-lg font-semibold">멘티 자가 피드백</h3>
            {selfFeedbacks.length === 0 ? (
              <p className="text-sm text-gray-500">자가 피드백이 없습니다.</p>
            ) : (
              <ul className="space-y-3">
                {selfFeedbacks.map((item, idx) => (
                  <li key={`${item.activity}-${idx}`} className="rounded border border-gray-200 p-3">
                    <p className="text-xs text-gray-500">{formatDateTime(item.createdAt)}</p>
                    <p className="font-medium text-gray-900">{item.activity}</p>
                    <p className="text-sm text-gray-700">{item.comment}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {mentorFeedbackRef && (
            <div className="rounded-2xl border border-black/10 bg-white/90 p-5 shadow-md">
              <h3 className="mb-3 text-lg font-semibold">멘토 피드백</h3>
              <textarea
                ref={mentorFeedbackRef}
                className="h-32 w-full rounded border border-gray-300 p-3 text-sm"
                placeholder="멘토 피드백을 작성해 주세요."
                defaultValue={report.mentorFeedback?.comment ?? ''}
              />
              <button
                onClick={onSaveFeedback}
                disabled={saving}
                className="mt-3 rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {saving ? '저장 중...' : '피드백 저장'}
              </button>
            </div>
          )}
        </>
      ) : (
        !loading && (
          <div className="rounded-2xl border border-black/10 bg-white/90 p-5 text-sm text-gray-500 shadow-md">
            선택된 리포트가 없습니다.
          </div>
        )
      )}
    </div>
  );
}
