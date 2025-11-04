# apps/ai/distraction_summarizer.py
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

def summarize_distraction(logs: list[dict]) -> str:
    """
    딴짓 감지 로그 요약 함수.
    감지 데이터는 딴짓 감지 서버(server.py)에서 수집된 결과를 기반으로 함.
    logs 예시:
    [
        {"time": "03:00", "type": "no_face"},
        {"time": "07:20", "type": "phone_detected"},
        {"time": "12:10", "type": "sleepy"}
    ]

    time: 카메라 세션 시작 기준 경과 시간(mm:ss)
    type: 감지된 딴짓 이벤트 종류
    """
    if not logs:
        return "딴짓 감지 없음. 학습 내내 집중을 유지했습니다."

    total = len(logs)

    
    # type별 한글 해석
    event_names = {
        "phone_detected": "휴대폰 사용",
        "no_face": "자리이탈",
        "sleepy": "졸음"
    }

    # 이벤트별 묶기
    grouped = {}
    for log in logs:
        event = event_names.get(log["type"], log["type"])
        grouped.setdefault(event, []).append(log["time"])

    # 📊 포맷: 졸음 : 03:00, 07:00 (2회)
    event_lines = []
    for event, times in grouped.items():
        # ✅ 시간 그대로 표시 (초 포함)
        times_str = ", ".join(times)
        count = len(times)
        event_lines.append(f"{event} : {times_str} ({count}회)")

    # 총합
    total = sum(len(v) for v in grouped.values())

    # ✨ 프롬프트 (형식 고정)
    prompt = (
        "아래는 학습 중 감지된 딴짓 로그를 요약한 통계입니다.\n"
        "반드시 아래 형식을 그대로 출력하세요:\n"
        "1) 각 딴짓 유형별로 한 줄씩, '유형 : 시점들 (횟수)' 형태로 출력\n"
        "2) 한 줄 띄우고 '→ 총 n회의 딴짓이 감지되었습니다.' 문장 출력\n"
        "3) 다시 한 줄 띄우고, 위 데이터를 기반으로 집중력 패턴 분석 문단 작성\n\n"
        + "\n".join(event_lines)
        + f"\n\n→ 총 {total}회의 딴짓이 감지되었습니다.\n\n"
        "이 정보를 바탕으로, 집중력이 저하된 구간과 반복되는 행동 패턴을 간결히 분석하고, "
        "멘티에게 필요한 피드백을 한 문단으로 작성해줘."
        "여기서 주어진 시점은 오전, 오후를 나타내는 시간이 아니고 몇분간 했는지 학습 시간을 나타내는거야 그리고 몇시간으로 세는게 아니라 몇분으로 세는거야."
        "시점 뒤에 분을 붙여줘 3, 20 이렇게 작성하는게 아니라 3분 ,20분 이렇게"

    )





    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "너는 학습 세션 중 발생한 딴짓 로그를 분석하는 AI야. "
                    "카메라 감지 데이터를 기반으로 집중력 패턴과 문제점을 간결히 요약해."
                )
            },
            {"role": "user", "content": prompt}
        ],
        temperature=0.4,
        max_tokens=250
    )

    summary = completion.choices[0].message.content.strip()
    return summary
