package auth.local.exception;

public class EmailSendFailedException extends RuntimeException {
    public EmailSendFailedException() {
        super("이메일 전송 실패");
    }

    public EmailSendFailedException(String message) {
        super(message);
    }
}
