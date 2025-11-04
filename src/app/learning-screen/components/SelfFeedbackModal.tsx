'use client';

import { useState, useEffect } from 'react';
import { addDistractionLog, submitSelfFeedback } from '@/_actions/session';

// 모달 컴포넌트가 받을 props 타입 정의
interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
  sessionId: string;
}

export default function FeedbackModal({
  open,
  onSubmit,
  sessionId,
}: FeedbackModalProps) {
  const [feedbackText, setFeedbackText] = useState('');
  const [posting, setPosting] = useState(false);
  // 딴짓 로그 저장
  useEffect(() => {
    if (open) {
      (async () => {
        try {
          await addDistractionLog(sessionId, {
            activity: 'kind of distraction',
            detectedAt: new Date().toISOString(),
          });
          console.log('딴짓 로그 기록');
        } catch (e) {
          console.error('딴짓 로그 기록 실패', e);
        }
      })();
    }
  }, [open, sessionId]);

  if (!open) {
    return null;
  }

  // 제출 → 서버 저장 → 부모 onSubmit(comment) 호출 (부모가 닫힘 처리)
  const handleSubmit = async () => {
    if (!feedbackText.trim() || posting) return;
    setPosting(true);
    try {
      await submitSelfFeedback(sessionId, feedbackText.trim());
      onSubmit(feedbackText.trim()); // 부모에서 open=false → 닫힌 뒤 page.tsx가 재개 호출
    } catch (e) {
      console.error('피드백 저장 실패:', e);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="text-left">
          <h3 className="text-lg font-semibold text-gray-900">딴짓 감지</h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              유형:
              <br />
              시간:
            </p>
          </div>

          <div className="mt-4">
            <label
              htmlFor="feedback"
              className="block text-sm font-medium text-gray-700"
            >
              자가 피드백
            </label>
            <textarea
              id="feedback"
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="예: 강의 내용이 지루해서 잠시 딴생각을 함."
            />
          </div>
          <div className="mt-4 flex justify-end gap-3">
            {' '}
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={handleSubmit}
            >
              제출
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
