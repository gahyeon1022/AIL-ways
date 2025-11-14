import QnaUI from "@/app/qna-boards/Indiv-qna/Qna";
import { callAPIWithAuth } from "@/app/lib/api/http";

export const dynamic = "force-dynamic";

type BoardAnswer = {
  authorUserId?: string | null;
  comment?: string | null;
  createdAt?: string | null;
};

type BoardEntry = {
  entryId: string;
  authorUserId?: string | null;
  title?: string | null;
  questionNote?: string | null;
  createdAt?: string | null;
  status?: string | null;
  boardAnswer?: BoardAnswer | null;
};

type BoardResponse = {
  id: string;
  title?: string | null;
  entries?: BoardEntry[] | null;
};

type UserSummary = {
  userId: string | null;
  userName: string | null;
  role: string | null;
};

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

async function fetchBoard(boardId: string) {
  return callAPIWithAuth<BoardResponse>(`/api/boards/${boardId}`, { cache: "no-store" });
}

async function fetchProfile() {
  return callAPIWithAuth<UserSummary>("/api/users/me", { cache: "no-store" });
}

async function fetchAllUsers() {
  return callAPIWithAuth<UserSummary[]>("/api/users", { cache: "no-store" });
}

function normalize(value?: string | string[]) {
  if (!value) return null;
  const raw = Array.isArray(value) ? value[0] : value;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function resolveUser(userId: string | null | undefined, userMap: Map<string, UserSummary>) {
  if (!userId) return null;
  const info = userMap.get(userId);
  if (info) return info;
  return { userId, userName: userId, role: null } satisfies UserSummary;
}

export default async function QnaEntryPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : undefined;
  const boardId = normalize(params?.boardId);
  const entryId = normalize(params?.entryId);

  if (!boardId || !entryId) {
    return (
      <QnaUI questionTitle="질문을 불러올 수 없어요" questionNote="멘토링 현황에서 다시 시도해 주세요." status="INCOMPLETE" />
    );
  }

  try {
    const [board, actor, users] = await Promise.all([fetchBoard(boardId), fetchProfile(), fetchAllUsers()]);
    const userMap = users.reduce<Map<string, UserSummary>>((map, user) => {
      if (user.userId) map.set(user.userId, user);
      return map;
    }, new Map());

    const targetEntry = board.entries?.find(entry => entry.entryId === entryId);

    if (!targetEntry) {
      return (
        <QnaUI
          questionTitle="질문을 찾을 수 없어요"
          questionNote="선택한 질문이 삭제되었거나 존재하지 않습니다."
          status="INCOMPLETE"
        />
      );
    }

    const questionUser = resolveUser(targetEntry.authorUserId ?? undefined, userMap);
    const answerUser = resolveUser(targetEntry.boardAnswer?.authorUserId ?? undefined, userMap);
    const actorUser = actor?.userId ? resolveUser(actor.userId, userMap) : null;

    return (
      <QnaUI
        boardId={board.id}
        entryId={targetEntry.entryId}
        questionTitle={targetEntry.title ?? "제목 없음"}
        questionNote={targetEntry.questionNote ?? "내용이 없습니다."}
        questionAuthorId={questionUser?.userId ?? undefined}
        questionAuthorName={questionUser?.userName ?? undefined}
        questionAuthorRole={questionUser?.role ?? undefined}
        questionCreatedAt={targetEntry.createdAt ?? undefined}
        status={targetEntry.status ?? "INCOMPLETE"}
        answerAuthorId={answerUser?.userId ?? undefined}
        answerAuthorName={answerUser?.userName ?? undefined}
        answerAuthorRole={answerUser?.role ?? undefined}
        answerComment={targetEntry.boardAnswer?.comment ?? undefined}
        answerCreatedAt={targetEntry.boardAnswer?.createdAt ?? undefined}
        actorUserId={actorUser?.userId ?? undefined}
        actorUserName={actorUser?.userName ?? undefined}
        actorUserRole={actorUser?.role ?? undefined}
      />
    );
  } catch (err) {
    console.error("[qna-board-entry] failed", err);
    return (
      <QnaUI questionTitle="게시판을 불러올 수 없습니다" questionNote="잠시 후 다시 시도해 주세요." status="INCOMPLETE" />
    );
  }
}
