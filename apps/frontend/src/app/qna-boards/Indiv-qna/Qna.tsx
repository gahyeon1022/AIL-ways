"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

type ThinCardProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

function ThinCard({ title, children, className = "" }: ThinCardProps) {
  return (
    <section className={`relative overflow-visible rounded-[16px] border border-black/10 bg-white/70 shadow-sm ${className}`}>
      <header className="rounded-t-[16px] px-4 py-2 text-[12px] text-gray-800">{title}</header>
      <div className="h-[1px] bg-black/20" />
      <div className="rounded-b-[16px] p-6">{children}</div>
    </section>
  );
}

const STATUS_LABEL: Record<string, string> = {
  COMPLETED: "해결완료",
  INCOMPLETE: "해결완료",
};

const STATUS_CLASS: Record<string, string> = {
  COMPLETED: "bg-slate-600 text-white",
  INCOMPLETE: "bg-emerald-500 text-white",
};

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Participant = {
  userId?: string | null;
  userName?: string | null;
  role?: string | null;
};

type BoardCommentDto = {
  commentId?: string | null;
  authorUserId?: string | null;
  content?: string | null;
  createdAt?: string | null;
  replies?: BoardCommentDto[] | null;
};

type CommentView = {
  commentId: string;
  authorUserId?: string;
  authorName: string;
  authorRole?: string;
  content: string;
  createdAt?: string;
};

type Props = {
  boardId?: string | null;
  entryId?: string | null;
  questionTitle: string;
  questionNote: string;
  questionAuthorId?: string;
  questionAuthorName?: string;
  questionAuthorRole?: string;
  questionCreatedAt?: string;
  status: string;
  actorUserId?: string;
  actorUserName?: string;
  actorUserRole?: string;
  comments?: BoardCommentDto[] | null;
  participants?: Participant[];
};

function formatBadge(name?: string, role?: string | null) {
  if (!name && !role) return "멘토 답변";
  const roleLabel = role === "MENTOR" ? "멘토" : role === "MENTEE" ? "멘티" : "";
  return `${name ?? "사용자"}${roleLabel ? ` ${roleLabel}` : ""}`.trim();
}

