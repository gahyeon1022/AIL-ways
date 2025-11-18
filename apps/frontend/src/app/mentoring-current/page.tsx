import MentoringBoard from "@/components/layout/MentoringCurrent";
import { requireAuthSession } from "@/app/lib/server/auth";

type PageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

function buildQueryString(params?: Record<string, string | string[] | undefined>) {
  if (!params) return "";
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(item => {
        if (typeof item === "string") qs.append(key, item);
      });
    } else if (typeof value === "string") {
      qs.set(key, value);
    }
  });
  const result = qs.toString();
  return result ? `?${result}` : "";
}

export default async function MentoringCurrentPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : undefined;
  const rawIntent = params?.intent;
  const intent = Array.isArray(rawIntent) ? rawIntent[0] : rawIntent ?? null;

  const currentPath = `/mentoring-current${buildQueryString(params)}`;
  await requireAuthSession(currentPath);

  return <MentoringBoard initialIntent={intent} />;
}
