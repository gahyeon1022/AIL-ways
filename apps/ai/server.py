from fastapi import FastAPI, UploadFile, File
import numpy as np
import cv2
import requests
from detector import Detector

app = FastAPI()
detector = Detector()

# 🧩 백엔드 API 엔드포인트 (팀 서버 주소로 교체 가능)
BACKEND_URL = "https://우리서버주소/api/sessions"

@app.post("/analyze-frame/{session_id}")
async def analyze_frame(session_id: str, file: UploadFile = File(...)):
    """
    프론트나 백엔드에서 전송한 프레임을 받아
    딴짓 감지를 수행하고, 필요 시 백엔드로 결과를 전송합니다.
    """
    # --- 이미지 디코딩 ---
    data = await file.read()
    frame = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)

    # --- AI 감지 수행 ---
    result = detector.process(frame)

    # --- 딴짓 감지 여부 확인 ---
    if result["phone"] or result["drowsy"] or result["left_seat"]:
        # 감지된 활동 내용 설정
        if result["phone"]:
            activity = "스마트폰 사용"
        elif result["drowsy"]:
            activity = "졸음 감지"
        else:
            activity = "자리 이탈"

        # 백엔드로 전송할 JSON 데이터
        payload = {
            "activity": activity,
            "detectionType": "VISION_AI"
        }

        try:
            response = requests.post(
                f"{BACKEND_URL}/{session_id}/distractions",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=5
            )
            print(f"[INFO] Sent to backend: {payload} → {response.status_code}")
        except Exception as e:
            print(f"[ERROR] Failed to send to backend: {e}")

    # 결과 반환 (프론트 디버깅용)
    return result

