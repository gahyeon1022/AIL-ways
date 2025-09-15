package auth.local.service;

public class EmailTakenException extends RuntimeException {
    public EmailTakenException() {
        super("이미 사용 중인 이메일입니다.");
    }
}
