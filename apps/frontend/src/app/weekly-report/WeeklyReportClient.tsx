import type { ReactNode } from 'react';
import ReportSection from '@/app/learning-report/components/ReportSection';
import type { WeeklyReport } from '@/app/types/weekly-report';

const WEEK_ORDER = ['월', '화', '수', '목', '금', '토', '일'];

const formatRange = (report: WeeklyReport | null) => {
  if (!report) return '';
  const formatter = new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
  });
  return `${formatter.format(new Date(report.weekStart))} ~ ${formatter.format(
    new Date(report.weekEnd)
  )}`;
};

const asHours = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-';
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded)
    ? `${rounded.toFixed(0)}시간`
    : `${rounded.toFixed(1)}시간`;
};

const prettifyAiSummary = (raw?: string | null) => {
  if (!raw) return 'AI 요약이 아직 준비되지 않았습니다.';
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'string') return parsed;
    if (parsed && typeof parsed === 'object') {
      const { summary, suggestion } = parsed as {
        summary?: string;
        suggestion?: string;
      };
      const text = [summary, suggestion].filter(Boolean).join(' ');
      return text || raw;
    }
  } catch {
    // ignore JSON parse errors, fall through to raw string
  }
  return raw;
};

const extractStudyHours = (report: WeeklyReport | null) => {
  if (!report) return [];
  return Object.entries(report.studyHours ?? {}).sort(
    ([a], [b]) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b)
  );
};

type WeeklyReportClientProps = {
  reports: WeeklyReport[];
  error: string | null;
};

export default function WeeklyReportClient({
  reports,
  error,
}: WeeklyReportClientProps) {
  const currentReport = reports[0] ?? null;
  const studyHours = extractStudyHours(currentReport);

  const renderContent = (
    render: (report: WeeklyReport) => ReactNode,
    fallback: ReactNode
  ) => {
    if (error) return <p className="text-red-600">{error}</p>;
    if (!currentReport) return fallback;
    return render(currentReport);
  };

  return (
    <main className="min-h-screen">
      <section className="w-full min-h-[80vh] mx-auto space-y-6 px-4 py-6">
        <ReportSection title="주간 리포트">
          <div className="w-full min-h-[180px] rounded-lg border bg-white/85 px-5 py-5">
            {renderContent(
              (report) => (
                <div className="space-y-4">
                  <div className="grid grid-cols-7 gap-2 text-xs font-semibold text-gray-600 text-center">
                    {WEEK_ORDER.map((day) => (
                      <div key={day}>{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2 text-sm text-center">
                    {studyHours.map(([day, hour]) => (
                      <div
                        key={day}
                        className="rounded-lg border border-black/5 bg-white px-3 py-2"
                      >
                        {typeof hour === 'number' && hour > 0
                          ? asHours(hour)
                          : '0시간'}
                      </div>
                    ))}
                  </div>

                  <p className="text-sm text-gray-600">
                    누적 순수 학습 시간 -{' '}
                    <span className="font-semibold">
                      {asHours(report.netStudyHours)}
                    </span>
                  </p>
                </div>
              ),
              <p className="text-gray-500">
                표시할 리포트가 없습니다. matchId를 확인해 주세요.
              </p>
            )}
          </div>
        </ReportSection>

        <ReportSection title="주간 학습 요약">
          <div className="w-full min-h-[180px] rounded-lg border bg-white/85 px-5 py-5">
            {renderContent(
              (report) => (
                <>
                  <div>
                    <p className="text-sm text-gray-500">
                      {formatRange(report)} 기준 리포트
                    </p>
                    <p className="mt-2 leading-relaxed text-gray-800">
                      {prettifyAiSummary(report.aiSummary)}
                    </p>
                  </div>
                </>
              ),
              <p className="text-gray-500">
                표시할 리포트가 없습니다. matchId를 확인해 주세요.
              </p>
            )}
          </div>
        </ReportSection>
      </section>
    </main>
  );
}
