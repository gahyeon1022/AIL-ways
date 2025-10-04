package common.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "에러 응답")
public class ApiError {

    @Schema(description = "에러 코드", example = "USER_NOT_FOUND")
    private String code;

    @Schema(description = "에러 메시지", example = "사용자를 찾을 수 없습니다.")
    private String message;

    // ErrorCode 기반 생성자
    public ApiError(ErrorCode errorCode) {
        this.code = errorCode.getCode();
        this.message = errorCode.getDefaultMessage();
    }

    public ApiError(ErrorCode errorCode, String customMessage) {
        this.code = errorCode.getCode();
        this.message = customMessage;
    }
}