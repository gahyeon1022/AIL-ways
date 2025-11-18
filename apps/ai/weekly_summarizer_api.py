"""
남아있는 구동 스크립트를 위해 summarizer_api의 FastAPI 앱을 재사용합니다.
apps.ai.* 모듈 경로와 apps/ai 디렉터리 실행 모두 지원합니다.
"""

try:
    from apps.ai.summarizer_api import app  # type: ignore
except ModuleNotFoundError:
    from summarizer_api import app  # type: ignore
