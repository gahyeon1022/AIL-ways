package auth.local.exception;

import common.dto.ApiResponse;
import common.dto.ApiError;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class LocalAuthExceptionHandler {

    @ExceptionHandler(WeakPasswordException.class)
    public ApiResponse<?> weakPw() {
        return ApiResponse.error(new ApiError("WEAK_PW", "약한 비밀번호"));
    }

    @ExceptionHandler(EmailTakenException.class)
    public ApiResponse<?> emailTaken() {
        return ApiResponse.error(new ApiError("EMAIL_TAKEN", "중복 이메일"));
    }

    @ExceptionHandler(UserIdTakenException.class)
    public ApiResponse<?> userIdTaken() {
        return ApiResponse.error(new ApiError("USERID_TAKEN", "중복 아이디"));
    }

    @ExceptionHandler(EmailSendFailedException.class)
    public ApiResponse<?> emailSendFailed() {
        return ApiResponse.error(new ApiError("EMAIL_SEND_FAILED", "이메일 전송 실패"));
    }

    @ExceptionHandler(InvalidCodeException.class)
    public ApiResponse<?> invalidCode() {
        return ApiResponse.error(new ApiError("INVALID_CODE", "잘못된 인증코드"));
    }

    @ExceptionHandler(InvalidVerificationTokenException.class)
    public ApiResponse<?> invalidToken() {
        return ApiResponse.error(new ApiError("INVALID_VERIFICATION", "유효하지 않은 인증"));
    }

    @ExceptionHandler(InvalidEmailDomainException.class)
    public ApiResponse<?> invalidDomain(InvalidEmailDomainException ex) {
        return ApiResponse.error(new ApiError("INVALID_EMAIL_DOMAIN", ex.getMessage()));
    }
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ApiResponse<?> handleMissingParams(MissingServletRequestParameterException ex) {
        String name = ex.getParameterName();
        return ApiResponse.error(new ApiError("PARAM_MISSING", String.format("필수 파라미터 '%s'가 누락되었습니다.", name)));
    }
}

