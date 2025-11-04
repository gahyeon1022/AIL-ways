import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { callAPIWithAuth } from "@/app/lib/api/http";
import MentoringCurrentClient, { MentorCard, PendingMatchCard } from "./MentoringCurrent.client";

type UserProfileDTO = {
  userId: string | null;
  userName: string | null;
  role: string | null;
};

type MentorInfoDTO = {
  userId: string;
  userName: string;
  matchId: string;
};

type MenteeInfoDTO = {
  userId: string;
  userName: string;
  matchId: string;
};

export const dynamic = "force-dynamic";

async function fetchProfile(): Promise<UserProfileDTO | null> {
  try {
    return await callAPIWithAuth<UserProfileDTO>("/api/users/me", { cache: "no-store" });
  } catch {
    return null;
  }
}

async function fetchMentorsForMentee(): Promise<MentorCard[]> {
  try {
    const mentors = await callAPIWithAuth<MentorInfoDTO[]>("/api/matches/myMentors", { cache: "no-store" });
    if (!Array.isArray(mentors)) return [];
    return mentors
      .filter(item => item && typeof item.userId === "string" && typeof item.userName === "string")
      .map(item => ({
        id: item.userId,
        name: item.userName,
        matchId: item.matchId,
      }));
  } catch {
    return [];
  }
}

async function fetchIncomingForMentor(): Promise<PendingMatchCard[]> {
  try {
    const mentees = await callAPIWithAuth<MenteeInfoDTO[]>("/api/matches/myMentees", { cache: "no-store" });
    if (!Array.isArray(mentees)) return [];
    return mentees
      .filter(item => item && typeof item.userId === "string" && typeof item.matchId === "string")
      .map(item => ({
        matchId: item.matchId,
        menteeId: item.userId,
        menteeName: item.userName ?? item.userId,
      }));
  } catch {
    return [];
  }
}

export default async function MentoringCurrent() {
  const jar = await cookies();
  if (!jar.get("AUTH_TOKEN")) redirect("/login");

  const profile = await fetchProfile();
  if (!profile) redirect("/login");

  const role = profile.role === "MENTOR" || profile.role === "MENTEE" ? profile.role : null;

  const [mentors, pending] = await Promise.all([
    role === "MENTEE" ? fetchMentorsForMentee() : Promise.resolve<MentorCard[]>([]),
    role === "MENTOR" ? fetchIncomingForMentor() : Promise.resolve<PendingMatchCard[]>([]),
  ]);

  return (
    <MentoringCurrentClient role={role} initialMentors={mentors} initialPendingMatches={pending} />
  );
}
