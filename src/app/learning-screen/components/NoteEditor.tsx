'use client';

import { useEffect, useRef } from 'react';

// 컴포넌트가 받을 props 타입을 정의
type NoteEditorProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
};

export default function NoteEditor({
  value,
  onChange,
  placeholder = '필기 내용을 입력하세요.',
  className = '',
  editable = true,
}: NoteEditorProps) {
  // 실제 div DOM 요소에 직접 접근하기 위해 ref 생성
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerText !== value) {
      editorRef.current.innerText = value;
    }
  }, [value]);

  return (
    <div
      // ref를 실제 DOM 요소에 연결
      ref={editorRef}
      role="textbox"
      aria-label="학습 내용 필기"
      contentEditable={editable}
      suppressContentEditableWarning={true}
      onInput={(e) => onChange((e.target as HTMLDivElement).innerText)}
      data-placeholder={placeholder}
      className={[
        'flex-1 bg-yellow-100 p-4 rounded shadow focus:outline-none overflow-y-auto break-words',
        '[&:empty]:before:text-gray-400 [&:empty]:before:content-[attr(data-placeholder)]',
      ].join(' ')}
    />
  );
}
