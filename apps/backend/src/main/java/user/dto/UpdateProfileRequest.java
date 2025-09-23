package user.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class UpdateProfileRequest {
    private List<String> interests;
    private String role; // ✅ 역할 필드 추가 (String으로 받음)
}