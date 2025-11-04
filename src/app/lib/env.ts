import 'server-only'; // ← 클라이언트 번들에 포함되지 않게 보호

export function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

// 자주 쓰는 값은 즉시 바인딩해 재사용
export const BE = env('BE_URL'); // Spring 백엔드 베이스 URL
