package auth.local.domain;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Setter
@Getter
public class Consent {
    private ConsentType type;
    private boolean agreed;
    private Instant agreedAt;

}
