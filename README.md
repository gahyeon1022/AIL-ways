# AIL-ways
여러분 안녕

## java : 21
## 빌드 도구 : gradle
## 데이터베이스 : mogoDB 

>> brew tap mongodb/brew

>> brew install mongodb-community

>> brew services start mongodb-community


# MongoDB Community Edition 설치
brew install mongodb-community

 실행 명령어 : 
  >> 프로젝트 루트 디렉토리에서 실행
>  >  ./gradlew bootRun 


## 📖 API 문서 (Swagger)

우리 프로젝트는 [springdoc-openapi](https://springdoc.org/) 기반 Swagger UI를 제공합니다.  
개발 환경에서 서버를 실행하면, Swagger에서 API 명세와 테스트를 바로 할 수 있습니다.
루트에서 ./gradlew bootRun 또는 apps/backend/src/main/app/BackendApplication.java 실행
### 🔹 Swagger 접속
서버 실행 후 브라우저에서 접속:
http://localhost:8080/swagger-ui/index.html 접속
### 🔹 주요 기능
- 컨트롤러/엔드포인트 자동 문서화 (`@Tag`, `@Operation` 적용)
- 요청/응답 DTO 구조 자동 표시
- `Try it out` 버튼으로 API 직접 호출 가능

### 🔹 JWT 인증 사용 방법
1. 먼저 **로그인 API**(`/api/auth/local/login`) 호출해서 JWT 토큰을 발급받습니다.
   **현재 공용DB 연결이 되어 있지 않기 때문에, 로컬에서 본인이 회원가입을 한 아이디로만 가능합니다!!**
    - 요청 예시:
      ```json
      {
        "userId": "testuser",
        "userPw": "StrongPassw0rd!"
      }
      ```
    - 응답 예시:
      ```json
      {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "type": "Bearer"
      }
      ```

3. Swagger UI 상단의 **Authorize 🔒 버튼** 클릭
4. 입력창에 **토큰 문자열만** 붙여넣기

### 로컬(이메일)로 회원가입에 대한 api명세서

인증 (Authentication) - /api/auth

**1. 이메일 인증코드 발송 **
   >> POST /api/auth/email/code
설명: 회원가입을 위해 입력된 이메일 주소로 인증코드를 발송합니다.

인증: 불필요

요청 본문 (Request Body):

`{
  "email": "user@example.com"
} `

email: 인증코드를 받을 유효한 이메일 주소여야 합니다.

성공 응답 (200 OK):

`{
  "ok": true
}`

예외처리 : 
<img width="251" height="96" alt="image" src="https://github.com/user-attachments/assets/75c1ecdb-95b0-43ec-bd50-32ed1ffaec3a" />

**2. 로컬 회원가입**
   >> POST /api/auth/local/signup
요청 본문 (Request Body):

`{
  "email": "jskang6001@kookmin.ac.kr",
  "userId": "jskang",
  "userName": "지성",
  "userPw": "StrongPassw0rd!!",
  "code":"651236",
  "consents": [
    { "type": "TOS", "agreed": true },
    { "type": "PRIVACY", "agreed": true },
    { "type": "VIDEO_CAPTURE", "agreed":true}
  ]
}`

이때 code 는 이메일로 발송된 인증코드입니다

성공응답
성공 응답 (201 Created):

헤더: Location 헤더에 생성된 유저의 리소스 경로(예: /api/users/{userId})가 포함됩니다.

본문: 생성된 사용자의 상세 정보를 반환합니다.

`{
  "email": "jskang6001@kookmin.ac.kr",
  "userName": "강지성",
  "userId": "jskang",
  "createdAt": "2025-09-26T01:30:00Z",
  "consents": [
    {
      "type": "TERMS_OF_SERVICE",
      "agreed": true,
      "agreedAt": "2025-09-26T01:30:00Z"
    }
  ]
}`

실패 응답:

400 Bad Request: 요청 본문의 데이터가 유효성 검사(validation)를 통과하지 못했거나, 비밀번호 정책 위반 시 발생합니다.

409 Conflict: 이미 사용 중인 email 또는 userId일 경우 발생합니다.

IllegalStateException: 이메일 인증코드가 일치하지 않을 경우 발생합니다.


데이터 모델 (DTOs & Enums)
API 요청 및 응답에 사용되는 데이터의 상세 구조입니다.

ConsentDTO (약관 동의)
type (String): 약관의 종류 (예: TERMS_OF_SERVICE, PRIVACY_POLICY)

agreed (boolean): 동의 여부

agreedAt (String, Optional): 동의 시각 (ISO 8601 형식, 예: 2025-09-26T01:30:00Z)










### 프로필 정보(역할/흥미)
>> PATCH /users/{userId}/profile
[ URL 경로 파라미터 (Path Parameter):
{userId}: 프로필을 업데이트할 사용자의 userId (로그인 시 또는 회원가입 시 받은 userId 값)

인증: 필수 (Bearer Token)

요청 본문 (Request Body):
`{
  "role": "MENTEE",
  "interests": ["JAVA", "AI"]
}`

성공 응답 (200 OK): 업데이트된 사용자 정보 객체를 반환

실패 응답 (404 Not Found): URL에 포함된 {userId}에 해당하는 사용자가 없을 경우 발생 ]

Role (역할) Enum
사용자가 선택할 수 있는 역할의 종류입니다. role 필드에 아래 문자열 중 하나를 보내주세요. (대소문자 구분 없음)

-USER
-MENTOR
-MENTEE



Interest (흥미 분야) Enum
사용자가 선택할 수 있는 흥미 분야 목록입니다. interests 필드에 아래 문자열들을 배열 형태로 보내주세요. (대소문자 구분 없음)

-JAVA
-C_PLUS_PLUS
-PYTHON
-AI
-BACKEND
-FRONTEND
-ENTRY
