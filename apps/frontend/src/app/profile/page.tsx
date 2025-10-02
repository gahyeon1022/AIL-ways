// 서버 컴포넌트: 불필요한 클라이언트 JS/상태 없음 → 가장 효율적

type ProfileVM = {
  email: string;
  userName: string;
  userId: string;
  role: string;
  interests: string[];
};

// [임시] 백엔드 연동 전 목데이터
async function getMyProfileMock(): Promise<ProfileVM> {
  return {
    email: "jskang@example.com",
    userName: "강지성",
    userId: "jskang",
    role: "mentor",
    interests: ["JAVA", "SPRING", "DB"],
  };
}

// 순수 표시 전용 → 레이아웃/스타일만 책임
function ProfileCard({ data }: { data: ProfileVM }) {
  const { email, userName, userId, role, interests } = data;

  return (
    <section
      className="
        w-[600px] 
        min-h-[600px]
        rounded-2xl border border-gray-200
        p-8
        flex flex-col
        bg-white
        overflow-hidden 
      "
    >
      <header className="flex items-baseline justify-between">
        <h2 className="text-xl font-semibold">내 정보</h2>
        <span className="text-sm text-gray-500">{userId}</span>
      </header>

      <div className="mt-6 grid grid-cols-[140px_1fr] items-start gap-y-4 gap-x-6 text-[15px]">
        <div className="text-gray-500">이름</div>
        <div className="font-medium">{userName}</div>

        <div className="text-gray-500">이메일</div>
        <div className="font-medium">{email}</div>

        <div className="text-gray-500">역할</div>
        <div className="font-medium">{role}</div>

        <div className="text-gray-500">흥미</div>
        <div className="flex flex-wrap gap-2">
          {interests.length === 0 ? (
            <span className="text-gray-400">등록된 흥미가 없습니다</span>
          ) : (
            interests.map((it) => (
              <span
                key={it}
                className="rounded-full border border-gray-200 px-2.5 py-1 text-sm"
              >
                {it}
              </span>
            ))
          )}
        </div>
      </div>
      <div className="mt-auto" />
    </section>
  );
}

export default async function ProfilePage() {
  const data = await getMyProfileMock();

  return (
    <main
      className="
        flex flex-col items-center justify-start
        pt-8 
      "
    >

      {/* 2) 본문 카드는 제목 아래 중앙 정렬. 화면은 bg-gray-100로 꽉 차 있어 흰 바탕 여백 없음 */}
      <div>
        <ProfileCard data={data} />
      </div>
    </main>
  );
}
