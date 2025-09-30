'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function LearningScreenPage() {
  const [questionInput, setQuestionInput] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const listEndRef = useRef<HTMLDivElement | null>(null);

  const [note, setNote] = useState('');
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);

  const onSave = () => {
    const q = questionInput.trim();
    if (!q) return;
    setQuestions((prev) => [...prev, q]);
    setQuestionInput(''); // 입력창 초기화
  };

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    console.log(questions);
  }, [questions]);

  return (
    <main className="min-h-screen">
      <header className="from-rose-quartz-500 to-serenity-500 p-4">
        <div className="flex flex-col items-center">
          {/* 상단 로고 / 타이틀 */}
          <h1 className="text-xl font-bold mb-2 self-start">AIL-Ways</h1>

          {/* 네비게이션 메뉴 */}
          <nav className="flex gap-30 space-x-8">
            <a href="#" className="hover:underline">
              멘토링 현황
            </a>
            <a href="#" className="hover:underline">
              홈
            </a>
            <a href="#" className="hover:underline">
              게시판
            </a>
          </nav>
        </div>
      </header>

      {/* 본문 */}
      <section className="w-[80%] flex-1 flex gap-5 mx-auto h-[500px]">
        {/* 질문 작성란 */}
        <div className="flex-1 bg-white p-4 rounded shadow flex flex-col">
          <div className="flex-1 overflow-y-auto pr-1 space-y-2">
            <ul className="space-y-1">
              {questions.map((q, i) => (
                <li key={i} className="border-b">
                  {/* 질문 텍스트 줄 */}
                  {editingIdx === i ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full border rounded p-1"
                    />
                  ) : (
                    <div className="text-sm leading-6 break-words">{q}</div>
                  )}

                  {/* 버튼 줄 (항상 아래줄) */}
                  <div className="flex items-center gap-2 justify-end">
                    {editingIdx === i ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            if (!editValue.trim()) return;
                            setQuestions((prev) =>
                              prev.map((item, idx) =>
                                idx === i ? editValue.trim() : item
                              )
                            );
                            setEditingIdx(null);
                          }}
                          className="text-xs py-1 cursor-pointer hover:underline"
                        >
                          저장
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingIdx(i);
                            setEditValue(q);
                          }}
                          className="text-xs py-1 cursor-pointer hover:underline"
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setQuestions((prev) =>
                              prev.filter((_, idx) => idx !== i)
                            )
                          }
                          className="text-xs py-1 cursor-pointer hover:underline"
                        >
                          삭제
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* 스크롤 기준점 */}
            <div ref={listEndRef} />
          </div>

          <textarea
            className="min-h-[75px] border rounded mt-auto p-2 resize-none"
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            placeholder="질문을 입력하세요."
          />

          <button
            type="button"
            onClick={onSave}
            disabled={!questionInput.trim()}
            className={`mt-2 px-2 py-2 bg-blue-400 text-white rounded
              ${
                questionInput.trim()
                  ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                  : 'bg-gray-300 text-gray-500'
              }`}
          >
            질문 저장
          </button>
        </div>

        {/* 학습 중 카메라 화면 */}
        <div className="flex-[2.5] bg-gray-200 rounded shadow flex items-center justify-center">
          <p className="text-gray-500">카메라 화면</p>
        </div>

        {/* 학습 내용 필기 */}
        <div
          className="flex-1 bg-yellow-100 p-4 rounded shadow focus:outline-none overflow-y-auto break-words"
          contentEditable
          suppressContentEditableWarning={true}
          onInput={(e) => setNote((e.target as HTMLDivElement).innerText)}
        >
          {note} {/* note 필기 저장 */}
        </div>
      </section>

      {/* 학습 종료 버튼 (카메라 화면보다 아래 왼쪽 하단) */}
      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-red-500 text-white rounded cursor-pointer"
        >
          학습 종료
        </button>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <p className="text-xl text-center mb-6">학습을 종료하시겠습니까?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  console.log('학습 종료 실행'); // 실제 종료 로직
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 rounded bg-green-500 text-white cursor-pointer"
              >
                확인
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded bg-gray-200 cursor-pointer"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
