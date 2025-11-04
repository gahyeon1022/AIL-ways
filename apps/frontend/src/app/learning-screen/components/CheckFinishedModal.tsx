'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveStudyLog, addQuestionLog, endSession } from '@/app/server-actions/session';

type ModalProps = {
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
  questions: string[];
  note: string;
  sessionId: string;
};

export default function Modal({
  open,
  onConfirm,
  onClose,
  questions,
  note,
  sessionId,
}: ModalProps) {
  const router = useRouter();
  const [working, setWorking] = useState(false);

  if (!open) return null; // 모달이 닫혀있으면 렌더링 X

  const handleConfirm = async () => {
    if (working) return;
    setWorking(true);

    try {
      // 필기 저장
      if (note) await saveStudyLog(sessionId, note);

      // 질문 저장
      if (questions.length > 0) {
        const combinedQuestions = questions.join('\n');
        await addQuestionLog(sessionId, combinedQuestions);
      }

      // 세션 종료
      await endSession(sessionId);
      console.log('세션 종료');

      onConfirm();
      router.push('/learning-report');
    } catch (e) {
      console.error('모달 내 API 실패:', e);
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <p className="text-xl text-center mb-6">학습을 종료하시겠습니까?</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded bg-green-500 text-white cursor-pointer"
            disabled={working}
          >
            확인
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 cursor-pointer"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
