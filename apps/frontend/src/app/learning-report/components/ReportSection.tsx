'use client';

import type { PropsWithChildren } from 'react';

type ReportSectionProps = PropsWithChildren<{
  title: string;
}>;

export default function ReportSection({ title, children }: ReportSectionProps) {
  return (
    <div
      className="rounded-2xl border border-black/10 shadow-md
                 bg-gradient-to-r from-white/95 via-white/85 to-rose-100/70
                 flex-1 p-5 w-[80%] mx-auto mb-5"
    >
      <h2 className="text-2xl sm:text-3xl font-bold mb-4">{title}</h2>
      {children}
    </div>
  );
}