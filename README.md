# AIL-ways
여러분 안녕

java : 21
빌드 도구 : gradle
데이터베이스 : mogoDB 

실행 명령어 : 
  # 프로젝트 루트 디렉토리에서 실행
./gradlew bootRun

#프로필 정보(역할/흥미)
PATCH /users/{userId}/profile

URL 경로 파라미터 (Path Parameter):
{userId}: 프로필을 업데이트할 사용자의 userId (로그인 시 또는 회원가입 시 받은 userId 값)

인증: 필수 (Bearer Token)

요청 본문 (Request Body):
{
  "role": "MENTEE",
  "interests": ["JAVA", "AI"]
}


성공 응답 (200 OK): 업데이트된 사용자 정보 객체를 반환

실패 응답 (404 Not Found): URL에 포함된 {userId}에 해당하는 사용자가 없을 경우 발생

Role (역할) Enum
사용자가 선택할 수 있는 역할의 종류입니다. role 필드에 아래 문자열 중 하나를 보내주세요. (대소문자 구분 없음)

USER

MENTOR

MENTEE



Interest (흥미 분야) Enum
사용자가 선택할 수 있는 흥미 분야 목록입니다. interests 필드에 아래 문자열들을 배열 형태로 보내주세요. (대소문자 구분 없음)

JAVA

C_PLUS_PLUS

PYTHON

AI

BACKEND

FRONTEND

ENTRY
