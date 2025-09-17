package auth.local.domain;

import lombok.Getter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Getter
@Document("email_verifications")
public class EmailVerification {
    // getter/setter
    @Id
    private String id;

    private String email;
    private String token;
    private boolean used = false;

    @Indexed(expireAfterSeconds = 900) // 15분 TTL
    private Instant expireAt;

    public void setId(String id) { this.id = id; }

    public void setEmail(String email) { this.email = email; }

    public void setToken(String token) { this.token = token; }

    public void setUsed(boolean used) { this.used = used; }

    public void setExpireAt(Instant expireAt) { this.expireAt = expireAt; }

}
