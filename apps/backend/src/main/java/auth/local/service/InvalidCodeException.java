package auth.local.service;

public class InvalidCodeException extends RuntimeException {
    public InvalidCodeException() {
        super("잘못된 인증코드");
    }
    public InvalidCodeException(String message) {
        super(message);
    }
}
