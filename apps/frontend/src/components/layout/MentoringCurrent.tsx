"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Mentor = { id: string; name: string; avatar?: string };

export default function MentoringCurrent() {
  const router = useRouter();
  const [mentors, setMentors] = useState<Mentor[]>([
    { id: "m1", name: "하승준 멘토" },
    { id: "m2", name: "강아영 멘토" },
  ]);

  const [showAdd, setShowAdd] = useState(false);
  const [code, setCode] = useState("");
  const [activeMentor, setActiveMentor] = useState<Mentor | null>(null);

  // 새로고침 유지용
  useEffect(() => {
    const saved = localStorage.getItem("mentors");
    if (saved) setMentors(JSON.parse(saved));
  }, []);
  useEffect(() => {
    localStorage.setItem("mentors", JSON.stringify(mentors));
  }, [mentors]);

  const handleAdd = () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    // 실제로는 코드 검증 API 호출해서 멘토 정보 받아온 뒤 setMentors 하면 됨
    const newMentor: Mentor = {
      id: `m-${Date.now()}`,
      name: `${trimmed} 멘토`,
    };
    setMentors((prev) => [...prev, newMentor]);
    setCode("");
    setShowAdd(false);
  };

  const goReport = (type: "weekly" | "study") => {
    if (!activeMentor) return;
    // 라우팅 경로
    router.push(`/reports/${type}?mentor=${activeMentor.id}`);
  };

  return (
    <div className="relative rounded-2xl bg-[#3a3a3a] p-8 min-h-[520px]">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-7 place-items-center">
        {mentors.map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveMentor(m)}
            className="group flex flex-col items-center"
          >
            <div className="w-40 h-40 rounded-full bg-gray-400 shadow-inner" />
            <span className="mt-4 px-4 py-2 rounded-full bg-gray-200 text-sm">
              {m.name}
            </span>
          </button>
        ))}
      </div>

      {/* +플로팅 버튼 */}
      <button
        onClick={() => setShowAdd(true)}
        className="absolute bottom-6 right-6 w-20 h-20 rounded-full bg-[#c9d5f4] shadow-lg text-5xl"
      >
        +
      </button>

      {/* 멘토 추가 모달 */}
      {showAdd && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">멘토 추가</h3>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="코드를 입력해 주세요"
              className="mb-4 w-full rounded-lg border p-3"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAdd(false)}
                className="rounded-lg border px-3 py-2"
              >
                취소
              </button>
              <button
                onClick={handleAdd}
                className="rounded-lg bg-black px-3 py-2 text-white"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 멘토 사진 클릭 시 좌측 패널 */}
      {activeMentor && (
        <>
          <button
            onClick={() => setActiveMentor(null)}
            className="absolute inset-0 z-10 bg-transparent"
          />
          <div className="absolute left-0 top-0 z-40 h-full w-64 rounded-r-2xl bg-white p-5 shadow-xl">
            <div className="mb-4 font-semibold">{activeMentor.name}</div>
            <div className="grid gap-2">
              <button
                onClick={() => goReport("weekly")}
                className="rounded-lg bg-gray-900 px-4 py-3 text-white"
              >
                주간 리포트
              </button>
              <button
                onClick={() => goReport("study")}
                className="rounded-lg bg-gray-100 px-4 py-3"
              >
                학습 리포트
              </button>
            </div>
            <button
              onClick={() => setActiveMentor(null)}
              className="mt-6 text-sm text-gray-500 underline"
            >
              닫기
            </button>
          </div>
        </>
      )}
    </div>
  );
}
