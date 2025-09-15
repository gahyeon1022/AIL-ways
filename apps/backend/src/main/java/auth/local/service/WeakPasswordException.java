package auth.local.service;

public class WeakPasswordException extends RuntimeException {
    public WeakPasswordException() {
        super("비밀번호가 안전하지 않습니다.");
    }
}
