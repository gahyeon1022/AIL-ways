from fastapi import FastAPI, UploadFile, File
import numpy as np
import cv2
from detector import Detector
import time

# FastAPI 앱 초기화
app = FastAPI()

# Detector 인스턴스 생성
detector = Detector()


@app.post("/analyze-frame/{session_id}")
async def analyze_frame(session_id: str, file: UploadFile = File(...)):
    """
    프론트 또는 백엔드에서 전달한 프레임을 분석해 딴짓 여부를 반환합니다.
    딴짓이 감지되면 activity 정보도 포함해 응답합니다.
    """
    try:
        start_time = time.time()

        # 프레임 읽기
        data = await file.read()
        frame = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)
        if frame is None:
            raise ValueError("Invalid image data")

        # 감지 수행
        result = detector.process(frame)

        # 감지 상태 결정
        detected_activity = None
        if result.get("phone"):
            detected_activity = "스마트폰 사용"
        elif result.get("drowsy"):
            detected_activity = "졸음 감지"
        elif result.get("left_seat"):
            detected_activity = "자리 이탈"

        latency = round((time.time() - start_time) * 1000, 2)

        # ✅ 통일된 응답 구조
        return {
            "success": True,
            "data": {
                "sessionId": session_id,
                "activity": detected_activity,
                "phone": result.get("phone"),
                "drowsy": result.get("drowsy"),
                "left_seat": result.get("left_seat"),
                "ear": result.get("ear"),
                "face_detected": result.get("face_detected"),
                "phone_score": result.get("phone_score"),
                "ts": result.get("ts"),
                "latency_ms": latency,
            },
            "error": None
        }

    except Exception as e:
        # ✅ 에러 발생 시 통일된 구조로 반환
        return {
            "success": False,
            "data": None,
            "error": str(e)
        }


@app.get("/health")
async def health_check():
    """서버 상태 확인용 엔드포인트"""
    return {
        "success": True,
        "data": {
            "status": "ok",
            "message": "AIL-ways AI 서버 정상 동작 중 ✅"
        },
        "error": None
    }
