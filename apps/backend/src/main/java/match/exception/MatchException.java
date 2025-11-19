package match.exception;

import common.dto.ErrorCode;
import lombok.Getter;

@Getter
public class MatchException extends RuntimeException {

    private final ErrorCode errorCode;

    public MatchException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }
}