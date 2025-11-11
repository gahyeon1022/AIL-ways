from fastapi import FastAPI
from pydantic import BaseModel
from weekly_summarizer import summarize_weekly_report

app = FastAPI()

class WeeklyReportRequest(BaseModel):uv
    study_hours: dict
    focus_me: int
    focus_avg: int
    total_hours: int

@app.post("/analyze-weekly")
async def analyze_weekly(req: WeeklyReportRequest):
    """
    프론트에서 주간 리포트 데이터를 전달받아
    AI가 자동으로 요약문과 개선점을 반환합니다.
    """
    data = req.model_dump()
    result = summarize_weekly_report(data)
    return {
        "success": True,
        "data": result,
        "error": None
    }
