import { Suspense } from "react";
import MentorFeedbackClient from "./MentorFeedbackClient";

export const dynamic = "force-dynamic";

export default function MentorFeedbackPage() {
  return (
    <Suspense fallback={null}>
      <MentorFeedbackClient />
    </Suspense>
  );
}
