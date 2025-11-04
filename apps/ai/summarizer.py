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
