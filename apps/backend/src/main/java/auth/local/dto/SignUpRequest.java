package auth.local.dto;

import lombok.Getter;
import lombok.Setter;
import user.dto.ConsentDTO;

import java.time.Instant;
import java.util.List;

@Setter
@Getter
public class SignUpRequest {
    private String email;
    private String userName;
    private String userId;
    private String userPw;
    private Instant createdAt;
    private String code; // ✅ 사용자가 입력한 이메일 인증번호

    private List<ConsentDTO> consents;
}
