package auth.local.exception;

public class UserIdTakenException extends RuntimeException {
    public UserIdTakenException() {
        super("이미 사용 중인 아이디입니다.");
    }
}
