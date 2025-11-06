'use client';

import { useState, useRef, useEffect } from 'react';

type QuestionManagerProps = {
  questions: string[];
  onQuestionsChange: (newQuestions: string[]) => void;
};

export default function QuestionManager({
  questions,
  onQuestionsChange,
}: QuestionManagerProps) {
  const [questionInput, setQuestionInput] = useState('');
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const listEndRef = useRef<HTMLDivElement | null>(null);

  // 질문 추가 함수
  const handleAddQuestion = () => {
    const q = questionInput.trim();
    if (!q) return;
    // 부모에게 변경된 질문 목록 전달
    onQuestionsChange([...questions, q]);
    setQuestionInput(''); // 입력창 초기화
  };

  // 질문 수정 함수
  const handleUpdateQuestion = (indexToUpdate: number) => {
    const value = editValue.trim();
    if (!value) return;
    const newQuestions = questions.map((item, idx) =>
      idx === indexToUpdate ? value : item
    );
    // 부모에게 변경된 질문 목록을 전달
    onQuestionsChange(newQuestions);
    setEditingIdx(null);
  };

  // 질문 삭제 함수
  const handleDeleteQuestion = (indexToDelete: number) => {
    const newQuestions = questions.filter((_, idx) => idx !== indexToDelete);
    // 부모에게 변경된 질문 목록을 전달
    onQuestionsChange(newQuestions);
  };

  // 질문 목록이 변경될 때마다 맨 아래로 스크롤
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [questions]);

  return (
    <div className="flex-1 bg-white p-4 rounded shadow flex flex-col">
      {/* 질문 목록 */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2">
        <ul className="space-y-1">
          {questions.map((q, i) => (
            <li key={i} className="border-b">
              {/* 질문 텍스트 또는 수정 입력창 */}
              {editingIdx === i ? (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && handleUpdateQuestion(i)
                  }
                  className="w-full border rounded p-1"
                  autoFocus
                />
              ) : (
                <div className="text-sm leading-6 break-words">{q}</div>
              )}

              {/* 수정/삭제/저장 버튼 */}
              <div className="flex items-center gap-2 justify-end">
                {editingIdx === i ? (
                  <button
                    type="button"
                    onClick={() => handleUpdateQuestion(i)}
                    className="text-xs py-1 cursor-pointer hover:underline"
                  >
                    저장
                  </button>
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
                      onClick={() => handleDeleteQuestion(i)}
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
        <div ref={listEndRef} />
      </div>

      {/* 새 질문 입력창 */}
      <textarea
        className="min-h-[75px] border rounded mt-auto p-2 resize-none"
        value={questionInput}
        onChange={(e) => setQuestionInput(e.target.value)}
        placeholder="질문을 입력하세요."
      />

      {/* 질문 저장 버튼 */}
      <button
        type="button"
        onClick={handleAddQuestion}
        disabled={!questionInput.trim()}
        className={`mt-2 px-2 py-2 text-white rounded ${
          questionInput.trim()
            ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
            : 'bg-gray-300'
        }`}
      >
        질문 저장
      </button>
    </div>
  );
}
