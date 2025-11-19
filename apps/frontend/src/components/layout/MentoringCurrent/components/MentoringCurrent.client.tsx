'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  fetchAcceptedMenteesForMentor,
  fetchIncomingMatchesForMentor,
  fetchMentorsForMentee,
  requestMatchAction,
  respondMatchAction,
} from '@/app/server-actions/matches';

export type MatchCard = {
  id: string;
  name: string;
  matchId?: string;
  avatar?: string;
};
export type PendingMatchCard = {
  matchId: string;
  menteeId: string;
  menteeName: string;
};

type MentoringCurrentClientProps = {
  role: 'MENTOR' | 'MENTEE' | null;
  initialMentors?: MatchCard[];
  initialMentees?: MatchCard[];
  initialPendingMatches: PendingMatchCard[];
  initialIntent?: string | null; //서버에서 intent를 내려줘서 서버가 그릴때부터 intent가 있도록 함.
};

type PendingRequest = {
  matchId: string;
  mentorUserId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
};

const POLL_INTERVAL_MS = 15000;

const errorMessage = (err: unknown) => {
  if (typeof err === 'string' && err.trim()) return err.trim();
  if (err && typeof err === 'object') {
    if ('message' in err && typeof (err as { message?: unknown }).message === 'string') {
      const message = (err as { message: string }).message.trim();
      if (message) return message;
    }
    if ('payload' in err) {
      const payload = (err as { payload?: unknown }).payload;
      if (payload && typeof payload === 'object' && 'error' in payload) {
        const envelopeError = (payload as { error?: unknown }).error;
        if (envelopeError && typeof envelopeError === 'object' && 'message' in envelopeError) {
          const nestedMessage = (envelopeError as { message?: unknown }).message;
          if (typeof nestedMessage === 'string' && nestedMessage.trim()) {
            return nestedMessage.trim();
          }
        }
      }
    }
  }
  return '요청 처리 중 문제가 발생했습니다.';
};

const normalizeCards = (list: MatchCard[]) =>
  list
    .filter(
      (item) =>
        item && typeof item.id === 'string' && typeof item.name === 'string'
    )
    .map((item) => ({ ...item, id: item.id.trim(), name: item.name.trim() }));

