package match.exception;

import common.dto.ApiError;
import common.dto.ApiResponse;
import match.controller.MatchController;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(assignableTypes = MatchController.class)
public class MatchExceptionHandler {

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MatchException.class)
    public ApiResponse<Void> handleMatchException(MatchException ex) {
        return ApiResponse.error(new ApiError(ex.getErrorCode(), ex.getMessage()));
    }
}
