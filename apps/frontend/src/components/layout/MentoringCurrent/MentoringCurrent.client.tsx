"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchIncomingMatchesForMentor,
  fetchMentorsForMentee,
  requestMatchAction,
  respondMatchAction,
} from "@/app/server-actions/matches";

export type MentorCard = { id: string; name: string; matchId?: string; avatar?: string };
export type PendingMatchCard = { matchId: string; menteeId: string; menteeName: string };

type MentoringCurrentClientProps = {
  role: "MENTOR" | "MENTEE" | null;
  initialMentors: MentorCard[];
  initialPendingMatches: PendingMatchCard[];
};

type PendingRequest = { matchId: string; mentorUserId: string; status: "PENDING" | "ACCEPTED" | "REJECTED" };

const POLL_INTERVAL_MS = 15000;

const errorMessage = (err: unknown) => {
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "message" in err && typeof (err as { message?: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  return "요청 처리 중 문제가 발생했습니다.";
};

const toMentorCards = (list: MentorCard[]) =>
  list
    .filter(item => item && typeof item.id === "string" && typeof item.name === "string")
    .map(item => ({ ...item, id: item.id.trim(), name: item.name.trim() }));

export default function MentoringCurrentClient({
  role,
  initialMentors,
  initialPendingMatches,
}: MentoringCurrentClientProps) {
  const router = useRouter();
  const [mentors, setMentors] = useState<MentorCard[]>(() => toMentorCards(initialMentors));
  const [pendingMatches, setPendingMatches] = useState<PendingMatchCard[]>(initialPendingMatches);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [code, setCode] = useState("");
  const [activeMentor, setActiveMentor] = useState<MentorCard | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingMatchId, setProcessingMatchId] = useState<string | null>(null);

  useEffect(() => {
    if (!feedback) return;
    const id = window.setTimeout(() => setFeedback(null), 3000);
    return () => window.clearTimeout(id);
  }, [feedback]);

  useEffect(() => {
    if (!error) return;
    const id = window.setTimeout(() => setError(null), 3500);
    return () => window.clearTimeout(id);
  }, [error]);

  useEffect(() => {
    setMentors(toMentorCards(initialMentors));
  }, [initialMentors]);

  useEffect(() => {
    setPendingMatches(initialPendingMatches);
  }, [initialPendingMatches]);

  useEffect(() => {
    if (role !== "MENTOR") return;

    let aborted = false;

    const syncPending = async () => {
      try {
        const next = await fetchIncomingMatchesForMentor();
        if (!aborted) {
          setPendingMatches(next);
        }
      } catch (err) {
        if (!aborted) {
          setError(errorMessage(err));
        }
      }
    };

    syncPending();
    const tick = setInterval(syncPending, POLL_INTERVAL_MS);
    return () => {
      aborted = true;
      clearInterval(tick);
    };
  }, [role]);

  const currentRequest = useMemo(() => (pendingMatches.length > 0 ? pendingMatches[0] : null), [pendingMatches]);

  const refreshMentors = async () => {
    if (role !== "MENTEE") return;
    try {
      const next = await fetchMentorsForMentee();
      const mapped = next.map(item => ({
        id: item.userId,
        name: item.userName ?? item.userId,
        matchId: item.matchId,
      }));
      setMentors(toMentorCards(mapped));
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const handleAdd = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setError("멘토 아이디를 입력해 주세요.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const match = await requestMatchAction(trimmed);
      setPendingRequests(prev => [...prev, { matchId: match.matchId, mentorUserId: trimmed, status: match.status }]);
      setFeedback("매칭 요청을 전송했습니다.");
      setCode("");
      setShowAdd(false);
      await refreshMentors();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRespond = async (match: PendingMatchCard, decision: "accept" | "reject") => {
    setProcessingMatchId(match.matchId);
    setError(null);
    try {
      await respondMatchAction(match.matchId, decision);
      setPendingMatches(prev => prev.filter(item => item.matchId !== match.matchId));
      setFeedback(decision === "accept" ? "매칭을 수락했습니다." : "매칭을 거절했습니다.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setProcessingMatchId(null);
    }
  };

  const goReport = (type: "weekly" | "study") => {
    if (!activeMentor) return;
    router.push(`/reports/${type}?mentor=${activeMentor.id}`);
  };

  return (
    <div className="relative mx-auto h-[560px] w-full max-w-[1040px] overflow-hidden rounded-2xl bg-[#3a3a3a] p-8 text-white">
      <div className="space-y-2">
        {feedback && <div className="rounded-lg bg-emerald-500/20 px-4 py-2 text-sm text-emerald-100">{feedback}</div>}
        {error && <div className="rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-100">{error}</div>}
      </div>

      <div className="mt-4 flex h-full flex-col">
        {role === "MENTEE" ? (
          <>
            <div className="flex-1 overflow-y-auto pb-16">
              <div className="grid grid-cols-1 place-items-center gap-x-7 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {mentors.map(m => (
                  <button
                    key={`${m.id}-${m.matchId ?? ""}`}
                    onClick={() => setActiveMentor(m)}
                    className="group flex w-full max-w-[180px] flex-col items-center rounded-2xl bg-white/5 p-6 shadow-inner transition hover:bg-white/10"
                  >
                    <div className="h-32 w-32 rounded-full bg-gray-300 shadow-inner" />
                    <span className="mt-4 text-sm font-medium text-white/90">{m.name}</span>
                  </button>
                ))}

                {mentors.length === 0 && (
                  <div className="col-span-full py-24 text-center text-sm text-white/70">
                    아직 매칭된 멘토가 없습니다. 우측 하단의 + 버튼으로 매칭을 요청해 보세요.
                  </div>
                )}
              </div>
            </div>

            {pendingRequests.length > 0 && (
              <div className="mt-4 rounded-xl bg-white/10 p-4 text-sm text-white/80">
                <div className="font-semibold text-white">대기 중인 매칭 요청</div>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {pendingRequests.map(req => (
                    <li key={req.matchId}>
                      {req.mentorUserId} 님에게 요청 전송됨 ({req.status === "PENDING" ? "대기 중" : req.status})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : role === "MENTOR" ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-white/80">
            <p className="text-lg font-semibold">멘티의 매칭 요청을 기다리고 있습니다.</p>
            <p className="mt-2 text-sm text-white/60">
              새로운 요청이 도착하면 화면 중앙에 알림이 표시됩니다.
            </p>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-center text-white/70">
            프로필에서 역할을 설정하면 매칭 기능을 이용할 수 있습니다.
          </div>
        )}
      </div>

      {role === "MENTEE" && (
        <button
          onClick={() => setShowAdd(true)}
          className="absolute bottom-6 right-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#c9d5f4] text-4xl font-bold text-gray-900 shadow-lg transition hover:scale-105"
          aria-label="멘토 추가"
        >
          +
        </button>
      )}

      {role === "MENTEE" && showAdd && (
        <div className="absolute inset-0 z-40 flex items-center justify-center rounded-2xl bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-gray-900">
            <h3 className="mb-4 text-lg font-semibold">멘토 추가</h3>
            <p className="mb-3 text-sm text-gray-600">코드를 입력하면 해당 멘토에게 매칭 요청을 전송합니다.</p>
            <input
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="멘토 아이디를 입력하세요"
              className="mb-4 w-full rounded-lg border border-gray-200 p-3 text-sm"
              disabled={isSubmitting}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAdd(false)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                disabled={isSubmitting}
              >
                취소
              </button>
              <button
                onClick={handleAdd}
                className="rounded-lg bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? "전송 중..." : "추가"}
              </button>
            </div>
          </div>
        </div>
      )}

      {role === "MENTEE" && activeMentor && (
        <>
          <button
            onClick={() => setActiveMentor(null)}
            className="absolute inset-0 z-30 bg-black/20"
            aria-label="패널 닫기"
          />
          <div className="absolute left-6 top-6 z-40 w-64 rounded-2xl bg-white p-6 text-gray-900 shadow-xl">
            <div className="mb-4 text-lg font-semibold">{activeMentor.name}</div>
            <div className="grid gap-2">
              <button onClick={() => goReport("weekly")} className="rounded-lg bg-gray-100 px-4 py-2 text-sm">
                주간 리포트
              </button>
              <button onClick={() => goReport("study")} className="rounded-lg bg-gray-100 px-4 py-2 text-sm">
                학습 리포트
              </button>
            </div>
            <button
              onClick={() => setActiveMentor(null)}
              className="mt-6 text-sm text-gray-500 underline"
            >
              닫기
            </button>
          </div>
        </>
      )}

      {role === "MENTOR" && currentRequest && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center text-gray-900 shadow-xl">
            <h3 className="text-xl font-semibold text-gray-900">매칭이 도착했습니다</h3>
            <p className="mt-4 text-sm text-gray-600">
              {currentRequest.menteeName} 님이 매칭을 요청했습니다.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => handleRespond(currentRequest, "reject")}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
                disabled={processingMatchId === currentRequest.matchId}
              >
                거절
              </button>
              <button
                onClick={() => handleRespond(currentRequest, "accept")}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white transition hover:bg-gray-800 disabled:opacity-60"
                disabled={processingMatchId === currentRequest.matchId}
              >
                {processingMatchId === currentRequest.matchId ? "처리 중..." : "수락"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
