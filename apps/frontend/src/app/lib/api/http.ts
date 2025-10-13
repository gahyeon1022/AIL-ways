// /app/lib/api/http.ts
import "server-only";
import { cookies } from "next/headers";
import { BE } from "@/app/lib/server/env"; 
import { BackendError, parseEnvelope, preview } from "./envelope";

/** 절대 URL은 패스스루, 상대 경로만 BE prefix */
function resolveURL(path: string) {
  return /^(https?:)?\/\//i.test(path) ? path : `${BE}${path}`;
}

function buildHeaders(init?: RequestInit): HeadersInit {
  const h = new Headers(init?.headers as HeadersInit);
  const method = (init?.method || "GET").toUpperCase();
  const hasBody = init?.body != null && method !== "GET" && method !== "HEAD";

  if (hasBody) {
    // 문자열 본문(JSON.stringify 사용 케이스가 대부분)일 때만 기본 Content-Type 지정
    if (typeof init!.body === "string" && !h.has("Content-Type")) {
      h.set("Content-Type", "application/json");
    }
  }
  return h;
}

/** 스프링/일반 JSON 에러에서 자주 쓰는 키로 메시지 추출(관용 처리) */
function extractErrorMessage(j: any): string | undefined {
  if (!j || typeof j !== "object") return;
  return (
    j.message ||
    j.error_description ||
    j.error ||
    j.detail ||
    (typeof j?.errors?.[0]?.defaultMessage === "string" && j.errors[0].defaultMessage) ||
    undefined
  );
}

/** 공용 호출(비인증) */
export async function callAPI<T>(path: string, init?: RequestInit): Promise<T> {
  const url = resolveURL(path);
  const res = await fetch(url, {
    cache: "no-store",
    ...init,
    headers: buildHeaders(init),
  });

  if (res.ok) return await parseEnvelope<T>(res);
  const contentType = res.headers.get("content-type") || "";
  const text = await res.text().catch(() => "");

  // JSON 추정이면 파싱 시도
  if (contentType.includes("application/json") || text.startsWith("{") || text.startsWith("[")) {
    try {
      const j = JSON.parse(text);

      // 백엔드가 Envelope를 사용했는데 HTTP는 !ok인 경우 → 수동 변환
      if (j && typeof j.success === "boolean") {
        const msg = typeof j.error === "string" ? j.error : j.error?.message || "요청 실패";
        const code = typeof j.error === "string" ? undefined : j.error?.code;
        throw new BackendError(res.status, msg, code);
      }

      // 스프링/기타 JSON 에러
      const msg = extractErrorMessage(j) || preview(text);
      throw new BackendError(res.status, msg);
    } catch {
      // JSON 파싱 자체 실패 → 텍스트 미리보기
      throw new BackendError(res.status, `요청 실패 - ${preview(text)}`);
    }
  }

  // 비JSON(HTML 등) → 짧은 미리보기로 반환
  throw new BackendError(res.status, `요청 실패 - ${preview(text)}`);
}

/** 보호 API(인증 필요). Authorization만 부여해 callAPI로 위임 */
export async function callAPIWithAuth<T>(path: string, init?: RequestInit): Promise<T> {
  const jar = await cookies(); // Next 15는 await 필요
  const token = jar.get("AUTH_TOKEN")?.value;
  if (!token) throw new BackendError(401, "인증 필요(로그인하세요)", "UNAUTHORIZED");

  return callAPI<T>(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
}
