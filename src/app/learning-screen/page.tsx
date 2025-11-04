'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import QuestionManager from './components/QuestionManager';
import NoteEditor from './components/NoteEditor';
import CheckFinishedModal from './components/CheckFinishedModal';
import SelfFeedbackModal from './components/SelfFeedbackModal';
import { startSession, resumeSession } from '@/_actions/session';

export default function LearningScreenPage() {
  const [questions, setQuestions] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const wasFeedbackOpen = useRef(false);

  // 세션 시작 + 웹캠 시작
  useEffect(() => {
    const initPage = async () => {
      try {
        // 세션 시작
        const session = await startSession();
        setSessionId(session.sessionId);
        console.log('세션 시작:', session.sessionId);
        // 웹캠 시작
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('세션 시작 중 오류:', error);
      }
    };

    initPage();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // 학습 재개
  useEffect(() => {
    if (wasFeedbackOpen.current && !isFeedbackModalOpen && sessionId) {
      (async () => {
        try {
          await resumeSession(sessionId);
          console.log('학습 재개');
        } catch (e) {
          console.error('학습 재개 실패:', e);
        }
      })();
    }
    wasFeedbackOpen.current = isFeedbackModalOpen;
  }, [isFeedbackModalOpen, sessionId]);

  // 학습 종료 확인 핸들러
  const handleConfirm = () => {
    console.log('학습 종료');
    console.log('질문: ', questions);
    console.log('필기: ', note);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      console.log('웹캠이 꺼졌습니다.');
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsModalOpen(false);
  };

  // 피드백 제출 핸들러
  const handleSubmitFeedback = (feedback: string) => {
    console.log('제출된 자가 피드백:', feedback);
    // (추후 DB 저장 로직)
    setIsFeedbackModalOpen(false); // 피드백 제출 후 모달 닫기
  };

  return (
    <main className="min-h-screen">
      <section className="w-[80%] flex-1 flex gap-5 mx-auto h-[500px]">
        {/* 질문 */}
        <QuestionManager
          questions={questions}
          onQuestionsChange={setQuestions}
        />

        {/* 웹캠 화면 */}
        <div className="flex-[2.5] flex flex-col items-center justify-center">
          <div className="w-full h-full bg-gray-200 rounded shadow flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-md scale-x-[-1]"
            />
          </div>
        </div>

        {/* 필기 */}
        <NoteEditor value={note} onChange={setNote} />
      </section>

      {/* 학습 종료 버튼 + 딴짓하기 버튼 */}
      <div className="mt-4 flex justify-center gap-4">
        {' '}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-red-500 text-white rounded cursor-pointer"
        >
          학습 종료
        </button>
        <button
          type="button"
          onClick={() => setIsFeedbackModalOpen(true)}
          className="px-4 py-2 bg-yellow-500 text-white rounded cursor-pointer"
        >
          딴짓 (테스트)
        </button>
      </div>

      {/* 확인 모달 (학습 종료) */}
      <CheckFinishedModal
        open={isModalOpen}
        onConfirm={handleConfirm}
        onClose={() => setIsModalOpen(false)}
        sessionId={sessionId}
        note={note}
        questions={questions}
      />

      {/* 자기 피드백 모달 */}
      <SelfFeedbackModal
        open={isFeedbackModalOpen}
        onSubmit={handleSubmitFeedback}
        onClose={() => setIsFeedbackModalOpen(false)}
        sessionId={sessionId}
      />
    </main>
  );
}
