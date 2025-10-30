// /app/lib/api/envelope.ts 백엔드 응답 규약에 맞도록 응답을 해석하는 파일.
import "server-only";

export type ApiEnvelope<T = unknown> = {
  success: boolean;
  data?: T;
  error?: EnvelopeErrorPayload;
};

export type EnvelopeErrorPayload = { code?: string; message?: string } | string | null | undefined;

//백엔드 호출 실패를 표현
export class BackendError extends Error { 
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public payload?: unknown
  ) {
    super(message);
    this.name = "BackendError";
  }
}

//에러 전문을 볼때 간단히 미리보기용
export function preview(text: string, max = 160): string { 
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

//넘어온 JSON이 규약에 맞는 형태인지 검사
export function ensureEnvelope<T>(input: unknown): asserts input is ApiEnvelope<T> {
  if (
    !input ||
    typeof input !== "object" ||
    typeof (input as { success?: unknown }).success !== "boolean"
  ) {
    throw new Error("INVALID_ENVELOPE_SHAPE");
  }
}

//에러 메시지가 문자열인지 객체인지 추출
export function extractEnvelopeError(error: EnvelopeErrorPayload): { message: string; code?: string } {
  if (typeof error === "string") {
    return { message: error, code: undefined };
  }
  if (error && typeof error === "object") {
    return {
      message: error.message || "요청 실패",
      code: error.code,
    };
  }
  return { message: "요청 실패", code: undefined };
}

 //응답 본문을 JSON으로 바꾸고 규약에 맞으면 data 반환, 아니면 에러 던짐
export function parseEnvelopeBody<T>(raw: string, status: number): T {
  if (!raw && status === 204) return undefined as unknown as T;

  let parsed: unknown;
  try {
    parsed = raw ? JSON.parse(raw) : {};
  } catch {
    throw new BackendError(status, "서버 응답 형식 오류(Envelope 아님)", "INVALID_ENVELOPE", raw);
  }

  try {
    ensureEnvelope<T>(parsed);
  } catch {
    throw new BackendError(status, "서버 응답 형식 오류(Envelope 아님)", "INVALID_ENVELOPE", parsed);
  }

  const envelope = parsed as ApiEnvelope<T>;

  if (!envelope.success) {
    const { message, code } = extractEnvelopeError(envelope.error);
    throw new BackendError(status, message, code, envelope);
  }

  return envelope.data as T;
}

export async function parseEnvelopeResponse<T>(res: Response): Promise<T> {
  const raw = await res.text().catch(() => "");
  return parseEnvelopeBody<T>(raw, res.status);
}
