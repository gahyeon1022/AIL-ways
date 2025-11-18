// /app/profile/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { callAPIWithAuth } from "@/app/lib/api/http";

type ProfileDTO = {
  email: string | null;
  userName: string | null;
  userId: string | null;
  role: string | null;
  interests: string[] | null;
};

function formatRole(role: string | null) {
  if (!role) return "미설정";
  if (role === "MENTOR") return "멘토";
  if (role === "MENTEE") return "멘티";
  return role;
}

function formatInterests(interests: string[] | null) {
  if (!interests || interests.length === 0) return ["미설정"];
  return interests;
}

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const jar = await cookies();
  const authToken = jar.get("AUTH_TOKEN")?.value ?? null;
  const refreshToken = jar.get("REFRESH_TOKEN")?.value ?? null;
  if (!authToken) {
    if (refreshToken) {
      redirect(`/refresh-session?next=${encodeURIComponent("/profile")}`);
    }
    redirect("/login");
  }

  let profile: ProfileDTO | null = null;
  try {
    profile = await callAPIWithAuth<ProfileDTO>("/api/users/me");
  } catch {
    redirect("/login");
  }
  if (!profile) redirect("/login");

  const interests = formatInterests(profile.interests ?? null);

  return (
    <main className="mx-auto -mt-2 w-full max-w-3xl px-6">
      <section className="rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-gray-900">내 정보</h1>

        <dl className="mt-8 space-y-6 text-base text-gray-800">
          <div>
            <dt className="text-sm text-gray-500">이메일</dt>
            <dd className="mt-1 font-medium">{profile.email ?? "미설정"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">이름</dt>
            <dd className="mt-1 font-medium">{profile.userName ?? "미설정"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">아이디</dt>
            <dd className="mt-1 font-medium">{profile.userId ?? "미설정"}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">역할</dt>
            <dd className="mt-1 font-medium">{formatRole(profile.role ?? null)}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">관심 분야</dt>
            <dd className="mt-1 flex flex-wrap gap-2">
              {interests.map(item => (
                <span
                  key={item}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700"
                >
                  {item}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
