from dataclasses import dataclass
from typing import Optional, Dict, Any, List, Tuple
import time
import numpy as np
import cv2
import mediapipe as mp
import torch
from ultralytics import YOLO

# --- YOLO 내부 클래스 ---
from ultralytics.nn.tasks import DetectionModel
from ultralytics.nn.modules.conv import Conv, Concat        # ✅ Concat 추가
from ultralytics.nn.modules.block import C2f
try:
    from ultralytics.nn.modules.common import SPPF, Bottleneck
except ModuleNotFoundError:
    from ultralytics.nn.tasks import SPPF, Bottleneck
from ultralytics.nn.modules.head import Detect

# --- PyTorch 표준 모듈들 ---
from torch.nn import (
    Sequential,
    ModuleList,
    Conv2d,
    BatchNorm2d,
    SiLU,
    MaxPool2d,
    Upsample,
)

# ✅ PyTorch 2.6+ weights_only 대응: YOLO에서 필요한 모든 클래스 허용
torch.serialization.add_safe_globals([
    # YOLO / Ultralytics 내부
    DetectionModel, Conv, C2f, SPPF, Bottleneck, Detect, Concat,
    # PyTorch 표준 계층
    Sequential, ModuleList, Conv2d, BatchNorm2d, SiLU, MaxPool2d, Upsample
])



# ---------- 설정 데이터클래스 ----------
@dataclass
class DetectorConfig:
    # Drowsiness (EAR)
    ear_threshold: float = 0.20
    drowsy_consec_frames: int = 12  # 대략 0.5~0.7s

    # Absence (no face)
    absence_consec_frames: int = 30

    # Phone (YOLO)
    phone_min_conf: float = 0.50
    phone_consec_frames: int = 5
    detect_phone_every_n: int = 3  # 매 N프레임마다 YOLO

    # 기타
    mirror: bool = True
    max_side: int = 640

# ---------- EAR 계산 ----------
LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [362, 385, 387, 263, 373, 380]


def _dist(a, b):
    return np.hypot(a[0] - b[0], a[1] - b[1])


def _compute_ear(landmarks: np.ndarray, eye_idx: List[int]) -> float:
    p = landmarks[eye_idx]
    A = _dist(p[1], p[5])
    B = _dist(p[2], p[4])
    C = _dist(p[0], p[3])
    return 1.0 if C == 0 else (A + B) / (2.0 * C)


# ---------- 메인 Detector ----------
class Detector:
    def __init__(self, cfg: DetectorConfig = DetectorConfig()):
        self.cfg = cfg

        # ✅ MediaPipe Face Mesh 초기화
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.6,
            min_tracking_confidence=0.6
        )

        # ✅ YOLO 모델 로드 (PyTorch 2.6 호환)
        self.yolo = YOLO("yolov8n.pt")

        # 상태값 초기화
        self._drowsy_count = 0
        self._absence_count = 0
        self._phone_count = 0
        self._frame_no = 0

        # 클래스 이름 캐시 및 'cell phone' 클래스 id 탐색
        self._names = self.yolo.names
        self._cell_phone_ids = {i for i, n in self._names.items() if n == "cell phone"}

    def _prepare_frame(self, frame: np.ndarray) -> np.ndarray:
        img = frame
        if self.cfg.mirror:
            img = cv2.flip(img, 1)
        h, w = img.shape[:2]
        if max(h, w) > self.cfg.max_side:
            scale = self.cfg.max_side / max(h, w)
            img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
        return img

    def process(self, frame: np.ndarray) -> Dict[str, Any]:
        """
        입력: BGR 프레임
        출력: 졸음, 자리이탈, 휴대폰 감지 정보
        """
        t0 = time.time()
        img = self._prepare_frame(frame)
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # --- 1) FaceMesh ---
        face_detected = False
        ear = None
        res = self.face_mesh.process(rgb)

        if res.multi_face_landmarks:
            face_detected = True
            lm = res.multi_face_landmarks[0]
            h, w = img.shape[:2]
            pts = np.array([(p.x * w, p.y * h) for p in lm.landmark], dtype=np.float32)

            L = _compute_ear(pts, LEFT_EYE)
            R = _compute_ear(pts, RIGHT_EYE)
            ear = (L + R) / 2.0

            if ear < self.cfg.ear_threshold:
                self._drowsy_count += 1
            else:
                self._drowsy_count = 0
            self._absence_count = 0
        else:
            self._drowsy_count = 0
            self._absence_count += 1

        # --- 2) YOLO ---
        phone_boxes: List[Tuple[int, int, int, int, float]] = []
        phone_score: Optional[float] = None
        phone_detected_now = False

        if self._frame_no % self.cfg.detect_phone_every_n == 0:
            results = self.yolo(rgb, verbose=False)
            if results:
                r0 = results[0]
                if r0.boxes is not None and len(r0.boxes) > 0:
                    xyxy = r0.boxes.xyxy.cpu().numpy()
                    conf = r0.boxes.conf.cpu().numpy()
                    cls = r0.boxes.cls.cpu().numpy().astype(int)
                    for (x1, y1, x2, y2), sc, c in zip(xyxy, conf, cls):
                        if c in self._cell_phone_ids and sc >= self.cfg.phone_min_conf:
                            phone_boxes.append((int(x1), int(y1), int(x2), int(y2), float(sc)))
                    if phone_boxes:
                        phone_score = max(b[-1] for b in phone_boxes)
                        phone_detected_now = True

        if phone_detected_now:
            self._phone_count += 1
        else:
            self._phone_count = 0

        # --- 3) 최종 판정 ---
        drowsy = self._drowsy_count >= self.cfg.drowsy_consec_frames
        left_seat = self._absence_count >= self.cfg.absence_consec_frames
        phone = self._phone_count >= self.cfg.phone_consec_frames

        self._frame_no += 1
        return {
            "drowsy": drowsy,
            "left_seat": left_seat,
            "phone": phone,
            "ear": None if ear is None else float(ear),
            "face_detected": bool(face_detected),
            "phone_score": phone_score,
            "phone_boxes": phone_boxes,
            "ts": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
            "latency_ms": int((time.time() - t0) * 1000),
        }
