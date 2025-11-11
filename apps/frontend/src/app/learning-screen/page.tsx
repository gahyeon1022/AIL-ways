'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import QuestionManager from './components/QuestionManager';
import NoteEditor from './components/NoteEditor';
import CheckFinishedModal from './components/CheckFinishedModal';
import SelfFeedbackModal from './components/SelfFeedbackModal';
import { startSession, resumeSession } from '@/app/server-actions/session';

const SAMPLE_MS = 200; // 5 FPS 정도
const TARGET_W = 640; // 업로드 해상도 가로
const QUALITY = 0.7; // JPEG/WebP 품질

type ImageCaptureLike = {
  grabFrame: () => Promise<ImageBitmap>;
};

const isImageCaptureLike = (value: unknown): value is ImageCaptureLike => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { grabFrame?: unknown }).grabFrame === 'function'
  );
};

// 이벤트 우선순위(중복 시 가장 먼저 보일 항목)
const EVENT_PRIORITY: Array<'PHONE' | 'LEFT_SEAT' | 'DROWSY'> = [
  'PHONE',
  'LEFT_SEAT',
  'DROWSY',
];

export default function LearningScreenPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-white">
          학습 화면 준비 중…
        </main>
      }
    >
      <LearningScreenContent />
    </Suspense>
  );
}

function LearningScreenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get('matchId') ?? '';
  const mentorId = searchParams.get('mentorId') ?? '';

  const [questions, setQuestions] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [aiUploading, setAiUploading] = useState(false);

  // 감지 결과(모달로 전달)
  const [detectedActivity, setDetectedActivity] = useState<
    null | 'PHONE' | 'LEFT_SEAT' | 'DROWSY'
  >(null);
  const [detectedAt, setDetectedAt] = useState<string | null>(null);
  const [detectedConf, setDetectedConf] = useState<number | null>(null);

  // refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wasFeedbackOpen = useRef(false);

  // 캡처/업로드
  const capRef = useRef<ImageCaptureLike | null>(null); // ImageCapture 또는 null
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loopTimer = useRef<number | null>(null);
  const inflight = useRef<boolean>(false);
  const paused = useRef<boolean>(false);
  const cooldownUntil = useRef<number>(0);
  const lastProcessedDistractionRef = useRef<string | null>(null);

  useEffect(() => {
    paused.current = isFeedbackModalOpen;
  }, [isFeedbackModalOpen]);

  // StrictMode 중복 실행 방지
  const initedRef = useRef(false);

  // 비디오 재생 준비 완료 플래그(메타데이터/재생 대기까지 끝난 뒤 true)
  const [videoReady, setVideoReady] = useState(false);

  // 안전한 비디오 시작 시퀀스
  const startVideo = async (stream: MediaStream) => {
    const v = videoRef.current!;
    if (v.srcObject !== stream) v.srcObject = stream; // 중복 세팅 방지

    // 메타데이터 로딩 대기 (width/height 확보)
    await new Promise<void>((resolve) => {
      if (v.readyState >= 1) return resolve(); // HAVE_METADATA
      const onMeta = () => {
        v.removeEventListener('loadedmetadata', onMeta);
        resolve();
      };
      v.addEventListener('loadedmetadata', onMeta);
    });

    // canplay 대기(디코더 준비)
    await new Promise<void>((resolve) => {
      if (!v.paused && !v.ended) return resolve();
      const onCanPlay = () => {
        v.removeEventListener('canplay', onCanPlay);
        resolve();
      };
      v.addEventListener('canplay', onCanPlay);
    });

    try {
      await v.play();
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      console.warn('video.play 실패:', error);
    }

    setVideoReady(true);
  };

  // 1) 세션 시작 + 웹캠 시작 (중복 init 방지)
  useEffect(() => {
    if (initedRef.current) return;
    initedRef.current = true;

    const initPage = async () => {
      if (!matchId || !mentorId) {
        console.error('매칭 정보가 없습니다.');
        router.replace('/mentoring-current');
        return;
      }

      try {
        const session = await startSession(matchId, mentorId);
        setSessionId(session.sessionId);
        console.log('세션 시작:', session.sessionId);

        // 카메라
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: false,
        });
        streamRef.current = stream;

        // ImageCapture 준비(가능하면)
        const track = stream.getVideoTracks()[0];
        const imageCaptureCtor = (
          window as typeof window & {
            ImageCapture?: new (mediaTrack: MediaStreamTrack) => unknown;
          }
        ).ImageCapture;
        if (imageCaptureCtor) {
          const candidate = new imageCaptureCtor(track);
          capRef.current = isImageCaptureLike(candidate) ? candidate : null;
        } else {
          capRef.current = null;
        }

        // 비디오 안전 시작
        await startVideo(stream);
      } catch (error) {
        console.error('세션 시작 중 오류:', error);
      }
    };

    initPage();

    const videoElement = videoRef.current;
    return () => {
      // cleanup
      if (loopTimer.current) window.clearTimeout(loopTimer.current);
      const s = streamRef.current;
      s?.getTracks().forEach((t) => t.stop());
      if (videoElement) videoElement.srcObject = null;
      initedRef.current = false;
      setVideoReady(false);
    };
  }, [matchId, mentorId, router]);

  useEffect(() => {
    lastProcessedDistractionRef.current = null;
  }, [sessionId]);

  // 2) 학습 재개
  useEffect(() => {
    if (wasFeedbackOpen.current && !isFeedbackModalOpen && sessionId) {
      (async () => {
        try {
          await resumeSession(sessionId);
          console.log('학습 재개');
        } catch (e) {
          console.error('학습 재개 실패:', e);
        }
      })();
    }
    wasFeedbackOpen.current = isFeedbackModalOpen;
  }, [isFeedbackModalOpen, sessionId]);

  // 3) 페이지 가시성에 따라 업로드 일시정지
  useEffect(() => {
    const onVis = () => {
      paused.current = document.visibilityState !== 'visible';
    };
    document.addEventListener('visibilitychange', onVis);
    onVis();
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // 4) 프레임 샘플링 → BE 분석 API 업로드 루프 (비디오 준비 + 세션 준비 후 시작)
  useEffect(() => {
    if (!sessionId || !videoReady) return;

    const toBlob = async (): Promise<Blob | null> => {
      const v = videoRef.current;
      if (!v || v.videoWidth === 0) return null;

      // 프레임 가져오기: ImageCapture 우선, 폴백은 video→canvas
      let bitmap: ImageBitmap | null = null;
      try {
        if (capRef.current) {
          bitmap = await capRef.current.grabFrame();
        }
      } catch {}

      const cw = TARGET_W;
      let ch: number;
      if (!canvasRef.current)
        canvasRef.current = document.createElement('canvas');
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;

      if (bitmap) {
        const ratio = bitmap.height / bitmap.width;
        ch = Math.round(TARGET_W * ratio);
        canvas.width = cw;
        canvas.height = ch;
        ctx.drawImage(bitmap, 0, 0, cw, ch);
      } else {
        const ratio = v.videoHeight / v.videoWidth;
        ch = Math.round(TARGET_W * ratio);
        canvas.width = cw;
        canvas.height = ch;
        ctx.drawImage(v, 0, 0, cw, ch);
      }

      // WebP 우선, 미지원이면 JPEG
      const type = canvas.toDataURL('image/webp').startsWith('data:image/webp')
        ? 'image/webp'
        : 'image/jpeg';
      return new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), type, QUALITY)
      );
    };

    const upload = async (blob: Blob) => {
      const fd = new FormData();
      fd.append('file', blob, `frame-${Date.now()}.webp`);
      try {
        setAiUploading(true);

        // ▶︎ BE StudySession API로 업로드 (세션별 분석)
        const res = await fetch(
          `/api/sessions/${sessionId}/distractions/analyze`,
          {
            method: 'POST',
            body: fd,
          }
        );
        if (!res.ok) throw new Error(`BE ${res.status}`);

        // 래핑/비래핑 모두 대응
        const raw = await res.json();
        const responsePayload = raw?.data ?? raw;

        const deriveFromSession = () => {
          const logs = Array.isArray(responsePayload?.distractionLogs)
            ? responsePayload.distractionLogs
            : [];
          if (!logs.length) return null;
          const latest = logs[logs.length - 1];
          if (!latest) return null;

          const detectedAtIso: string | undefined = latest.detectedAt;
          const activityRaw: string | undefined = latest.activity;

          const dedupeKey = `${detectedAtIso ?? ''}|${activityRaw ?? ''}|${
            logs.length
          }`;
          if (lastProcessedDistractionRef.current === dedupeKey) return null;
          lastProcessedDistractionRef.current = dedupeKey;

          const mapActivityToEvent = (
            activity?: string | null
          ): 'PHONE' | 'LEFT_SEAT' | 'DROWSY' | null => {
            if (!activity) return null;
            const normalized = activity.toLowerCase();
            if (
              normalized.includes('phone') ||
              normalized.includes('휴대폰') ||
              normalized.includes('스마트폰') ||
              normalized.includes('smart')
            ) {
              return 'PHONE';
            }
            if (normalized.includes('left') || normalized.includes('자리')) {
              return 'LEFT_SEAT';
            }
            if (normalized.includes('drowsy') || normalized.includes('졸')) {
              return 'DROWSY';
            }
            return null;
          };

          const hit = mapActivityToEvent(activityRaw);
          if (!hit) return null;

          return {
            hit,
            ts: detectedAtIso ?? new Date().toISOString(),
            confidence: 0.9,
          };
        };

        const deriveFromEventsPayload = () => {
          const ev = responsePayload?.events || {};
          const hit = EVENT_PRIORITY.find((k) => ev?.[k]);
          if (!hit) return null;
          const ts: string =
            (responsePayload?.ts as string) ?? new Date().toISOString();
          const conf: number =
            (responsePayload?.metrics?.phone_score as number | undefined) ??
            0.9;
          const dedupeKey = `${ts}|${hit}`;
          if (lastProcessedDistractionRef.current === dedupeKey) return null;
          lastProcessedDistractionRef.current = dedupeKey;
          return { hit, ts, confidence: conf };
        };

        const detection = deriveFromEventsPayload() ?? deriveFromSession();

        if (detection) {
          const now = Date.now();
          if (now < cooldownUntil.current) return; // 쿨다운 중이면 무시

          if (!isFeedbackModalOpen) {
            setDetectedActivity(detection.hit);
            setDetectedAt(detection.ts);
            setDetectedConf(detection.confidence);
            setIsFeedbackModalOpen(true);
            paused.current = true;
          }

          cooldownUntil.current = now + 8000;
        }
      } catch (e) {
        console.warn('AI 업로드 실패:', e);
      } finally {
        setAiUploading(false);
      }
    };

    const loop = async () => {
      if (!sessionId || !streamRef.current) return;
      if (!paused.current && !inflight.current) {
        const blob = await toBlob();
        if (blob) {
          inflight.current = true;
          upload(blob).finally(() => {
            inflight.current = false;
          });
        }
      }
      loopTimer.current = window.setTimeout(loop, SAMPLE_MS);
    };

    loop();

    return () => {
      if (loopTimer.current) window.clearTimeout(loopTimer.current);
    };
  }, [sessionId, videoReady, isFeedbackModalOpen]);

  // 종료/피드백 핸들러
  const handleConfirm = () => {
    console.log('학습 종료');
    console.log('질문: ', questions);
    console.log('필기: ', note);

    const s = streamRef.current;
    s?.getTracks().forEach((t) => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsModalOpen(false);
  };

  const handleSubmitFeedback = (feedback: string) => {
    console.log('제출된 자가 피드백:', feedback);
    setIsFeedbackModalOpen(false);
    cooldownUntil.current = Date.now() + 8000;
  };

  return (
    <main className="min-h-screen">
      <section className="w-[80vw] h-[80vh] flex gap-5 mx-auto items-stretch">
        <QuestionManager
          questions={questions}
          onQuestionsChange={setQuestions}
        />

        {/* 웹캠 */}
        <div className="flex-[2.5] h-full flex flex-col items-center justify-center">
          <div className="w-full h-full bg-gray-200 rounded shadow flex flex-col items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain rounded-md scale-x-[-1]"
            />
            <div className="text-xs text-gray-600 py-1 hidden">
              {aiUploading
                ? 'AI로 전송 중…'
                : videoReady
                ? '준비 완료'
                : '카메라 준비 중…'}
            </div>
          </div>
        </div>

        <NoteEditor value={note} onChange={setNote} />
      </section>

      <div className="mt-4 flex justify-center gap-4">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-red-500 text-white rounded cursor-pointer"
        >
          학습 종료
        </button>
      </div>

      <CheckFinishedModal
        open={isModalOpen}
        onConfirm={handleConfirm}
        onClose={() => setIsModalOpen(false)}
        sessionId={sessionId}
        note={note}
        questions={questions}
      />

      <SelfFeedbackModal
        open={isFeedbackModalOpen}
        onSubmit={handleSubmitFeedback}
        onClose={() => setIsFeedbackModalOpen(false)}
        sessionId={sessionId}
        detectedActivity={detectedActivity ?? undefined}
        detectedAt={detectedAt ?? undefined}
        confidence={detectedConf ?? undefined}
      />
    </main>
  );
}
