import "server-only"; // 클라이언트 번들로 새지 않도록 보호

export function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

// 자주 쓰는 값은 즉시 바인딩해 재사용(매 호출마다 lookup 안 함)
export const BE = env("BE_URL"); // Spring 백엔드 베이스 URL
