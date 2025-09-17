package auth.local.domain;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Getter
@Setter
@Document("email_codes") // MongoDB 컬렉션 이름
public class EmailCode {

    @Id
    private String id;

    private String email;
    private String code;

    private boolean used;
    private int attempts;

    // ✅ expireAfterSeconds=0 → expireAt 시간이 되면 MongoDB가 자동 삭제
    @Indexed(name = "expireAtIndex", expireAfterSeconds = 0)
    private Instant expireAt;
}
