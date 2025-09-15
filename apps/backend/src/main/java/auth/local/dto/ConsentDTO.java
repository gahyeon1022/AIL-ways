package auth.local.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Setter
@Getter
public class ConsentDTO {
    private String type;
    private boolean agreed;
    private Instant agreedAt;

}
