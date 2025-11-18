import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function requireAuthSession(currentPath: string) {
  const jar = await cookies();
  const authToken = jar.get("AUTH_TOKEN")?.value ?? null;
  if (authToken) {
    return;
  }
  const refreshToken = jar.get("REFRESH_TOKEN")?.value ?? null;
  if (refreshToken) {
    redirect(`/refresh-session?next=${encodeURIComponent(currentPath)}`);
  }
  redirect("/login");
}
