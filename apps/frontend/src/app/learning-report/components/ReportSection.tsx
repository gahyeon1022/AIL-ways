'use client';

// ReportSection이 받을 Props 타입 정의
interface ReportSectionProps {
  title: string;
  children: React.ReactNode; // React 컴포넌트를 자식으로 받음
}

export default function ReportSection({ title, children }: ReportSectionProps) {
  return (
    <div
      className="rounded-2xl border border-black/10 shadow-md
                 bg-gradient-to-r from-white/95 via-white/85 to-rose-100/70
                 flex-1 p-5 w-[80%] mx-auto mb-5"
    >
      {/* 제목 */}
      <h2 className="text-2xl sm:text-3xl font-bold mb-4">{title}</h2>

      {/* 내용 */}
      {children}
    </div>
  );
}
