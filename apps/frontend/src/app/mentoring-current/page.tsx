import MentoringBoard from "@/components/layout/MentoringCurrent";
// intent를 서버측에서 미리 넘겨주도록 함.
type PageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function MentoringCurrentPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : undefined;
  const rawIntent = params?.intent;
  const intent = Array.isArray(rawIntent) ? rawIntent[0] : rawIntent ?? null;

  return <MentoringBoard initialIntent={intent} />;
}
