"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveRoleAndInterestsAction } from "@/app/server-actions/select";

type Role = "mentor" | "mentee";

export default function SelectAfterLogin({
  interestOptions,
  initialRole,
  initialInterests,
}: {
  interestOptions: string[];
  initialRole: string | null;
  initialInterests: string[];
}) {
  const router = useRouter();

  // 서버에서 내려준 값을 기본값으로 사용 (역할은 사용자가 선택해야 저장됨)
  const [role, setRole] = useState<Role | null>(
    initialRole === "mentor" || initialRole === "mentee" ? (initialRole as Role) : null
  );
  const [interests, setInterests] = useState<string[]>(initialInterests ?? []);
  const [loading, setLoading] = useState(false);

  const toggleInterest = (t: string) =>
    setInterests(prev => (prev.includes(t) ? prev.filter(i => i !== t) : [...prev, t]));

  const canSubmit = !!role && interests.length > 0 && !loading;

  const handleSave = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await saveRoleAndInterestsAction({
        role,
        interests, // string[] 로 전송(빈 배열일 경우 서버액션에서 null로 정규화)
      });
      router.replace("/home"); // 저장 성공 후 홈으로 이동
    } catch (e: any) {
      alert(e?.message ?? "저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] w-full">
      <div className="mx-auto mt-24 flex max-w-[720px] justify-center">
        <div className="w-[520px] rounded-2xl bg-white p-8 shadow-xl">
          <div className="rounded-2xl bg-gray-100 p-8">
            <h1 className="mb-2 text-center text-2xl font-bold">로그인 후 첫 화면</h1>

            <h2 className="mb-8 text-center text-2xl font-semibold">역할 선택</h2>
            <div className="mb-12 flex items-center justify-around">
              <button type="button" onClick={() => setRole("mentor")} className="flex items-center gap-2">
                <span
                  className={`h-5 w-5 rounded-full border-2 ${
                    role === "mentor" ? "border-red-500 ring-2 ring-red-500/40" : "border-gray-400"
                  }`}
                />
                <span className="text-lg">멘토</span>
              </button>

              <button type="button" onClick={() => setRole("mentee")} className="flex items-center gap-2">
                <span
                  className={`h-5 w-5 rounded-full border-2 ${
                    role === "mentee" ? "border-red-500 ring-2 ring-red-500/40" : "border-gray-400"
                  }`}
                />
                <span className="text-lg">멘티</span>
              </button>
            </div>

            <h3 className="mb-6 text-center text-2xl font-semibold">관심 분야</h3>
            <div className="mb-10 grid grid-cols-2 gap-4">
              {interestOptions.length === 0 && (
                <div className="col-span-2 rounded-xl border border-dashed p-5 text-center text-sm text-gray-500">
                  흥미 옵션을 불러오지 못했습니다. 나중에 마이페이지에서 수정할 수 있어요.
                </div>
              )}

              {interestOptions.map(item => {
                const active = interests.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleInterest(item)}
                    className={`rounded-full px-5 py-2 font-semibold shadow ${
                      active ? "bg-black text-white" : "bg-white text-black"
                    }`}
                  >
                    # {item}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={!canSubmit}
              className="w-full rounded-xl bg-gray-900 py-3 text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "저장 중..." : "저장하고 시작하기"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
