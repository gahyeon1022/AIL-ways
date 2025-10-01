
import QnaUI from "@/components/ui/Qna"; // tsconfig에 baseUrl=src, paths가 잡혀있다는 가정
// 만약 경로 alias가 없다면: import QnaUI from "../../components/QnaUI";

export default function Page() {
  return <QnaUI />;
}
