'use client';

import { useEffect, useMemo, useState } from 'react';
import { submitSelfFeedback } from '@/app/server-actions/session';

// 감지 이벤트 타입
export type DetectedActivity = 'PHONE' | 'LEFT_SEAT' | 'DROWSY';

interface SelfFeedbackModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => void; // 상위 컴포넌트에서 닫힘/재개 등 후속 처리
  sessionId: string;
  // AI 응답으로 전달되는 필드들(선택)
  detectedActivity?: DetectedActivity; // PHONE | LEFT_SEAT | DROWSY
  detectedAt?: string; // ISO8601 문자열 (없으면 now)
}

export default function SelfFeedbackModal({
  open,
  onClose,
  onSubmit,
  sessionId,
  detectedActivity,
  detectedAt,
}: SelfFeedbackModalProps) {
  const [feedbackText, setFeedbackText] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (open) {
      setFeedbackText('');
    }
  }, [open]);

  // 라벨/메시지 매핑
  const labelMap: Record<DetectedActivity, string> = {
    PHONE: '휴대폰 사용이 감지되었습니다.',
    LEFT_SEAT: '자리 이탈이 감지되었습니다.',
    DROWSY: '졸음 상태가 감지되었습니다.',
  };

  // 표시용 시간/신뢰도 포맷
  const tsText = useMemo(() => {
    const ts = detectedAt ? new Date(detectedAt) : new Date();
    // 사용자 시간대 표기
    return ts.toLocaleString();
  }, [detectedAt]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (posting) return;
    const text = feedbackText.trim();
    if (!text) return;

    setPosting(true);
    try {
      await submitSelfFeedback(sessionId, text);
      onSubmit(text); // 상위에서 모달 닫기 및 세션 재개 등 처리
    } catch (e) {
      console.error('자가 피드백을 저장하지 못했습니다. 네트워크를 확인한 뒤 다시 시도해 주세요.', e);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <header className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900">딴짓 감지</h3>
          <p className="mt-1 text-sm text-gray-600">
            {labelMap[detectedActivity ?? 'PHONE']}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
            <div>
              <span className="font-medium text-gray-700">시간</span>{' '}
              <span>{tsText}</span>
            </div>
          </div>
        </header>

        <label
          htmlFor="self-feedback"
          className="block text-sm font-medium text-gray-700"
        >
          자가 피드백
        </label>
        <textarea
          id="self-feedback"
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="예: 알림이 와서 잠깐 휴대폰을 확인했습니다."
        />

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={posting || !feedbackText.trim()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {posting ? '제출 중…' : '제출'}
          </button>
        </div>
      </div>
    </div>
  );
}
