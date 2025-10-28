# AIL-ways

## 프로젝트 개요
AIL-ways 프로젝트는 Java 21 기반의 백엔드와 React 기반의 프론트엔드로 구성되어 있으며, MongoDB를 데이터베이스로 사용합니다. 본 문서는 프로젝트의 기술 스택, 설치 및 실행 방법, API 문서 및 주요 엔드포인트에 대한 안내를 포함합니다.

---

## 기술 스택

- **Java 버전**: 21
- **빌드 도구**: Gradle
- **데이터베이스**: MongoDB Community Edition
- **프론트엔드**: Next.js, React, Tailwind CSS, TypeScript

---

## 백엔드 환경 설정 및 실행

### MongoDB Community Edition 설치 및 실행

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### 프로젝트 실행

프로젝트 루트 디렉토리에서 다음 명령어를 실행하여 서버를 시작합니다.

```bash
./gradlew bootRun
```

---

## API 문서 (Swagger)

본 프로젝트는 [springdoc-openapi](https://springdoc.org/) 기반의 Swagger UI를 제공합니다. 개발 환경에서 서버를 실행하면 Swagger UI를 통해 API 명세 확인 및 테스트가 가능합니다.

### Swagger 접속 방법

서버 실행 후 브라우저에서 다음 URL에 접속하십시오.

```
http://localhost:8080/swagger-ui/index.html
```

### 주요 기능

- 컨트롤러 및 엔드포인트 자동 문서화 (`@Tag`, `@Operation` 어노테이션 적용)
  - `@Tag`: 컨트롤러 단위 그룹 설명 (API 묶음의 역할 서술)
  - `@Operation`: 엔드포인트 단위 설명 (각 URL의 기능 서술)
  
- 요청 및 응답 DTO 구조 자동 표시
- `Try it out` 버튼을 통한 API 직접 호출 가능

---

## JWT 인증 사용 방법

1. **로그인 API 호출**

   - 엔드포인트: `POST /api/auth/local/login`
   - 설명: 로그인 후 JWT 토큰을 발급받습니다.
   - 주의: 현재 공용 DB와 연결되어 있지 않으므로, 로컬에서 회원가입한 아이디로만 로그인 가능합니다.
   
   **요청 예시:**
   ```json
   {
     "userId": "testuser",
     "userPw": "StrongPassw0rd!"
   }
   ```
   
   **응답 예시:**
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "type": "Bearer"
   }
   ```

2. **Swagger UI 인증**

   - Swagger UI 상단의 **Authorize 🔒** 버튼 클릭
   - 입력창에 JWT 토큰 문자열만 붙여넣기

---

## API 엔드포인트 명세

### 1. 이메일 인증 코드 발송

- **엔드포인트**: `POST /api/auth/email/code`
- **설명**: 회원가입을 위해 입력된 이메일 주소로 인증 코드를 발송합니다.
- **인증**: 불필요

**요청 본문 예시:**

```json
{
  "email": "user@example.com"
}
```

- `email`: 인증 코드를 받을 유효한 이메일 주소여야 합니다.

**성공 응답 (200 OK):**

```json
{
  "ok": true
}
```

**예외 처리:**

![에러 이미지](https://github.com/user-attachments/assets/75c1ecdb-95b0-43ec-bd50-32ed1ffaec3a)

---

### 2. 로컬 회원가입

- **엔드포인트**: `POST /api/auth/local/signup`
- **설명**: 이메일 인증 후 사용자 회원가입을 진행합니다.

**요청 본문 예시:**

```json
{
  "email": "jskang6001@kookmin.ac.kr",
  "userId": "jskang",
  "userName": "지성",
  "userPw": "StrongPassw0rd!!",
  "code": "651236",
  "consents": [
    { "type": "TOS", "agreed": true },
    { "type": "PRIVACY", "agreed": true },
    { "type": "VIDEO_CAPTURE", "agreed": true }
  ]
}
```

- `code`: 이메일로 발송된 인증 코드입니다.

**성공 응답 (201 Created):**

- 헤더: Location 헤더에 생성된 유저 리소스 경로(`/api/users/{userId}`) 포함
- 본문: 생성된 사용자 상세 정보 반환

```json
{
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
}
```

**실패 응답:**

- `400 Bad Request`: 요청 본문 데이터가 유효성 검사에 실패하거나 비밀번호 정책 위반 시
- `409 Conflict`: 이미 사용 중인 이메일 또는 userId인 경우
- `IllegalStateException`: 이메일 인증 코드 불일치 시

---

### 데이터 모델 (DTOs & Enums)

#### ConsentDTO (약관 동의)

| 필드명   | 타입     | 설명                         |
|----------|----------|------------------------------|
| type     | String   | 약관 종류 (예: TERMS_OF_SERVICE, PRIVACY_POLICY) |
| agreed   | boolean  | 동의 여부                    |
| agreedAt | String   | 동의 시각 (ISO 8601 형식, 예: 2025-09-26T01:30:00Z) (선택) |

---

### 3. 프로필 정보 수정 (역할/흥미)

- **엔드포인트**: `PATCH /users/{userId}/profile`
- **설명**: 사용자 프로필 정보(역할 및 흥미 분야)를 업데이트합니다.
- **인증**: 필수 (Bearer Token)
- **경로 파라미터**: 
  - `{userId}`: 프로필을 수정할 사용자의 userId

**요청 본문 예시:**

```json
{
  "role": "MENTEE",
  "interests": ["JAVA", "AI"]
}
```

**성공 응답 (200 OK):**

- 업데이트된 사용자 정보 객체 반환

**실패 응답 (404 Not Found):**

- 해당 userId에 해당하는 사용자가 없을 경우 발생

---

### Role (역할) Enum

사용자가 선택할 수 있는 역할 종류입니다. `role` 필드에 다음 문자열 중 하나를 대소문자 구분 없이 입력하십시오.

- USER
- MENTOR
- MENTEE

---

### Interest (흥미 분야) Enum

사용자가 선택할 수 있는 흥미 분야 목록입니다. `interests` 필드에 배열 형태로 다음 문자열들을 대소문자 구분 없이 입력하십시오.

- JAVA
- C_PLUS_PLUS
- PYTHON
- AI
- BACKEND
- FRONTEND
- ENTRY

---

## 프론트엔드 패키지 설치 및 실행 가이드

### 기술 스택 및 버전

- Next.js: 15.4.3
- React: 19.1.0
- Tailwind CSS: 4.1.11
- TypeScript: 5

### 설치 방법

1. 반드시 터미널에서 `AIL-ways/apps/frontend` 디렉토리로 이동 후 아래 명령어를 실행하십시오.

```bash
npm install
```

- 루트 디렉토리에서 설치 시 패키지 파일이 잘못 생성되어 버전 호환 문제가 발생할 수 있습니다.
- 새로운 라이브러리가 추가되었을 수 있으므로, 원격 저장소에서 pull 하실 때마다 `npm install` 실행을 권장합니다.

### 프론트엔드 서버 실행

1. 원격 저장소에서 프론트엔드 브랜치를 처음 pull 또는 merge 한 경우, `.env.local` 파일을 생성해야 합니다.

   - `.env.example` 파일 내용을 복사하여 `.env.local` 파일로 붙여넣으십시오.

   ![환경 변수 파일 생성 예시](https://github.com/user-attachments/assets/a0c92163-9b80-47da-b745-6b0280d9eeb7)

2. `apps/frontend` 디렉토리로 이동 후 아래 명령어를 실행하여 개발 서버를 시작합니다.

```bash
npm run dev
```

- 기본적으로 프론트엔드 서버는 `localhost:3000`에서 실행됩니다.

---

본 문서의 내용을 참고하여 프로젝트 환경을 구성하고 API를 활용하시기 바랍니다. 추가 문의 사항은 프로젝트 담당자에게 연락해 주십시오.
