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

    @Schema(description = "에러 메시지", example = "해당 유저를 찾을 수 없습니다.")
    private String message;
}