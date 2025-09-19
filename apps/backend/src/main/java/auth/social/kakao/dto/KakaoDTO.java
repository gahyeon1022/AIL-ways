package auth.social.kakao.dto;

import lombok.Getter;

public class KakaoDTO {

    @Getter
    public static class OAuthToken {
        private String accessToken;
        private String tokenType;
        private String refreshToken;
        private int expiresIn;
        private String scope;
        private int refreshTokenExpiresIn;
    }

    @Getter
    public static class KakaoProfile {
        private Long id;
        private String connectedAt;
        private Properties properties;
        private KakaoAccount kakaoAccount;

        @Getter
        public class Properties {
            private String nickname;
        }

        @Getter
        public class KakaoAccount {
            private String email;
            private Boolean isEmailVerified;
            private Boolean hasEmail;
            private Boolean profileNicknameNeedsAgreement;
            private Boolean emailNeedsAgreement;
            private Boolean isEmailValid;
            private Profile profile;

            @Getter
            public class Profile {
                private String nickname;
                private Boolean isDefaultNickname;
            }
        }
    }
}
