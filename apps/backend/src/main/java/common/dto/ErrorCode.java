package common.dto;

public enum ErrorCode {
    // 잘못된 요청
    INVALID_REQUEST("INVALID_REQUEST", "잘못된 요청입니다."),

    // 인증/인가
    UNAUTHORIZED("UNAUTHORIZED", "인증이 필요합니다."),
    FORBIDDEN("FORBIDDEN", "접근 권한이 없습니다."),

    // 유저 관련
    USER_NOT_FOUND("USER_NOT_FOUND", "사용자를 찾을 수 없습니다."),
    EMAIL_TAKEN("EMAIL_TAKEN", "이미 사용중인 이메일입니다."),
    USERID_TAKEN("USERID_TAKEN", "이미 사용중인 아이디입니다."),

    // 회원가입/비밀번호
    WEAK_PW("WEAK_PW", "약한 비밀번호입니다."),
    INVALID_EMAIL_DOMAIN("INVALID_EMAIL_DOMAIN", "허용되지 않은 이메일 도메인입니다."),

    // 인증 코드
    INVALID_CODE("INVALID_CODE", "잘못된 인증코드입니다."),
    INVALID_VERIFICATION("INVALID_VERIFICATION", "유효하지 않은 인증입니다."),
    EMAIL_SEND_FAILED("EMAIL_SEND_FAILED", "이메일 전송 실패"),

    // 파라미터
    PARAM_MISSING("PARAM_MISSING", "필수 파라미터가 누락되었습니다."),

    // 스터디 세션 관련
    INTERNAL_SERVER_ERROR("INTERNAL_SERVER_ERROR", "서버 내부 오류가 발생했습니다."),
    SESSION_NOT_FOUND("SESSION_NOT_FOUND", "스터디 세션을 찾을 수 없습니다."),
    SESSION_ALREADY_ENDED("SESSION_ALREADY_ENDED", "스터디 세션이 이미 종료되었습니다."),
    INVALID_SESSION_STATE("INVALID_SESSION_STATE", "유효하지 않은 세션 상태입니다."),
    STUDY_LOG_NOT_FOUND("STUDY_LOG_NOT_FOUND", "스터디 로그를 찾을 수 없습니다."),
    DISTRACTION_LOG_NOT_FOUND("DISTRACTION_LOG_NOT_FOUND", "집중 방해 로그를 찾을 수 없습니다.");

    private final String code;
    private final String defaultMessage;

    ErrorCode(String code, String defaultMessage) {
        this.code = code;
        this.defaultMessage = defaultMessage;
    }

    public String getCode() {
        return code;
    }

    public String getDefaultMessage() {
        return defaultMessage;
    }
}