export default function MentoringCurrentClient({
  role,
  initialMentors,
  initialMentees,
  initialPendingMatches,
  initialIntent,
}: MentoringCurrentClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const intentFromQuery = searchParams.get('intent');
  const normalizedIntent = (
    intentFromQuery ??
    initialIntent ??
    ''
  ).toLowerCase();
  const showLearningCTA = normalizedIntent === 'study';
  const showFeedbackCTA = normalizedIntent === 'feedback';
  const cardOptionsDisabled = normalizedIntent === 'board';
  const [mentors, setMentors] = useState<MatchCard[]>(() =>
    normalizeCards(initialMentors ?? [])
  );
  const [mentees, setMentees] = useState<MatchCard[]>(() =>
    normalizeCards(initialMentees ?? [])
  );
  const [pendingMatches, setPendingMatches] = useState<PendingMatchCard[]>(
    initialPendingMatches
  );
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [code, setCode] = useState('');
  const [activeMentor, setActiveMentor] = useState<MatchCard | null>(null);
  const [activeMentee, setActiveMentee] = useState<MatchCard | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingMatchId, setProcessingMatchId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!feedback) return;
    const id = window.setTimeout(() => setFeedback(null), 3000);
    return () => window.clearTimeout(id);
  }, [feedback]);

  useEffect(() => {
    if (!error) return;
    const id = window.setTimeout(() => setError(null), 3500);
    setShowAdd(false); // hide mentor request modal when showing error banner
    return () => window.clearTimeout(id);
  }, [error]);

  useEffect(() => {
    if (cardOptionsDisabled) {
      setActiveMentor(null);
      setActiveMentee(null);
    }
  }, [cardOptionsDisabled]);

  useEffect(() => {
    setMentors(normalizeCards(initialMentors ?? []));
  }, [initialMentors]);

  useEffect(() => {
    setMentees(normalizeCards(initialMentees ?? []));
  }, [initialMentees]);

  useEffect(() => {
    setPendingMatches(initialPendingMatches);
  }, [initialPendingMatches]);

  useEffect(() => {
    if (role !== 'MENTOR') return;

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

  const refreshMentors = async () => {
    if (role !== 'MENTEE') return;
    try {
      const next = await fetchMentorsForMentee();
      const mapped = next.map((item) => ({
        id: item.userId,
        name: item.userName ?? item.userId,
        matchId: item.matchId,
      }));
      setMentors(normalizeCards(mapped));
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const refreshMentees = async () => {
    if (role !== 'MENTOR') return;
    try {
      const next = await fetchAcceptedMenteesForMentor();
      const mapped = next.map((item) => ({
        id: item.userId,
        name: item.userName ?? item.userId,
        matchId: item.matchId,
      }));
      setMentees(normalizeCards(mapped));
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const handleAdd = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setError('멘토 아이디를 입력해 주세요.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await requestMatchAction(trimmed);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      const match = result.data;
      setPendingRequests(prev => [...prev, { matchId: match.matchId, mentorUserId: trimmed, status: match.status }]);
      setFeedback("매칭 요청을 전송했습니다.");
      setCode("");
      setShowAdd(false);
      setActiveMentor(null);
      setActiveMentee(null);
      await refreshMentors();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRespond = async (
    match: PendingMatchCard,
    decision: 'accept' | 'reject'
  ) => {
    setProcessingMatchId(match.matchId);
    setError(null);
    try {
      const result = await respondMatchAction(match.matchId, decision);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setPendingMatches(prev => prev.filter(item => item.matchId !== match.matchId));
      setFeedback(decision === "accept" ? "매칭을 수락했습니다." : "매칭을 거절했습니다.");
      if (decision === "accept") {
        await refreshMentees();
      }
      setActiveMentor(null);
      setActiveMentee(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setProcessingMatchId(null);
    }
  };

  const goReport = (
    type: 'weekly' | 'study',
    card: MatchCard,
    target: 'mentor' | 'mentee'
  ) => {
    if (type === 'study') {
      if (!card.matchId) {
        setError('연결된 매칭 정보를 찾을 수 없습니다.');
        return;
      }
      router.push(
        `/learning-report?matchId=${encodeURIComponent(card.matchId)}&role=${role}`
      );
      return;
    }

    router.push(`/weekly-report?${target}=${encodeURIComponent(card.id)}`);
  };

  const goBoard = (peerId: string) => {
    router.push(`/qna-boards?peerId=${encodeURIComponent(peerId)}`);
  };

  const goLearningScreen = (mentor: MatchCard) => {
    if (!showLearningCTA || cardOptionsDisabled) return;
    if (!mentor.matchId) {
      setError('선택한 멘토와의 매칭 정보가 없습니다.');
      return;
    }
    const query = new URLSearchParams({
      matchId: mentor.matchId,
      mentorId: mentor.id,
    });
    router.push(`/learning-screen?${query.toString()}`);
    setActiveMentor(null);
  };

  const goFeedbackScreen = (mentee: MatchCard) => {
    if (!showFeedbackCTA || cardOptionsDisabled) return;
    if (!mentee.matchId) {
      setError('선택한 멘티와의 매칭 정보가 없습니다.');
      return;
    }
    const query = new URLSearchParams({
      matchId: mentee.matchId,
      menteeId: mentee.id,
    });
    router.push(`/mentor-feedback?${query.toString()}`);
    setActiveMentee(null);
  };

  return (
    <div className="relative mx-auto h-[560px] w-full max-w-[1040px] overflow-hidden rounded-2xl bg-[#d6d4e6] p-8 text-white">
      <div className="space-y-2">
        {feedback && (
          <div className="rounded-lg bg-emerald-500/20 px-4 py-2 text-sm text-emerald-100">
            {feedback}
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-100">
            {error}
          </div>
        )}
      </div>

      <div className="mt-4 flex h-full flex-col">
        {role === 'MENTEE' ? (
          <>
            <div className="flex-1 overflow-y-auto pb-16">
              <div className="grid grid-cols-1 place-items-center gap-x-7 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {mentors.map((m) => (
                  <button
                    key={`${m.id}-${m.matchId ?? ''}`}
                    onClick={() => {
                      if (cardOptionsDisabled) {
                        goBoard(m.id);
                        return;
                      }
                      setActiveMentor(m);
                      setActiveMentee(null);
                    }}
                    className="group flex w-full max-w-[180px] flex-col items-center rounded-2xl bg-[#c4c0df] p-6 shadow-md transition hover:bg-[#d2cfea] hover:shadow-lg"
                  >
                    <div className="h-32 w-32 rounded-full bg-white shadow-inner" />
                    <span className="mt-4 text-sm font-medium text-[#1f1c2e]">{`${m.name} 멘토`}</span>
                  </button>
                ))}

                {mentors.length === 0 && (
                  <div className="col-span-full py-24 text-center text-xl text-white/70">
                    아직 매칭된 멘토가 없습니다. 우측 하단의 + 버튼으로 매칭을
                    요청해 보세요.
                  </div>
                )}
              </div>
            </div>

            {pendingRequests.length > 0 && (
              <div className="mt-4 rounded-xl bg-white/10 p-4 text-sm text-white/80">
                <div className="font-semibold text-white">
                  대기 중인 매칭 요청
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {pendingRequests.map((req) => (
                    <li key={req.matchId}>
                      {req.mentorUserId} 님에게 요청 전송됨 (
                      {req.status === 'PENDING' ? '대기 중' : req.status})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : role === 'MENTOR' ? (
          <>
            <div className="flex-1 overflow-y-auto pb-16">
              <div className="grid grid-cols-1 place-items-center gap-x-7 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {mentees.map((m) => (
                  <button
                    key={`${m.id}-${m.matchId ?? ''}`}
                    onClick={() => {
                      if (cardOptionsDisabled) {
                        goBoard(m.id);
                        return;
                      }
                      setActiveMentee(m);
                      setActiveMentor(null);
                    }}
                    className="group flex w-full max-w-[180px] flex-col items-center rounded-2xl bg-[#c4c0df] p-6 text-center shadow-md transition hover:bg-[#d2cfea] hover:shadow-lg"
                  >
                    <div className="h-32 w-32 rounded-full bg-white shadow-inner" />
                    <span className="mt-4 text-sm font-medium text-[#1f1c2e]">{`${m.name} 멘티`}</span>
                  </button>
                ))}

                {mentees.length === 0 && (
                  <div className="col-span-full py-24 text-center text-xl text-white/70">
                    아직 매칭을 수락한 멘티가 없습니다.
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-center text-white/70">
            프로필에서 역할을 설정하면 매칭 기능을 이용할 수 있습니다.
          </div>
        )}
      </div>

      {role === 'MENTEE' && (
        <button
          onClick={() => setShowAdd(true)}
          className="absolute bottom-6 right-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#b6b0d8] text-[#1f1c2e] shadow-lg transition hover:bg-[#c6c1e6]"
        >
          <span className="text-5xl font-semibold leading-none -translate-y-[3px]">
            +
          </span>
        </button>
      )}

      {role === 'MENTEE' && showAdd && (
        <div className="absolute inset-0 z-40 flex items-center justify-center rounded-2xl bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-gray-900">
            <h3 className="mb-4 text-lg font-semibold">멘토 추가</h3>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="멘토 아이디를 입력하세요."
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
                {isSubmitting ? '전송 중...' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}

      {role === 'MENTEE' && activeMentor && !cardOptionsDisabled && (
        <>
          <button
            onClick={() => setActiveMentor(null)}
            className="absolute inset-0 z-30 bg-black/20"
          />
          <div className="absolute left-6 top-6 z-40 w-64 rounded-2xl bg-white p-6 text-gray-900 shadow-xl">
            <div className="mb-4 text-lg font-semibold">{`${activeMentor.name} 멘토`}</div>
            <div className="grid gap-2">
              {showLearningCTA ? (
                <button
                  onClick={() => goLearningScreen(activeMentor)}
                  className="rounded-lg bg-gradient-to-r from-[#f9a8d4] via-[#f472b6] to-[#ec4899] px-4 py-2 text-sm text-white shadow-lg transition duration-200 hover:from-[#fdd8e6] hover:via-[#f9a8d4] hover:to-[#fbcfe8] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-inner"
                >
                  학습 시작
                </button>
              ) : (
                <>
                  <button
                    onClick={() => goReport('weekly', activeMentor, 'mentor')}
                    className="rounded-lg bg-[#fde2e4] px-4 py-2 text-sm text-[#7a3145] shadow-sm transition duration-200 hover:bg-[#fbcfe8] hover:-translate-y-0.5 hover:shadow-lg active:bg-[#f9a8d4] active:translate-y-0 active:shadow-inner"
                  >
                    주간 리포트
                  </button>
                  <button
                    onClick={() => goReport('study', activeMentor, 'mentor')}
                    className="rounded-lg bg-[#fde2e4] px-4 py-2 text-sm text-[#7a3145] shadow-sm transition duration-200 hover:bg-[#fbcfe8] hover:-translate-y-0.5 hover:shadow-lg active:bg-[#f9a8d4] active:translate-y-0 active:shadow-inner"
                  >
                    학습 리포트
                  </button>
                </>
              )}
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

      {role === 'MENTOR' && activeMentee && !cardOptionsDisabled && (
        <>
          <button
            onClick={() => setActiveMentee(null)}
            className="absolute inset-0 z-30 bg-black/20"
          />
          <div className="absolute left-6 top-6 z-40 w-64 rounded-2xl bg-white p-6 text-gray-900 shadow-xl">
            <div className="mb-4 text-lg font-semibold">{`${activeMentee.name} 멘티`}</div>
            <div className="grid gap-2">
              {showFeedbackCTA ? (
                <button
                  onClick={() => goFeedbackScreen(activeMentee)}
                  className="rounded-lg bg-gradient-to-r from-[#f9a8d4] via-[#f472b6] to-[#ec4899] px-4 py-2 text-sm text-white shadow-lg transition duration-200 hover:from-[#fdd8e6] hover:via-[#f9a8d4] hover:to-[#fbcfe8] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-inner"
                >
                  피드백 달기
                </button>
              ) : (
                <>
                  <button
                    onClick={() => goReport('weekly', activeMentee, 'mentee')}
                    className="rounded-lg bg-[#fde2e4] px-4 py-2 text-sm text-[#7a3145] shadow-sm transition duration-200 hover:bg-[#fbcfe8] hover:-translate-y-0.5 hover:shadow-lg active:bg-[#f9a8d4] active:translate-y-0 active:shadow-inner"
                  >
                    주간 리포트
                  </button>
                  <button
                    onClick={() => goReport('study', activeMentee, 'mentee')}
                    className="rounded-lg bg-[#fde2e4] px-4 py-2 text-sm text-[#7a3145] shadow-sm transition duration-200 hover:bg-[#fbcfe8] hover:-translate-y-0.5 hover:shadow-lg active:bg-[#f9a8d4] active:translate-y-0 active:shadow-inner"
                  >
                    학습 리포트
                  </button>
                </>
              )}
            </div>
            <button
              onClick={() => setActiveMentee(null)}
              className="mt-6 text-sm text-gray-500 underline"
            >
              닫기
            </button>
          </div>
        </>
      )}

      {role === 'MENTOR' && pendingMatches.length > 0 && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-8 text-gray-900 shadow-xl">
            <button
              onClick={() => setPendingMatches([])}
              className="absolute right-4 top-4 rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold text-gray-900">
              새로운 매칭 요청이 있습니다
            </h3>
            <div className="mt-6 max-h-48 space-y-4 overflow-y-auto pr-2 [scrollbar-width:thin]">
              {pendingMatches.map((match) => (
                <div
                  key={match.matchId}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
                >
                  <div className="text-sm font-medium">
                    {match.menteeName} 멘티
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespond(match, 'reject')}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-100 disabled:opacity-60"
                      disabled={processingMatchId === match.matchId}
                    >
                      거절
                    </button>
                    <button
                      onClick={() => handleRespond(match, 'accept')}
                      className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm text-white transition hover:bg-gray-800 disabled:opacity-60"
                      disabled={processingMatchId === match.matchId}
                    >
                      {processingMatchId === match.matchId
                        ? '처리 중...'
                        : '수락'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
