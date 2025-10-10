"use client"; // 클라이언트 상태/이벤트가 있으므로 클라이언트 컴포넌트로 선언

import React, { useState } from "react"; // useState 훅만 사용

// 얇은 헤더 + 본문을 가진 카드(중복되는 UI를 캡슐화해서 재사용)
function ThinCard({
        title,           // 상단 얇은 헤더에 표시될 텍스트
        children,        // 카드 본문 컨텐츠
        className = "",  // 외부에서 여백/크기 추가 조정용
    }: {
        title: string;
        children: React.ReactNode;
        className?: string;
    }) {
  return (
    <section
      className={
        // 둥근 모서리, 연한 테두리, 은은한 배경(이미지 느낌 근사)                 // 카드 용기
        "relative overflow-visible rounded-[16px] border border-black/10 bg-white/70 shadow-sm " +
        className
      }
    >
      <header className="text-[12px] text-gray-800 px-4 py-2 rounded-t-[16px]"> {/* 얇은 헤더 라인 */}
        {title} {/* 헤더 텍스트 */}
      </header>
      <div className="h-[1px] bg-black/20" /> {/* 상단 구분선 (실선) */}
      <div className="p-6 rounded-b-[16px]"> {/* 본문 패딩 */}
        {children} {/* 본문 컨텐츠 영역 */}
      </div>
    </section>
  );
}

export default function QnaUI() {
  const [answer, setAnswer] = useState("");        // 하단 입력값 상태
  const [resolved, setResolved] = useState(false); // 질문 해결 토글 상태

  return (
    <main
      className="
        mx-auto                /* 가운데 정렬 */
        w-[960px]              /* 데스크톱 고정 폭(반응형 제거) */
        p-6                    /* 전체 패딩 */
        space-y-8              /* 카드 간 세로 간격 */
      "
    >
      {/* 질문 카드 */}
      <ThinCard title="강지성 멘티" className="pt-[4px] -translate-y-4"> {/* 상단 여백 소량 */}
        <p className="min-h-[180px] leading-relaxed text-[15px] text-gray-800"> {/* 질문 내용(고정 높이) */}
          질문 있습니다. 파이썬에서 ...
        </p>

        <button
          className={
            // 카드 오른쪽 중간에 고정 배치(알약 버튼)
            "absolute right-0 top-full translate-y-px " + // 세로 중앙 정렬
            "rounded-full px-4 py-1 text-[14px] " +              // 알약 형태 + 글자 크기
            (resolved ? "bg-green-500 text-white" : "bg-green-200 text-gray-800") // 상태별 색
          }
          onClick={() => setResolved((v) => !v)} // 해결 상태 토글
        >
          {resolved ? "해결됨" : "해결"} {/* 버튼 라벨 */}
        </button>
      </ThinCard>

      {/* 답변 카드 */}
      <ThinCard title="하승준 멘토">
        <div className="min-h-[220px]"> {/* 답변 표시 영역 고정 높이 */}
          {answer.trim() ? (
            <p className="whitespace-pre-wrap leading-relaxed text-[15px] text-gray-800"> {/* 입력된 답변 렌더 */}
              {answer}
            </p>
          ) : (
            <div className="text-transparent">.</div> /* 비어있을 때 높이만 유지 */
          )}
        </div>
      </ThinCard>

      {/* 하단 입력 바(알약 형태) */}
      <form
        className="mx-auto w-[780px]" /* 중앙 정렬 + 고정 폭(반응형 제거) */
        onSubmit={(e) => {
          e.preventDefault(); // 기본 제출로 인한 새로고침 방지
          // 실제 환경에서는 여기서 서버 전송 로직을 수행
        }}
      >
        <div
          className="
            rounded-[16px]          /* 알약 모양 */
            border border-black/10  /* 연한 테두리 */
            bg-white/80             /* 은은한 배경 */
            px-5 py-3               /* 내부 여백 */
            shadow-sm               /* 약한 그림자 */
          "
        >
          <input
            className="
              w-full            /* 가로 가득(고정 폭 래퍼 안에서만) */
              bg-transparent    /* 배경 투명: 래퍼 배경 사용 */
              outline-none      /* 기본 포커스 외곽선 제거 */
              text-[18px]       /* 큰 텍스트 */
              placeholder:text-gray-700 /* 플레이스홀더 색 */
            "
            placeholder="답변을 입력하세요."      /* 입력 안내 문구 */
            value={answer}                        /* 상태 바인딩 */
            onChange={(e) => setAnswer(e.target.value)} /* 상태 업데이트 */
          />
        </div>
      </form>
    </main>
  );
}
