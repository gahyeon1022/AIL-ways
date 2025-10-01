"use client";

import { useEffect, useState } from "react";

export default function SelectAfterLogin() {
    const [open, setOpen] = useState(false);
    const [role, setRole] = useState<'mentor' | 'mentee' | null>(null);
    const [interests, setInterests] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const interestOptions = ['Python', 'C++', 'JAVA', 'React'];

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        if (token) {
            localStorage.setItem("accessToken", token);
            // 토큰 저장 후 URL 깨끗하게 (옵션)
            window.history.replaceState({}, document.title, "/select");
        }

        const hasSeenModal = localStorage.getItem("welcomeModalSeen");
        if (!hasSeenModal) {
            setOpen(true);
            localStorage.setItem("welcomeModalSeen", "true");
        }
    }, []);

    const toggleInterest = (t: string) =>
      setInterests(prev => (prev.includes(t) ? prev.filter(i => i !== t) : [...prev, t]));
    
    const handleSave = async () => {
      if (!role) return;
      setLoading(true);

      try {
        const payload = {
          role,
          interests,
        };

    const res = await fetch("api/user/profile", { //실제 url로 수정해주세요.
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // 세션,쿠키 인증 쓴다면 필요
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("서버 저장 실패");
    }
        alert("역할/관심분야 저장 완료!");
        setOpen(false);
      } catch (err: any) {
        alert(err.message ?? "에러가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="relative">
      <h1 className="text-2xl font-bold">로그인 후 첫 화면</h1>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-[520px] p-8">
            <div className="bg-gray-100 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-center mb-8">역할 선택</h2>

    <div className="flex items-center justify-around mb-12">
      <button
        type="button"
        onClick={() => setRole('mentor')}
        className="flex items-center gap-2"
      >
        <span
          className={`h-5 w-5 rounded-full border-2 ${
            role === 'mentor' ? 'border-red-500 ring-2 ring-red-500/40' : 'border-gray-400'
          }`}
        />
        <span className="text-lg">멘토</span>
      </button>

      <button
        type="button"
        onClick={() => setRole('mentee')}
        className="flex items-center gap-2"
      >
        <span
          className={`h-5 w-5 rounded-full border-2 ${
            role === 'mentee' ? 'border-red-500 ring-2 ring-red-500/40' : 'border-gray-400'
          }`}
        />
        <span className="text-lg">멘티</span>
      </button>
    </div>

    <h3 className="text-2xl font-semibold text-center mb-6">관심 분야</h3>

    <div className="grid grid-cols-2 gap-4 mb-10">
      {interestOptions.map(item => {
        const active = interests.includes(item);
        return (
          <button
            key={item}
            type="button"
            onClick={() => toggleInterest(item)}
            className={`px-5 py-2 rounded-full shadow font-semibold ${
              active ? 'bg-black text-white' : 'bg-white text-black'
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
        disabled={!role || loading} 
        className="w-full py-3 rounded-xl bg-gray-900 text-white disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "저장 중..." : "저장하고 시작하기"} 
      </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
