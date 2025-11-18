import { NextRequest, NextResponse } from "next/server";
import { callAPI } from "@/app/lib/api/http";

const ACCESS_TOKEN_MAX_AGE = 60 * 60;
const DEFAULT_RETURN = "/login";

type TokenRefreshDTO = {
  accessToken: string;
  refreshToken?: string;
  refreshTokenExpiresIn?: number;
};

function resolveNextPath(req: NextRequest) {
  const nextParam = req.nextUrl.searchParams.get("next");
  if (!nextParam) return DEFAULT_RETURN;
  if (!nextParam.startsWith("/")) return DEFAULT_RETURN;
  return nextParam;
}

export async function GET(req: NextRequest) {
  const refreshToken = req.cookies.get("REFRESH_TOKEN")?.value;
  const nextPath = resolveNextPath(req);
  const nextUrl = new URL(nextPath, req.nextUrl.origin);

  if (!refreshToken) {
    const res = NextResponse.redirect(new URL(DEFAULT_RETURN, req.nextUrl.origin));
    res.cookies.delete("AUTH_TOKEN");
    res.cookies.delete("REFRESH_TOKEN");
    return res;
  }

  try {
    const data = await callAPI<TokenRefreshDTO>("/api/auth/token/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
    if (!data?.accessToken) {
      throw new Error("토큰 재발급 실패");
    }

    const res = NextResponse.redirect(nextUrl);
    res.cookies.set({
      name: "AUTH_TOKEN",
      value: data.accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });
    if (data.refreshToken) {
      const refreshMaxAge =
        typeof data.refreshTokenExpiresIn === "number" && data.refreshTokenExpiresIn > 0
          ? data.refreshTokenExpiresIn
          : 60 * 60 * 24 * 7;
      res.cookies.set({
        name: "REFRESH_TOKEN",
        value: data.refreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: refreshMaxAge,
      });
    }
    return res;
  } catch {
    const res = NextResponse.redirect(new URL(DEFAULT_RETURN, req.nextUrl.origin));
    res.cookies.delete("AUTH_TOKEN");
    res.cookies.delete("REFRESH_TOKEN");
    return res;
  }
}
