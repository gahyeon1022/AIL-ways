import QnaBoardClient, { QnaEntry } from "./QnaBoardClient";
import { callAPIWithAuth } from "@/app/lib/api/http";

export const dynamic = "force-dynamic";

type UserProfile = {
  userId: string;
  userName: string;
  role: string;
};

type BoardAnswer = {
  authorUserId?: string | null;
  comment?: string | null;
  createdAt?: string | null;
};

type BoardEntry = {
  entryId: string;
  title?: string | null;
  questionNote?: string | null;
  status?: string | null;
  entryNo?: number | null;
  boardAnswer?: BoardAnswer | null;
};

type BoardResponse = {
  id: string;
  title?: string | null;
  entries?: BoardEntry[] | null;
};

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

async function fetchProfile() {
  return callAPIWithAuth<UserProfile>("/api/users/me", { cache: "no-store" });
}

async function fetchBoard(selfUserId: string, peerUserId: string) {
  const qs = new URLSearchParams({ userId1: selfUserId, userId2: peerUserId }).toString();
  return callAPIWithAuth<BoardResponse>(`/api/boards/by-users?${qs}`, { cache: "no-store" });
}

async function fetchAllUsers() {
  return callAPIWithAuth<UserProfile[]>("/api/users", { cache: "no-store" });
}

function normalizeParam(value?: string | string[]) {
  if (!value) return null;
  const raw = Array.isArray(value) ? value[0] : value;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export default async function QnaBoardPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : undefined;
  const peerUserId = normalizeParam(params?.peerId);
  let actorRole: "MENTOR" | "MENTEE" | null = null;

  if (!peerUserId) {
    return (
      <QnaBoardClient
        peerUserId={null}
        boardId={null}
        boardTitle=""
        entries={[]}
        state="missingPeer"
      />
    );
  }

  try {
    const profile = await fetchProfile();
    actorRole = profile.role as "MENTOR" | "MENTEE" | null;
    const [board, users] = await Promise.all([fetchBoard(profile.userId, peerUserId), fetchAllUsers()]);
    const peerInfo = users.find(user => user.userId === peerUserId);
    const normalizedEntries: QnaEntry[] =
      board.entries?.map(entry => ({
        entryId: entry.entryId,
        title: entry.title ?? "제목 없음",
        question: entry.questionNote ?? "질문 내용이 없습니다.",
        status: entry.status ?? "INCOMPLETE",
      })) ?? [];

    return (
      <QnaBoardClient
        peerUserId={peerUserId}
        peerDisplayName={peerInfo?.userName ?? peerUserId}
        peerRole={peerInfo?.role as "MENTOR" | "MENTEE" | null}
        actorRole={actorRole}
        boardId={board.id}
        boardTitle={board.title ?? "Q&A Board"}
        entries={normalizedEntries}
        state="ready"
      />
    );
  } catch (err) {
    console.error("[qna-boards] failed to load board", err);
    const message = err instanceof Error ? err.message : "UNKNOWN_ERROR";
    return (
      <QnaBoardClient
        peerUserId={peerUserId}
        peerDisplayName={null}
        peerRole={null}
        actorRole={actorRole}
        boardId={null}
        boardTitle=""
        entries={[]}
        state="error"
        errorMessage={message}
      />
    );
  }
}
