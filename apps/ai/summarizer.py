from openai import OpenAI
import os
from dotenv import load_dotenv

# ✅ .env 절대경로 지정
load_dotenv(dotenv_path="C:/AIL-ways/.env")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)



def summarize_study_log(study_text: str) -> str:
    """
    멘티의 학습 내용을 요약하는 함수.
    studyLogs에 담긴 학습 노트를 전달받아 핵심 내용만 간결하게 정리합니다.
    """
    if not study_text or not study_text.strip():
        return "요약할 학습 내용이 없습니다."

    #프롬프트 구성
    prompt = (
    "다음은 학생이 작성한 학습 노트입니다.\n"
    "내용을 분석하여 핵심 개념, 배운 점, 주요 키워드 중심으로 정리해줘.\n"
    "중복되거나 불필요한 문장은 제거하고, 한 문장으로 요약해.\n"
    "문체는 간결하고 보고서에 적합하게 만들어줘.\n\n"
    f"{study_text}"
    )

    # OpenAI API 호출
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "너는 학생의 학습 노트를 간결하고 명확하게 요약하는 AI야."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.5,
        max_tokens=250
    )

    summary = completion.choices[0].message.content.strip()
    return summary

if __name__ == "__main__":
    text = """
    오늘은 파이썬 객체지향 프로그래밍(OOP)에 대해 학습했다.
    클래스, 객체, 메서드, 상속의 개념을 배웠으며, 특히 오버라이딩과 super()의 사용법을 실습했다.
    또한 다형성의 개념을 이해하고, 코드 재사용성을 높이는 방법에 대해 배웠다.
    실습 중에는 상속 구조에서의 메서드 호출 순서와 MRO(Method Resolution Order)를 확인하는 방법을 익혔다.
    """
    print("요약 결과:")
    print(summarize_study_log(text))