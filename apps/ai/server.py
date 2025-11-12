from fastapi import FastAPI, UploadFile, File
import numpy as np
import cv2
from detector import Detector

app = FastAPI()
detector = Detector()


@app.post("/analyze-frame/{session_id}")
async def analyze_frame(session_id: str, file: UploadFile = File(...)):
    """
    프론트 또는 백엔드에서 전달한 프레임을 분석해 딴짓 여부를 반환합니다.
    딴짓이 감지되면 activity 정보도 포함해 응답합니다.
    """
    # 프레임 읽기
    data = await file.read()
    frame = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)

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

    # 응답 구성
    return {
        "sessionId": session_id,
        "phone": result.get("phone"),
        "drowsy": result.get("drowsy"),
        "left_seat": result.get("left_seat"),
        "activity": detected_activity,
        "ear": result.get("ear"),
        "face_detected": result.get("face_detected"),
        "phone_score": result.get("phone_score"),
        "ts": result.get("ts"),
        "latency_ms": result.get("latency_ms"),
    }


