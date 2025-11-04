"use server";

import { callAPIWithAuth } from "@/app/lib/api/http";
import { BackendError } from "@/app/lib/api/envelope";

type MatchDTO = {
  matchId: string;
  mentorUserId: string;
  menteeUserId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
};

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

export async function requestMatchAction(mentorUserId: string): Promise<MatchDTO> {
  if (!mentorUserId?.trim()) throw new Error("멘토 아이디가 필요합니다.");
  return callAPIWithAuth<MatchDTO>("/api/matches/request", {
    method: "POST",
    body: JSON.stringify({ mentorUserId }),
  });
}

export async function respondMatchAction(matchId: string, response: "accept" | "reject"): Promise<void> {
  if (!matchId) throw new Error("matchId가 필요합니다.");
  const path = `/api/matches/${encodeURIComponent(matchId)}/${response}`;
  await callAPIWithAuth<void>(path, { method: "POST" });
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
