// /app/lib/api/http.ts
// 공통 http 클라이언트. 
// 기본 URL결합, Authorization 헤더 부여, 요청 헤더 붙이기 담당.
import "server-only";
import { cookies } from "next/headers";
import { BE } from "@/app/lib/server/env";
import {
  BackendError,
  ensureEnvelope,
  extractEnvelopeError,
  parseEnvelopeBody,
  preview,
} from "./envelope";

/** 절대 URL은 패스스루, 상대 경로만 백엔드 prefix */
function resolveURL(path: string): string {
  return /^(https?:)?\/\//i.test(path) ? path : `${BE}${path}`;
}

//요청 메서드와 본문을 살펴 JSON 요청인지 판단
function shouldAttachJsonContentType(method: string, body: BodyInit | null | undefined) {
  if (!body) return false;
  if (method === "GET" || method === "HEAD") return false;
  return typeof body === "string";
}

//위의 두개의 헬퍼를 통해 최종 요청 구성
function prepareRequest(path: string, init?: RequestInit, token?: string) {
  const method = (init?.method || "GET").toUpperCase();
  const headers = new Headers(init?.headers);

  if (shouldAttachJsonContentType(method, init?.body) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return {
    url: resolveURL(path),
    init: {
      cache: "no-store",
      ...init,
      method,
      headers,
    } satisfies RequestInit,
  };
}

//스프링 표준 오류 형식을 비롯해 의미있는 에러 메시지 찾아냄
function extractErrorMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return;
  const record = payload as Record<string, unknown>;

  if (typeof record.message === "string") return record.message;
  if (typeof record.error_description === "string") return record.error_description;
  if (typeof record.error === "string") return record.error as string;
  if (typeof record.detail === "string") return record.detail as string;

  const errors = record.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    const first = errors[0];
    if (first && typeof first === "object" && typeof (first as { defaultMessage?: unknown }).defaultMessage === "string") {
      return (first as { defaultMessage: string }).defaultMessage;
    }
  }
  return undefined;
}

//http상태가 실패일때 응답본문 분석해 BackendError 만듬.
function buildErrorFromBody(res: Response, raw: string): BackendError {
  const contentType = res.headers.get("content-type") || "";
  const looksJson = contentType.includes("application/json") || raw.startsWith("{") || raw.startsWith("[");

  if (looksJson) {
    try {
      const parsed = raw ? JSON.parse(raw) : {};

      try {
        ensureEnvelope<unknown>(parsed);
        const { message, code } = extractEnvelopeError(parsed.error);
        return new BackendError(res.status, message, code, parsed);
      } catch {
        const message = extractErrorMessage(parsed) || preview(raw);
        return new BackendError(res.status, message, undefined, parsed);
      }
    } catch {
      // fall-through to text fallback
    }
  }

  return new BackendError(res.status, `요청 실패 - ${preview(raw)}`, undefined, raw);
}

//fetch 결과를 받아 성공이면 데이터를 꺼내고 실패면 예외 던짐
async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as unknown as T;

  const raw = await res.text().catch(() => "");

  if (res.ok) {
    return parseEnvelopeBody<T>(raw, res.status);
  }

  throw buildErrorFromBody(res, raw);
}

//prepareRequest -> fetch -> handleResponse 흐름을 실행하는 공통 함수
async function request<T>(path: string, init?: RequestInit, token?: string): Promise<T> {
  const { url, init: prepared } = prepareRequest(path, init, token);
  const res = await fetch(url, prepared);
  return handleResponse<T>(res);
}

/** 공용 호출(인증 필요없는) */
export function callAPI<T>(path: string, init?: RequestInit): Promise<T> {
  return request<T>(path, init);
}

/** 보호 API(인증 필요). Authorization만 부여해 callAPI로 위임 */
type AuthTokenBundle = {
  accessToken: string;
  refreshToken?: string;
  refreshTokenExpiresIn?: number;
};

const ACCESS_COOKIE_MAX_AGE = 60 * 60; // 1시간

function persistAccessCookie(jar: ReturnType<typeof cookies>, token: string) {
  jar.set({
    name: "AUTH_TOKEN",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_COOKIE_MAX_AGE,
  });
}

function persistRefreshCookie(
  jar: ReturnType<typeof cookies>,
  refreshToken: string,
  refreshTokenExpiresIn?: number
) {
  const maxAge =
    typeof refreshTokenExpiresIn === "number" && refreshTokenExpiresIn > 0
      ? refreshTokenExpiresIn
      : 60 * 60 * 24 * 7;

  jar.set({
    name: "REFRESH_TOKEN",
    value: refreshToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

async function refreshAuthToken(jar: ReturnType<typeof cookies>): Promise<string | null> {
  const refreshToken = jar.get("REFRESH_TOKEN")?.value;
  if (!refreshToken) {
    return null;
  }

  try {
    const data = await callAPI<AuthTokenBundle>("/api/auth/token/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
    if (!data?.accessToken) {
      throw new BackendError(500, "토큰 재발급 실패");
    }
    persistAccessCookie(jar, data.accessToken);
    if (data.refreshToken) {
      persistRefreshCookie(jar, data.refreshToken, data.refreshTokenExpiresIn);
    }
    return data.accessToken;
  } catch {
    jar.delete("AUTH_TOKEN");
    jar.delete("REFRESH_TOKEN");
    return null;
  }
}

export async function callAPIWithAuth<T>(path: string, init?: RequestInit): Promise<T> {
  const jar = await cookies(); //
  let token = jar.get("AUTH_TOKEN")?.value;

  if (!token) {
    token = await refreshAuthToken(jar);
  }

  if (!token) {
    throw new BackendError(401, "인증 필요(로그인하세요)", "UNAUTHORIZED");
  }

  try {
    return await request<T>(path, init, token);
  } catch (err) {
    if (err instanceof BackendError && err.status === 401) {
      const refreshed = await refreshAuthToken(jar);
      if (refreshed) {
        return request<T>(path, init, refreshed);
      }
    }
    throw err;
  }
}
