//package common.exception;
//
//import common.dto.ApiError;
//import common.dto.ApiResponse;
//import common.dto.ErrorCode;
//import org.springframework.web.bind.annotation.ExceptionHandler;
//import org.springframework.web.bind.annotation.RestControllerAdvice;
//
//@RestControllerAdvice
//public class GlobalExceptionHandler {
//
//    // 잘못된 요청 (입력값, 상태 불일치 등)
//    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
//    public ApiResponse<?> handleBadRequest(RuntimeException e) {
//        return ApiResponse.error(new ApiError(ErrorCode.INVALID_REQUEST, e.getMessage()));
//    }
//
//    // 그 외 모든 예외 (예상치 못한 서버 오류)
//    @ExceptionHandler(Exception.class)
//    public ApiResponse<?> handleGeneralError(Exception e) {
//        return ApiResponse.error(new ApiError(ErrorCode.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다."));
//    }
//}