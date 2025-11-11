# apps/ai/weekly_report_summarizer.py
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

def summarize_weekly_report(data: dict) -> dict:
    """
    주간 학습 리포트 요약 함수
    data 예시:
    {
        "study_hours": {"월": 3, "화": 4, "수": 5, "목": 2, "금": 6, "토": 1, "일": 3},
        "focus_me": 85,
        "focus_avg": 75,
        "total_hours": 24
    }
    """

    prompt = f"""
    아래는 사용자의 주간 학습 데이터입니다:
    - 요일별 학습 시간: {data["study_hours"]}
    - 총 학습 시간: {data["total_hours"]}시간
    - 나의 집중도: {data["focus_me"]}%
    - 또래 평균 집중도: {data["focus_avg"]}%

    이 데이터를 바탕으로 아래 형식으로 작성하세요:
    1. 학습 패턴 요약 (2줄)
    2. 개선 제안 (1줄)

    출력은 JSON 형식으로 반환:
    {{
        "summary": "이번 주에는 ~",
        "suggestion": "다음 주에는 ~"
    }}
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )

    text = response.choices[0].message.content.strip()
    return {"ai_summary": text}

if __name__ == "__main__":
    sample_data = {
        "study_hours": {"월": 3, "화": 4, "수": 5, "목": 2, "금": 6, "토": 1, "일": 3},
        "focus_me": 85,
        "focus_avg": 75,
        "total_hours": 24
    }

    result = summarize_weekly_report(sample_data)
    print(result)

