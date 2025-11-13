from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv

# ✅ .env 파일에서 OPENAI_API_KEY 로드
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("환경 변수 OPENAI_API_KEY가 설정되어 있지 않습니다.")

# ✅ OpenAI 클라이언트 초기화
client = OpenAI(api_key=OPENAI_API_KEY)

# ✅ FastAPI 앱 초기화
app = FastAPI(
    title="AIL-ways AI Summary API",
    description="멘티의 학습 노트를 AI가 요약하여 반환하는 API",
    version="1.0.0"
)

# ✅ 요청 및 응답 데이터 모델
class SummarizeRequest(BaseModel):
    textToSummarize: str


class SummarizeResponse(BaseModel):
    aisummary: str


class WeeklyReportRequest(BaseModel):
    study_hours: dict
    focus_me: int
    focus_avg: int
    total_hours: float


class WeeklyReportResponse(BaseModel):
    aisummary: str


# ✅ 텍스트 요약 엔드포인트
@app.post("/summarize", response_model=SummarizeResponse)
async def summarize_text(
    req: SummarizeRequest,
    authorization: str = Header(None)  # 백엔드에서 Bearer {API_KEY} 전달 가능
):
    try:
        # OpenAI API 호출 (핵심 요약 생성)
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "너는 학생의 학습 노트를 간결하고 핵심적으로 요약하는 AI야."
                },
                {
                    "role": "user",
                    "content": f"다음 학습 내용을 한 문단으로 요약해줘:\n\n{req.textToSummarize}"
                }
            ],
            temperature=0.5,
            max_tokens=250
        )

        # 결과 텍스트 추출
        summary_text = completion.choices[0].message.content.strip()

        # 응답 반환
        return {"aisummary": summary_text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"요약 중 오류 발생: {str(e)}")


@app.post("/analyze-weekly", response_model=WeeklyReportResponse)
async def analyze_weekly(
    req: WeeklyReportRequest,
    authorization: str = Header(None)
):
    try:
        prompt = f"""
        아래는 사용자의 주간 학습 데이터입니다:
        - 요일별 학습 시간: {req.study_hours}
        - 총 학습 시간: {req.total_hours}시간
        - 나의 집중도: {req.focus_me}%
        - 또래 평균 집중도: {req.focus_avg}%

        이 데이터를 바탕으로 아래 형식으로 작성하세요:
        1. 학습 패턴 요약 (2줄)
        2. 개선 제안 (1줄)

        출력은 JSON 형식으로 반환:
        {{
            "summary": "이번 주에는 ~",
            "suggestion": "다음 주에는 ~"
        }}
        """

        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "너는 일주일간의 학습 데이터를 분석해 요약과 개선점을 제시하는 코치야."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=300
        )

        summary_text = completion.choices[0].message.content.strip()
        return {"aisummary": summary_text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"주간 요약 중 오류 발생: {str(e)}")
