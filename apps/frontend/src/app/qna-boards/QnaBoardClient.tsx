"use client";

import Link from "next/link";
import React from "react";

export type QnaEntry = {
  entryId: string;
  title: string;
  question: string;
  status: string;
};

type Props = {
  peerUserId: string | null;
  peerDisplayName?: string | null;
  peerRole?: "MENTOR" | "MENTEE" | null;
  actorRole?: "MENTOR" | "MENTEE" | null;
  boardId: string | null;
  boardTitle: string;
  entries: QnaEntry[];
  state: "ready" | "missingPeer" | "error";
  errorMessage?: string;
};

const statusClass: Record<string, string> = {
  COMPLETED: "bg-emerald-500 text-white/90",
  INCOMPLETE: "bg-amber-300 text-white/90",
};

export default function QnaBoardClient({
  peerUserId,
  peerDisplayName,
  peerRole,
  actorRole,
  boardId,
  boardTitle,
  entries,
  state,
  errorMessage,
}: Props) {
  if (state === "missingPeer") {
    return (
      <FallbackCard
        title="게시판을 불러올 수 없어요"
        description="멘토링 현황에서 상대방을 선택해 주세요."
      />
    );
  }

  if (state === "error") {
    return (
      <FallbackCard
        title="게시판을 불러올 수 없어요"
        description={errorMessage || "잠시 후 다시 시도해 주세요."}
      />
    );
  }

  return (
    <main className="min-h-screen w-full p-8">
      <div className="mx-auto max-w-5xl rounded-[32px] bg-[#f3f5fc] p-10 shadow-[0_35px_90px_rgba(149,139,206,0.25)] ring-1 ring-white/80 backdrop-blur-xl min-h-[850px]">
        <header className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-gray-400">Mentor · Mentee</p>
          <h1 className="mt-2 text-4xl font-semibold text-gray-900">{boardTitle || "Q&A Board"}</h1>
          {peerUserId && (
            (() => {
              const inferredRole =
                peerRole ??
                (actorRole === "MENTOR" ? "MENTEE" : actorRole === "MENTEE" ? "MENTOR" : null);
              const roleLabel = inferredRole === "MENTEE" ? "멘티" : "멘토";
              return (
                <p className="mt-2 text-sm text-gray-500">
                  {roleLabel} : {peerDisplayName ?? peerUserId}
                </p>
              );
            })()
          )}
        </header>

        <section className="mt-10 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_12px_40px_rgba(131,146,171,0.12)]">
          <div
            className="grid bg-gray-50/70 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500"
            style={{ gridTemplateColumns: "1.4fr 2.2fr 0.52fr" }}
          >
            <span className="border-r border-gray-300 pl-8 pr-4">제목</span>
            <span className="border-r border-gray-300 px-4">내용</span>
            <span className="px-8 text-center">상태</span>
          </div>
          {entries.length === 0 ? (
            <div className="flex h-[220px] items-center justify-center bg-white px-8 text-sm text-gray-500">
              등록된 질문이 없습니다.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 bg-white">
              {entries.map(entry => (
                <li key={entry.entryId}>
                  <Link
                    href={
                      boardId
                        ? `/qna-boards/Indiv-qna?boardId=${encodeURIComponent(boardId)}&entryId=${encodeURIComponent(entry.entryId)}`
                        : "#"
                    }
                    scroll
                    className="grid py-5 text-sm text-gray-800 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
                    style={{ gridTemplateColumns: "1.4fr 2.2fr auto" }}
                    aria-disabled={!boardId}
                  >
                    <div className="flex items-center border-r border-gray-200 pl-8 pr-4">
                      <p className="font-semibold text-gray-900">{entry.title}</p>
                    </div>
                    <p className="flex items-center border-r border-gray-200 px-4 line-clamp-1 whitespace-pre-wrap text-gray-600">{entry.question}</p>
                    <div className="flex w-full items-center justify-center px-8">
                      <span
                        className={`inline-flex h-8 w-[55px] items-center justify-center rounded-full text-xs font-semibold ${
                          statusClass[entry.status] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {entry.status === "COMPLETED" ? "해결" : "진행중"}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function FallbackCard({ title, description }: { title: string; description: string }) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-gradient-to-br from-[#e8e7f3] to-[#f4f3fb] p-6">
      <div className="rounded-3xl bg-white/90 p-10 text-center shadow-xl">
        <h1 className="text-3xl font-semibold text-gray-900">{title}</h1>
        <p className="mt-4 text-gray-600">{description}</p>
      </div>
    </main>
  );
}
