package auth.local.dto;

import lombok.Getter;
import lombok.Setter;
import user.domain.Provider;
import user.dto.ConsentDTO;

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
    private Provider provider;

}
