// /app/lib/api/envelope.ts
import "server-only";

export type ApiEnvelope<T = unknown> = {
  success: boolean;
  data?: T;
  error?: { code?: string; message?: string } | string | null;
};

export class BackendError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
    this.name = "BackendError";
  }
}

export function preview(text: string, max = 160) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export async function parseEnvelope<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as unknown as T;

  const raw = await res.text().catch(() => "");
  let json: any;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new BackendError(res.status, "서버 응답 형식 오류(Envelope 아님)", "INVALID_ENVELOPE");
  }

  if (!json || typeof json.success !== "boolean") {
    throw new BackendError(res.status, "서버 응답 형식 오류(Envelope 아님)", "INVALID_ENVELOPE");
  }

  if (!json.success) {
    const message = typeof json.error === "string" ? json.error : json.error?.message || "요청 실패";
    const code = typeof json.error === "string" ? undefined : json.error?.code;
    throw new BackendError(res.status, message, code);
  }
  return json.data as T;
}
