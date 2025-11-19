import { Suspense } from "react";
import LearningReportClient from "./LearningReportClient";

export const dynamic = "force-dynamic";

export default function LearningReportPage() {
  return (
    <Suspense fallback={null}>
      <LearningReportClient />
    </Suspense>
  );
}
