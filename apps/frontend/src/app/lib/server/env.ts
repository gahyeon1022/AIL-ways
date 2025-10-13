// /app/lib/server/env.ts
import "server-only"; // 넥스트 서버 전용

function must(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const BE = must("BE_URL");                           // Spring Boot 백엔드 베이스
export const ADMIN_BE = process.env.ADMIN_BE_URL || BE;     
export const isProd = process.env.NODE_ENV === "production";
