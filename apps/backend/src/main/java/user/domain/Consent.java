package user.domain;

import lombok.Getter;

import java.time.Instant;

@Getter
public class Consent {
    private ConsentType type;
    private boolean agreed;
    private Instant agreedAt;

    public void setType(ConsentType type) { this.type = type; }

    public void setAgreed(boolean agreed) { this.agreed = agreed; }

    public void setAgreedAt(Instant agreedAt) { this.agreedAt = agreedAt; }
}
