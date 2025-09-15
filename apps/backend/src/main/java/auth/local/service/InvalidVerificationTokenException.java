package auth.local.service;

public class InvalidVerificationTokenException extends RuntimeException {
    public InvalidVerificationTokenException() {
        super("유효하지 않은 인증");
    }
    public InvalidVerificationTokenException(String message) {
        super(message);
    }
}
