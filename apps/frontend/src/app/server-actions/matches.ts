"use server";

import { callAPIWithAuth } from "@/app/lib/api/http";
import { BackendError } from "@/app/lib/api/envelope";

type MatchDTO = {
  matchId: string;
  mentorUserId: string;
  menteeUserId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
};

type ActionFailure = { ok: false; message: string; code?: string };
type ActionSuccess<T> = { ok: true; data: T };
export type ActionResult<T> = ActionSuccess<T> | ActionFailure;

const UNKNOWN_ERROR_MESSAGE = "요청 처리 중 문제가 발생했습니다.";
const GENERIC_NETWORK_ERRORS = new Set(["fetch failed", "network error"]);

function toActionFailure(err: unknown, fallback = UNKNOWN_ERROR_MESSAGE): ActionFailure {
  if (err instanceof BackendError) {
    if (err.status === 401) {
      return { ok: false, message: "인증이 필요합니다.", code: err.code };
    }
    const message = err.message?.trim() || fallback;
    return { ok: false, message, code: err.code };
  }
  if (err instanceof Error && err.message) {
    const message = err.message.trim();
    if (!message || GENERIC_NETWORK_ERRORS.has(message.toLowerCase())) {
      return { ok: false, message: fallback };
    }
    return { ok: false, message };
  }
  if (typeof err === "string" && err.trim()) {
    const trimmed = err.trim();
    if (GENERIC_NETWORK_ERRORS.has(trimmed.toLowerCase())) {
      return { ok: false, message: fallback };
    }
    return { ok: false, message: trimmed };
  }
  return { ok: false, message: fallback };
}

export type MentorInfoDTO = {
  userId: string;
  userName: string;
  matchId: string;
};

export type MenteeInfoDTO = {
  userId: string;
  userName: string;
  matchId: string;
};

export async function requestMatchAction(mentorUserId: string): Promise<ActionResult<MatchDTO>> {
  const trimmed = mentorUserId?.trim();
  if (!trimmed) {
    return { ok: false, message: "멘토 아이디가 필요합니다." };
  }

  try {
    const match = await callAPIWithAuth<MatchDTO>("/api/matches/request", {
      method: "POST",
      body: JSON.stringify({ mentorUserId: trimmed }),
    });
    return { ok: true, data: match };
  } catch (err) {
    return toActionFailure(err);
  }
}

export async function respondMatchAction(matchId: string, response: "accept" | "reject"): Promise<ActionResult<void>> {
  const trimmed = matchId?.trim();
  if (!trimmed) {
    return { ok: false, message: "matchId가 필요합니다." };
  }
  const path = `/api/matches/${encodeURIComponent(trimmed)}/${response}`;
  try {
    await callAPIWithAuth<void>(path, { method: "POST" });
    return { ok: true, data: undefined };
  } catch (err) {
    return toActionFailure(err);
  }
}

export async function fetchMentorsForMentee(): Promise<MentorInfoDTO[]> {
  try {
    return await callAPIWithAuth<MentorInfoDTO[]>("/api/matches/myMentors", { cache: "no-store" });
  } catch (e) {
    if (e instanceof BackendError && e.status === 403) {
      return [];
    }
    throw e;
  }
}

export type IncomingMatchDTO = {
  matchId: string;
  menteeId: string;
  menteeName: string;
};

export async function fetchIncomingMatchesForMentor(): Promise<IncomingMatchDTO[]> {
  try {
    const mentees = await callAPIWithAuth<MenteeInfoDTO[]>("/api/matches/received", { cache: "no-store" });
    return Array.isArray(mentees)
      ? mentees.map(item => ({
          matchId: item.matchId,
          menteeId: item.userId,
          menteeName: item.userName ?? item.userId,
        }))
      : [];
  } catch (e) {
    if (e instanceof BackendError && e.status === 403) {
      return [];
    }
    throw e;
  }
}

export async function fetchAcceptedMenteesForMentor(): Promise<MenteeInfoDTO[]> {
  try {
    return await callAPIWithAuth<MenteeInfoDTO[]>("/api/matches/myMentees", { cache: "no-store" });
  } catch (e) {
    if (e instanceof BackendError && e.status === 403) {
      return [];
    }
    throw e;
  }
}
