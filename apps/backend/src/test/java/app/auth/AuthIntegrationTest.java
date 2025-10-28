package app.auth;

import app.support.IntegrationTestSupport;
import auth.local.domain.EmailCode;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.startsWith;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthIntegrationTest extends IntegrationTestSupport {

    @Test
    void sendCode_shouldPersistVerificationRequest() throws Exception {
        String targetEmail = randomEmail();

        mockMvc.perform(post("/api/auth/email/code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email": "%s"}
                                """.formatted(targetEmail)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.ok").value(true));

        EmailCode latest = emailCodeRepository
                .findTopByEmailAndUsedIsFalseOrderByCreatedAtDesc(targetEmail.toLowerCase())
                .orElseThrow(() -> new AssertionError("인증코드가 저장되지 않았습니다."));

        assertThat(latest.getCode()).hasSize(6);
        assertThat(latest.isVerified()).isFalse();
    }

    @Test
    void signup_login_and_logout_flow_shouldSucceed() throws Exception {
        String email = randomEmail();
        String userId = "user" + UUID.randomUUID().toString().substring(0, 8);
        String password = "StrongPassw0rd!";

        mockMvc.perform(post("/api/auth/email/code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email": "%s"}
                                """.formatted(email)))
                .andExpect(status().isOk());

        EmailCode issuedCode = emailCodeRepository
                .findTopByEmailAndUsedIsFalseOrderByCreatedAtDesc(email.toLowerCase())
                .orElseThrow(() -> new AssertionError("발급된 인증코드를 찾을 수 없습니다."));

        mockMvc.perform(post("/api/auth/email/verify-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email": "%s", "code": "%s"}
                                """.formatted(email, issuedCode.getCode())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.verified").value(true));

        mockMvc.perform(post("/api/auth/local/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "userName": "테스트 유저",
                                  "userId": "%s",
                                  "userPw": "%s",
                                  "consents": [
                                    {"type": "TOS", "agreed": true},
                                    {"type": "PRIVACY", "agreed": true}
                                  ]
                                }
                                """.formatted(email, userId, password)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.userId").value(userId));

        MvcResult loginResult = mockMvc.perform(post("/api/auth/local/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"userId": "%s", "userPw": "%s"}
                                """.formatted(userId, password)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.refreshToken").isNotEmpty())
                .andReturn();

        String accessToken = extractDataNode(loginResult).path("accessToken").asText();

        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", bearer(accessToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(redisValueOperations).set(
                startsWith("BLOCKED:"),
                eq("logout"),
                anyLong(),
                eq(TimeUnit.MILLISECONDS)
        );

        assertThat(emailCodeRepository
                .findTopByEmailAndUsedIsFalseOrderByCreatedAtDesc(email.toLowerCase()))
                .isEmpty();
    }

    @Test
    void checkUserIdEndpoint_shouldReflectAvailability() throws Exception {
        String existingId = "existingUser";
        createUser(randomEmail(), existingId, "Existing User", "Password!1", null);

        mockMvc.perform(get("/api/auth/check-userid")
                        .param("userId", existingId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isAvailable").value(false));

        mockMvc.perform(get("/api/auth/check-userid")
                        .param("userId", "freshUser"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isAvailable").value(true));
    }
}
