package user.domain;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

import user.domain.Interest;
import user.domain.Role;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("users")
public class User {

    @Id
    private String id;

    // 로컬/소셜 공용 식별용(이메일 로그인 정책이면 unique)
    // 소셜만 사용하는 경우 email 미제공도 있으니 sparse 권장
    @Indexed(unique = true, sparse = true)
    private String email;

    // 로컬 로그인 전용 ID(닉네임/아이디). 소셜은 null 허용
    @Indexed(unique = true, sparse = true)
    private String userId;

    // 표시명(로컬: 가입 시 입력, 소셜: 프로필 닉네임)
    private String userName;

    // 로컬 전용(소셜은 null) — 저장 전 반드시 인코딩된 값으로
    private String password;

    // 권한(멘토/멘티/관리자 등)
    private Role role;

    private List<Interest> interests;

    // 소셜 전용 메타
    private Provider provider;          // LOCAL, KAKAO, GOOGLE ...
    @Indexed(sparse = true)
    private String providerUserId;      // ex) 카카오 id

    // 약관 동의(로컬/소셜 공용)
    private List<Consent> consents;

    @CreatedDate
    private Instant createdAt;
    @LastModifiedDate
    private Instant updatedAt;
    private Instant lastLoginAt;

    private boolean emailVerified;

}