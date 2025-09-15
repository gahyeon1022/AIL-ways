package auth.local.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Setter
@Getter
public class SignUpResponse {
    // getter/setter
    private String email;
    private String userName;
    private String userId;
    private Instant createdAt;
    private List<ConsentDTO> consents;

}
