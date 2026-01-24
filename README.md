# AIL-ways: AI 기반 스마트 멘토링 시스템
[![Java](https://img.shields.io/badge/Java-21-orange)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-green)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.4.3-black)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11-blue)](https://www.python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green)](https://www.mongodb.com/)
> 🎯 **AI 기반 멘토링 시스템으로 학습 효율을 극대화하고 개인화된 피드백을 제공하는 스마트 학습 플랫폼**
## ✨ 프로젝트 개요
AIL-ways는 AI 기술을 활용한 차세대 멘토링 시스템으로, 멘토와 멘티의 학습 과정을 지능적으로 분석하고 최적화합니다. 실시간 집중도 감지, 자동화된 학습 리포트, 개인화된 피드백 시스템을 통해 더 효과적인 학습 경험을 제공합니다.
### 🎯 핵심 가치
- **🤖 AI 기반 집중도 분석**: 실시간으로 학습자의 집중 상태를 분석하고 딴짓을 감지
- **📊 스마트 학습 리포트**: 주간 학습 현황을 AI가 자동 요약하고 인사이트 제공
- **👥 멘토-멘티 매칭**: 최적의 멘토링 파트너를 연결하고 학습 과정을 관리
- **🔍 데이터 기반 피드백**: 학습 데이터를 분석하여 개인화된 개선 방향 제시
## 🏗️ 시스템 아키텍처
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend       │    │     AI Service  │
│   (Next.js)     │◄──►│  (Spring Boot)   │◄──►│    (Python)     │
│                 │    │                  │    │                 │
│ • React 19      │    │ • Java 21        │    │ • YOLOv8        │
│ • TypeScript    │    │ • Spring Security│    │ • MediaPipe     │
│ • Tailwind CSS  │    │ • JWT Auth       │    │ • OpenAI API    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  User Interface │    │  Business Logic │    │   AI Models     │
│  - 학습 세션      │    │  - 인증/인가       │    │  - 딴짓 감지      │
│  - 리포트 조회     │    │  - 세션 관리      │    │  - 텍스트 요약     │
│  - 프로필 관리     │    │  - 데이터 처리     │    │  - 비디오 분석     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                 │
                                 ▼
                       ┌─────────────────┐
                       │   MongoDB       │
                       │                 │
                       │ • 사용자 데이터    │
                       │ • 학습 세션       │
                       │ • 리포트 데이터    │
                       └─────────────────┘
```
## 🚀 주요 기능
### 👤 사용자 관리
- **회원가입/로그인**: 이메일 인증 기반의 안전한 인증 시스템
- **역할 기반 접근제어**: 멘토, 멘티, 일반 사용자 역할 관리
- **프로필 관리**: 학습 관심사, 역할, 개인 정보 설정
### 🎥 학습 세션 관리
- **실시간 학습 세션**: 멘토-멘티 간의 라이브 학습 세션
- **AI 기반 딴짓 감지**:
  - 😴 졸음 감지 (EAR - Eye Aspect Ratio)
  - 🚶 자리 이탈 감지 (얼굴 인식 기반)
  - 📱 휴대폰 사용 감지 (YOLOv8 객체 탐지)
- **학습 로그 기록**: 세션별 상세한 학습 활동 기록
### 📈 스마트 리포트
- **주간 학습 리포트**: 자동 생성된 주간 학습 현황 요약
- **AI 피드백**: OpenAI API를 활용한 개인화된 학습 조언
- **멘토 피드백**: 멘토의 전문적인 피드백 시스템
- **시각화 데이터**: 학습 시간, 집중도, 개선 추이 그래프
### 🔔 알림 및 피드백
- **실시간 알림**: 딴짓 감지 시 즉각적인 알림 제공
- **자기 피드백**: 학습자의 자가 평가 시스템
- **질문 로그**: 학습 중 발생한 질문 기록 및 관리
## 🛠️ 기술 스택
### Backend
- **Java 21** + **Spring Boot 3.x**
- **Spring Security** + **JWT** 인증
- **MongoDB** 데이터베이스
- **Gradle** 빌드 도구
- **Redis** 세션 관리
### Frontend  
- **Next.js 15.4.3** + **React 19**
- **TypeScript 5** 정적 타입
- **Tailwind CSS 4.1.11** 스타일링
- **Swagger UI** API 문서화
### AI Services
- **Python 3.11**
- **YOLOv8**: 객체 탐지 (휴대폰 감지)
- **MediaPipe**: 얼굴 랜드마크 검출 (졸음 감지)
- **OpenAI API**: 텍스트 요약 및 피드백 생성
- **FastAPI**: AI 서비스 API
## 🚀 빠른 시작
### 사전 요구사항
```bash
# Java 21
# Node.js 18+
# Python 3.11
# MongoDB 6.x
# Redis
```
### 1. 저장소 클론
```bash
git clone https://github.com/your-org/AIL-ways.git
cd AIL-ways
```
### 2. 데이터베이스 설정
```bash
# MongoDB 설치 및 실행
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
# Redis 설치 및 실행
brew install redis
brew services start redis
```
### 3. Backend 서버 실행
```bash
# 프로젝트 루트에서
./gradlew bootRun
```
### 4. Frontend 서버 실행
```bash
cd apps/frontend
npm install
npm run dev
```
### 5. AI 서비스 실행
```bash
cd apps/ai
source venv/bin/activate
pip install -r requirements.txt
# 딴짓 감지 서버
uvicorn server:app --reload
# 요약 서버
uvicorn summarizer_api:app --host 0.0.0.0 --port 8001
```
### 6. API 문서 확인
서버 실행 후 Swagger UI 접속:
```
http://localhost:8080/swagger-ui/index.html
```
## 📖 사용 가이드
### 학습 세션 시작하기
1. 로그인 후 멘토 또는 멘티 역할 선택
2. 학습 세션 생성 및 멘토링 파트너 매칭
3. 웹캠을 통한 실시간 학습 시작
4. AI가 집중도를 자동으로 분석하고 딴짓을 감지
### 리포트 확인하기
1. 대시보드에서 주간 학습 현황 확인
2. AI 생성 요약 및 멘토 피드백 조회
3. 학습 시간, 집중도, 개선사항 시각화 데이터 확인
## 🔧 API 문서
### 인증 API
- `POST /api/auth/email/code` - 이메일 인증코드 발송
- `POST /api/auth/local/signup` - 회원가입
- `POST /api/auth/local/login` - 로그인
### 학습 세션 API
- `POST /api/sessions` - 학습 세션 생성
- `GET /api/sessions/{sessionId}` - 세션 정보 조회
- `POST /api/sessions/{sessionId}/distraction` - 딴짓 감지 기록
### 리포트 API
- `GET /api/reports/weekly` - 주간 리포트 조회
- `POST /api/reports/feedback` - 피드백 추가
## 🏆 프로젝트 특징
### 🎯 AI 기반 실시간 분석
- YOLOv8를 활용한 정확한 휴대폰 탐지
- MediaPipe를 이용한 미세한 졸음 패턴 분석
- 다중 프레임 분석으로 오탐지 최소화
### 📊 데이터 기반 인사이트
- 학습 패턴 분석 및 최적의 학습 시간 추천
- 집중도 변화 추이와 개선 방향 제시
- 멘토-멘티 간 학습 효율 비교 분석
### 🔒 보안과 프라이버시
- JWT 기반 안전한 인증 시스템
- 영상 데이터는 실시간 처리 후 저장하지 않음
- 개인정보 암호화 처리
## 🤝 기여하기
AIL-ways 프로젝트에 기여하고 싶으신가요?
### 기여 방법
1. 이슈 생성: 버그 리포트나 기능 제안
2. 포크 및 브랜치 생성: `git checkout -b feature/amazing-feature`
3. 커밋: `git commit -m 'Add amazing feature'`
4. 푸시: `git push origin feature/amazing-feature`
5. 풀리퀘스트 생성
### 개발 가이드라인
- Java: Spring Boot 코딩 컨벤션 따르기
- JavaScript/TypeScript: ESLint 및 Prettier 설정 준수
- Python: PEP 8 스타일 가이드 따르기
- 모든 PR은 테스트 코드와 함께 제출
## 📄 라이선스
이 프로젝트는 MIT 라이선스 하에 운영됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.
## 👥 팀 소개
AIL-ways는 AI 기술로 교육의 미래를 만들어가는 개발자들로 구성된 팀입니다.
- **Backend**: Spring Boot 기반의 안정적인 API 개발
- **Frontend**: React/Next.js로 직관적인 UI/UX 구현
- **AI**: 머신러닝/딥러닝 전문가의 지능형 분석 시스템 개발
## 📞 문의
프로젝트에 대한 문의사항이 있으시면 아래로 연락주세요:
- 📧 Email: contact@ail-ways.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/AIL-ways/issues)
- 📖 Wiki: [프로젝트 위키](https://github.com/your-org/AIL-ways/wiki)
---
<div align="center">
**🌟 함께 만들어가는 스마트 학습의 미래, AIL-ways 🌟**
Made with ❤️ by AIL-ways Team
</div>
