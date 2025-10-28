// /app/select/SelectAfterLogin.client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveRoleAndInterestsAction } from "@/app/server-actions/select";

export default function SelectAfterLogin({
  roleOptions,
  interestOptions,
  initialRole,
  initialInterests,
  loadError,   // SSR에서 내려주는 옵션 로딩 에러(선택)
}: {
  roleOptions: string[];
  interestOptions: string[];
  initialRole: string | null;
  initialInterests: string[];
  loadError?: string | null;
}) {
  const router = useRouter();

  // 서버에서 받은 초기값으로 상태 최소화(불필요한 이펙트 없음)
  const [role, setRole] = useState<string | null>(initialRole ?? null);
  const [interests, setInterests] = useState<string[]>(initialInterests ?? []);
  const [loading, setLoading] = useState(false);

  const toggleInterest = (t: string) =>
    setInterests(prev => (prev.includes(t) ? prev.filter(i => i !== t) : [...prev, t]));

  const canSubmit = !!role && interests.length > 0 && !loading;

  // 역할 라벨 매핑(백엔드 enum → 한글 라벨). 새로운 enum 등장 시 원문 그대로 노출.
  const roleLabel = (r: string) => (r === "MENTOR" ? "멘토" : r === "MENTEE" ? "멘티" : r);

  const handleSave = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await saveRoleAndInterestsAction({
        role,
        interests, // 서버액션에서 빈 배열은 null로 정규화해 PATCH 전송
      });
      router.replace("/home");
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
            {loadError && (
              <div className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                옵션 로딩 오류: {loadError}
              </div>
            )}

            <h2 className="mb-8 text-center text-2xl font-semibold">역할 선택</h2>

            {/* 역할 선택: 서버 enum 기반 동적 렌더 */}
            {roleOptions.length === 0 ? (
              <div className="mb-12 rounded-xl border border-dashed p-4 text-center text-sm text-gray-600">
                역할 옵션이 없습니다. 관리자에게 문의해 주세요.
              </div>
            ) : (
              <div className="mb-12 flex items-center justify-around">
                {roleOptions.map(r => {
                  const active = role === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className="flex items-center gap-2"
                    >
                      <span
                        className={`h-5 w-5 rounded-full border-2 ${
                          active ? "border-red-500 ring-2 ring-red-500/40" : "border-gray-400"
                        }`}
                      />
                      <span className="text-lg">{roleLabel(r)}</span>
                    </button>
                  );
                })}
              </div>
            )}

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
