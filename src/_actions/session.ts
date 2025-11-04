'use server';
import { BE } from '@/app/lib/env';
import { cookies } from 'next/headers';

type ApiEnvelope<T = unknown> = {
  success: boolean;
  data?: T;
  error?: { code?: string; message?: string } | string | null;
};

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
async function callSessionAPI<T>(
  path: string,
  init?: RequestInit
): Promise<{ data: T }> {
  const jar = await cookies();
  const token = jar.get('AUTH_TOKEN')?.value;
  if (!token) throw new Error('인증 필요(로그인하세요)');

  const res = await fetch(`${BE}${path}`, {
    cache: 'no-store',
    headers: {
      // 기본 헤더 → Authorization → 호출부 헤더(최종 우선)
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  // HTTP 에러 우선 처리
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    try {
      const j = JSON.parse(text) as ApiEnvelope;
      const msg =
        typeof j.error === 'string' ? j.error : j.error?.message ?? '요청 실패';
      throw new Error(`[${res.status}] ${msg}`);
    } catch {
      const preview = text ? ` - ${text.slice(0, 120)}` : '';
      throw new Error(`[${res.status}] 요청 실패${preview}`);
    }
  }

  // 204 안전망
  if (res.status === 204) {
    return { data: undefined as T };
  }

  // 규약 파싱 및 검증
  const json = (await res.json()) as ApiEnvelope<T>;
  if (!json || typeof json.success !== 'boolean') {
    throw new Error(`[${res.status}] 서버 응답 형식 오류`);
  }
  if (!json.success) {
    const msg =
      typeof json.error === 'string'
        ? json.error
        : json.error?.message ?? '오류';
    throw new Error(`[${res.status}] ${msg}`);
  }

  return { data: json.data as T };
}

// -서버 액션 함수-
// 1. 세션 시작 함수
export async function startSession(): Promise<SessionRes> {
  const { data } = await callSessionAPI<SessionRes>(`/api/sessions/start`, {
    method: 'POST',
  });
  return data;
}

// 2. 학습 내용 입력(저장) 함수
export async function saveStudyLog(
  sessionId: string,
  content: string
): Promise<SessionRes | void> {
  if (!sessionId?.trim()) throw new Error('유효하지 않은 sessionId');
  if (!content?.trim()) throw new Error('학습 내용 필요');

  const qs = new URLSearchParams({ content }).toString();
  const { data } = await callSessionAPI<SessionRes>(
    `/api/sessions/${encodeURIComponent(sessionId)}/studyLogs?${qs}`,
    { method: 'POST' }
  );
  return data;
}

// 3. 질문 내용 추가 함수
export async function addQuestionLog(
  sessionId: string,
  question: string
): Promise<SessionRes | void> {
  if (!sessionId?.trim()) throw new Error('유효하지 않은 세션 ID');
  if (!question?.trim()) throw new Error('질문 내용(question)이 필요합니다.');

  const qs = new URLSearchParams({ question }).toString();
  const { data } = await callSessionAPI<SessionRes>(
    `/api/sessions/${encodeURIComponent(sessionId)}/questionLogs?${qs}`,
    { method: 'POST' }
  );
  return data;
}

// 4. 딴짓 로그 저장(기록) 함수
export async function addDistractionLog(
  sessionId: string,
  payload: DistractionEventReq
): Promise<SessionRes | void> {
  if (!sessionId?.trim()) throw new Error('유효하지 않은 세션 ID');
  if (!payload?.activity?.trim()) throw new Error('activity는 필수입니다.');
  if (!payload?.detectedAt?.trim()) throw new Error('detectedAt은 필수입니다.');

  const { data } = await callSessionAPI<SessionRes>(
    `/api/sessions/${encodeURIComponent(sessionId)}/distractions`,
    {
      method: 'POST',
      body: JSON.stringify(payload), // ← JSON body
    }
  );
  return data;
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
  const { data } = await callSessionAPI<SessionRes>(
    `/api/sessions/${encodeURIComponent(sessionId)}/distractions/selfFeedback`,
    { method: 'POST', body: JSON.stringify(body) }
  );
  return data;
}

// 6. 학습 재개
export async function resumeSession(
  sessionId: string
): Promise<SessionRes | void> {
  if (!sessionId?.trim()) throw new Error('유효하지 않은 세션 ID');
  const { data } = await callSessionAPI<SessionRes>(
    `/api/sessions/${encodeURIComponent(sessionId)}/resume`,
    { method: 'POST' }
  );
  return data;
}

// 7. 학습 종료
export async function endSession(
  sessionId: string
): Promise<SessionRes | void> {
  if (!sessionId?.trim()) throw new Error('유효하지 않은 세션 ID');
  const { data } = await callSessionAPI<SessionRes>(
    `/api/sessions/${encodeURIComponent(sessionId)}/end`,
    { method: 'POST' }
  );
  return data;
}
