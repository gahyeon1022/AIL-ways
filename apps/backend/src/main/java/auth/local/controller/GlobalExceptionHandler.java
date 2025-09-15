package auth.local.controller;

import auth.local.service.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(WeakPasswordException.class)
    public ResponseEntity<Map<String,String>> weakPw() {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("code","WEAK_PW","message","약한 비밀번호"));
    }

    @ExceptionHandler(EmailTakenException.class)
    public ResponseEntity<Map<String,String>> emailTaken() {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("code","EMAIL_TAKEN","message","중복 이메일"));
    }

    @ExceptionHandler(UserIdTakenException.class)
    public ResponseEntity<Map<String,String>> userIdTaken() {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("code","USERID_TAKEN","message","중복 아이디"));
    }

    @ExceptionHandler(EmailSendFailedException.class)
    public ResponseEntity<Map<String,String>> emailSendFailed() {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("code","EMAIL_SEND_FAILED","message","이메일 전송 실패"));
    }

    @ExceptionHandler(InvalidCodeException.class)
    public ResponseEntity<Map<String,String>> invalidCode() {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("code","INVALID_CODE","message","잘못된 인증코드"));
    }

    @ExceptionHandler(InvalidVerificationTokenException.class)
    public ResponseEntity<Map<String,String>> invalidToken() {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("code","INVALID_VERIFICATION","message","유효하지 않은 인증"));
    }

    @ExceptionHandler(InvalidEmailDomainException.class)
    public ResponseEntity<Map<String,String>> invalidDomain(InvalidEmailDomainException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("code","INVALID_EMAIL_DOMAIN","message", ex.getMessage()));
    }
}