export default function QnaUI({
  boardId,
  entryId,
  questionNote,
  questionAuthorId,
  questionAuthorName,
  questionAuthorRole,
  questionCreatedAt,
  status,
  actorUserId,
  actorUserName,
  actorUserRole,
  comments,
  participants,
}: Props) {
  const [statusState, setStatusState] = useState(status);
  const statusLabel = STATUS_LABEL[statusState] ?? STATUS_LABEL.INCOMPLETE;
  const statusClass = STATUS_CLASS[statusState] ?? STATUS_CLASS.INCOMPLETE;
  const participantMap = useMemo(() => {
    const map = new Map<string, Participant>();
    participants?.forEach(participant => {
      if (participant?.userId) {
        map.set(participant.userId, participant);
      }
    });
    return map;
  }, [participants]);

  const resolveParticipant = useCallback(
    (userId?: string | null) => {
      if (!userId) {
        return { name: "알 수 없음", role: undefined };
      }
      const info = participantMap.get(userId);
      return {
        name: info?.userName ?? userId,
        role: info?.role ?? undefined,
      };
    },
    [participantMap]
  );

  const mapComments = useCallback(
    (input?: BoardCommentDto[] | null) => {
      if (!input) return [];
      const rows: CommentView[] = [];
      const append = (items: BoardCommentDto[]) => {
        items.forEach(item => {
          const id =
            item.commentId ??
            `comment-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
          const info = resolveParticipant(item.authorUserId);
          rows.push({
            commentId: id,
            authorUserId: item.authorUserId ?? undefined,
            authorName: info.name,
            authorRole: info.role,
            content: item.content ?? "",
            createdAt: item.createdAt ?? undefined,
          });
          if (item.replies && item.replies.length > 0) {
            append(item.replies);
          }
        });
      };
      append(input);
      return rows;
    },
    [resolveParticipant]
  );

  const initialComments = useMemo(() => mapComments(comments), [comments, mapComments]);
  const [commentsState, setCommentsState] = useState<CommentView[]>(initialComments);
  useEffect(() => {
    setCommentsState(initialComments);
  }, [initialComments]);
  const [commentInput, setCommentInput] = useState("");
  const [pending, setPending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [completePending, setCompletePending] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const formDisabled = !boardId || !entryId;
  const isCompleted = statusState === "COMPLETED";
  const canSubmit = useMemo(
    () => Boolean(!formDisabled && !isCompleted && commentInput.trim() && !pending),
    [formDisabled, isCompleted, commentInput, pending]
  );
  const canComplete = !formDisabled && !isCompleted && actorUserRole === "MENTEE" && !completePending;

  const submitAnswer = useCallback(async () => {
    if (!canSubmit || !boardId || !entryId) return;
    const trimmed = commentInput.trim();
    if (!trimmed) return;

    setPending(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/boards/${encodeURIComponent(boardId)}/entries/${encodeURIComponent(entryId)}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: trimmed }),
      });
      const payload = await res.json();
      if (!res.ok || payload?.success === false) {
        throw new Error(payload?.error?.message ?? "답변을 저장할 수 없습니다.");
      }

      const updatedEntry = payload?.data?.entries?.find((entry: { entryId: string }) => entry.entryId === entryId);
      if (updatedEntry?.comments) {
        setCommentsState(mapComments(updatedEntry.comments));
      } else {
        const info = resolveParticipant(actorUserId);
        setCommentsState(prev => [
          ...prev,
          {
            commentId: `temp-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`,
            authorUserId: actorUserId ?? undefined,
            authorName: actorUserName ?? info.name,
            authorRole: actorUserRole ?? info.role,
            content: trimmed,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
      setCommentInput("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "답변 등록에 실패했습니다.";
      setSubmitError(message);
    } finally {
      setPending(false);
    }
  }, [actorUserId, actorUserName, actorUserRole, boardId, canSubmit, commentInput, entryId, mapComments, resolveParticipant]);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      submitAnswer();
    },
    [submitAnswer]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        submitAnswer();
      }
    },
    [submitAnswer]
  );

  const questionAuthorLabel = formatBadge(questionAuthorName ?? questionAuthorId, questionAuthorRole ?? "MENTEE");

  const handleComplete = useCallback(async () => {
    if (!boardId || !entryId || !canComplete) return;
    setCompletePending(true);
    setCompleteError(null);
    try {
      const res = await fetch(
        `/api/boards/${encodeURIComponent(boardId)}/entries/${encodeURIComponent(entryId)}/complete`,
        { method: "PATCH" }
      );
      const payload = await res.json();
      if (!res.ok || payload?.success === false) {
        throw new Error(payload?.error?.message ?? "완료 처리에 실패했습니다.");
      }
      setStatusState("COMPLETED");
      setConfirmOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "완료 처리에 실패했습니다.";
      setCompleteError(message);
    } finally {
      setCompletePending(false);
    }
  }, [boardId, entryId, canComplete]);

  return (
    <main className="mx-auto w-full max-w-[960px] space-y-8 px-6 py-12 self-start">
      <ThinCard title={questionAuthorLabel || "질문"} className="pt-[4px] -translate-y-4 bg-white/90">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">{questionCreatedAt && <span>{formatDate(questionCreatedAt)}</span>}</div>
          <p className="min-h-[180px] whitespace-pre-wrap text-[15px] leading-relaxed text-gray-800">{questionNote}</p>
        </div>
      </ThinCard>

      {completeError && <p className="text-sm text-red-500">{completeError}</p>}

      {commentsState.map(comment => (
        <ThinCard
          key={comment.commentId}
          title={formatBadge(comment.authorName, comment.authorRole ?? undefined)}
          className="bg-white/90"
        >
          <div className="space-y-3">
            <div className="text-sm text-gray-500">{comment.createdAt && <span>{formatDate(comment.createdAt)}</span>}</div>
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-gray-800">{comment.content}</p>
          </div>
        </ThinCard>
      ))}

    

      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-3 rounded-2xl bg-white/100 p-4 shadow-inner">
          <textarea
            value={commentInput}
            onChange={event => setCommentInput(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={formDisabled || pending || isCompleted}
            placeholder={
              formDisabled ? "게시판 이동 후 다시 시도해 주세요." : isCompleted ? "이미 해결된 질문입니다." : "댓글을 입력해 주세요."
            }
            className="h-10 flex-1 resize-none bg-transparent px-2 text-sm text-gray-800 outline-none disabled:cursor-not-allowed disabled:opacity-70"
          />
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {pending ? "등록 중..." : "등록"}
          </button>
        </div>
        {submitError && <p className="mt-2 text-sm text-red-500">{submitError}</p>}
      </form>

        <div className="flex justify-center pr-1">
        {canComplete ? (
        <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={completePending}
            className={`inline-flex h-11 w-[100px] items-center justify-center rounded-full text-s font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-70 ${STATUS_CLASS.INCOMPLETE}`}
          >
            {completePending ? "처리 중..." : "해결완료"}
          </button>
        ) : (
          <span className={`inline-flex h-11 w-[100px] items-center justify-center rounded-full text-s font-semibold ${statusClass}`}>
            {statusLabel}
          </span>
        )}
      </div>
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <h2 className="text-lg font-semibold text-gray-900">질문이 해결되셨습니까?</h2>
            <p className="mt-2 text-sm text-gray-600">해결로 표시하면 더 이상 댓글을 작성할 수 없습니다.</p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
              >
                아니요
              </button>
              <button
                type="button"
                onClick={handleComplete}
                disabled={completePending}
                className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                네
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
