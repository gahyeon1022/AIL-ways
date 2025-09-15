package user.domain;

import auth.local.domain.Consent;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Setter
@Getter
@Document("users")
public class User {
    // getters/setters
    @Id
    private String id;

    private String email;
    private String userId;
    private String userName;

    private Instant createdAt;

    private List<Consent> consents;

}
