package auth.local.domain;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Setter
@Getter
@Document("local_credentials")
public class LocalCredentials {
    // getter/setter
    @Id
    private String id;

    private String emailForLogin;
    private String userId;
    private String pwHash;
    private String userRef; // User._id 참조

}
