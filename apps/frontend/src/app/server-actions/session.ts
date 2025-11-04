'use server';
import { callAPIWithAuth } from '@/app/lib/api/http';

export type StartSessionRes = { sessionId: string };

// DTO
export type StudyLog = { content: string; timestamp: string };
export type QuestionLog = { question: string; createdAt: string };
export type DistractionEventReq = { activity: string; detectedAt: string };
export type SelfFeedback = { comment: string; createdAt: string };
export type DistractionLog = {
  activity: string;
  detectionType: string;
  selfFeedback?: SelfFeedback;
};

export type SessionRes = {
  sessionId: string;
  matchId: string;
  menteeUserId: string;
  mentorUserId: string;
  startedAt: string;
  endedAt?: string;
  status: 'ACTIVE' | 'ENDED' | string;
  distractionLogs: DistractionLog[];
  studyLogs: StudyLog[];
  questionLogs: QuestionLog[];
};

// 세션 전용 API 호출기
const callSessionAPI = <T,>(path: string, init?: RequestInit) =>
  callAPIWithAuth<T>(path, init);

// 1. 세션 시작 함수
export async function startSession(
  matchId: string,
  mentorUserId: string
): Promise<SessionRes> {
  const trimmedMatchId = matchId?.trim();
  const trimmedMentorId = mentorUserId?.trim();
  if (!trimmedMatchId) throw new Error('유효하지 않은 matchId');
  if (!trimmedMentorId) throw new Error('유효하지 않은 mentorUserId');

  const qs = new URLSearchParams({
    matchId: trimmedMatchId,
    mentorUserId: trimmedMentorId,
  }).toString();
  return callSessionAPI<SessionRes>(`/api/sessions/start?${qs}`, {
    method: 'POST',
  });
}

// 2. 학습 내용 입력(저장) 함수
export async function saveStudyLog(
  sessionId: string,
  content: string
): Promise<SessionRes | void> {
  if (!sessionId?.trim()) throw new Error('유효하지 않은 sessionId');
  if (!content?.trim()) throw new Error('학습 내용 필요');

  const qs = new URLSearchParams({ content }).toString();
  return callSessionAPI<SessionRes>(
    `/api/sessions/${encodeURIComponent(sessionId)}/studyLogs?${qs}`,
    { method: 'POST' }
  );
}

// 3. 질문 내용 추가 함수
export async function addQuestionLog(
  sessionId: string,
  question: string
): Promise<SessionRes | void> {
  if (!sessionId?.trim()) throw new Error('유효하지 않은 세션 ID');
  if (!question?.trim()) throw new Error('질문 내용(question)이 필요합니다.');

  const qs = new URLSearchParams({ question }).toString();
  return callSessionAPI<SessionRes>(
    `/api/sessions/${encodeURIComponent(sessionId)}/questionLogs?${qs}`,
    { method: 'POST' }
  );
}

// 4. 딴짓 로그 저장(기록) 함수
export async function addDistractionLog(
  sessionId: string,
  payload: DistractionEventReq
): Promise<SessionRes | void> {
  if (!sessionId?.trim()) throw new Error('유효하지 않은 세션 ID');
  if (!payload?.activity?.trim()) throw new Error('activity는 필수입니다.');
  if (!payload?.detectedAt?.trim()) throw new Error('detectedAt은 필수입니다.');

  return callSessionAPI<SessionRes>(
    `/api/sessions/${encodeURIComponent(sessionId)}/distractions`,
    {
      method: 'POST',
      body: JSON.stringify(payload), // ← JSON body
    }
  );
}

// 5. 멘티 자기 피드백 기록 함수
export async function submitSelfFeedback(
  sessionId: string,
  comment: string
): Promise<SessionRes | void> {
  if (!sessionId?.trim()) throw new Error('유효하지 않은 sessionId');
  if (!comment?.trim()) throw new Error('피드백(comment) 필요');

  const body = {
    comment,
    createdAt: new Date().toISOString(), // Swagger 예시에 createdAt 존재
  };
  return callSessionAPI<SessionRes>(
    `/api/sessions/${encodeURIComponent(sessionId)}/distractions/selfFeedback`,
    { method: 'POST', body: JSON.stringify(body) }
  );
}

// 6. 학습 재개
export async function resumeSession(
  sessionId: string
): Promise<SessionRes | void> {
  if (!sessionId?.trim()) throw new Error('유효하지 않은 세션 ID');
  return callSessionAPI<SessionRes>(
    `/api/sessions/${encodeURIComponent(sessionId)}/resume`,
    { method: 'POST' }
  );
}

// 7. 학습 종료
export async function endSession(
  sessionId: string
): Promise<SessionRes | void> {
  if (!sessionId?.trim()) throw new Error('유효하지 않은 세션 ID');
  return callSessionAPI<SessionRes>(
    `/api/sessions/${encodeURIComponent(sessionId)}/end`,
    { method: 'POST' }
  );
}
