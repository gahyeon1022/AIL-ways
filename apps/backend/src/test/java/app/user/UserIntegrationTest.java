package app.user;

import app.support.IntegrationTestSupport;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import user.domain.Interest;
import user.domain.Role;
import user.domain.User;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class UserIntegrationTest extends IntegrationTestSupport {

    @Test
    void getMyProfile_shouldReturnAuthenticatedUser() throws Exception {
        String userId = "user" + UUID.randomUUID().toString().substring(0, 8);
        String password = "StrongPassw0rd!";
        createUser(randomEmail(), userId, "사용자", password, Role.MENTEE);

        String accessToken = obtainAccessToken(userId, password);

        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", bearer(accessToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.userId").value(userId))
                .andExpect(jsonPath("$.error").doesNotExist());
    }

    @Test
    void updateProfile_shouldPersistRoleAndInterests() throws Exception {
        String userId = "profile" + UUID.randomUUID().toString().substring(0, 8);
        String password = "ProfilePass!1";
        createUser(randomEmail(), userId, "프로필 유저", password, null);

        String token = obtainAccessToken(userId, password);

        mockMvc.perform(patch("/api/users/me/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", bearer(token))
                        .content("""
                                {
                                  "role": "MENTEE",
                                  "interests": ["AI", "BACKEND"]
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.role").value("MENTEE"))
                .andExpect(jsonPath("$.data.interests[0]").value("AI"));

        User updated = userRepository.findByUserId(userId)
                .orElseThrow(() -> new AssertionError("업데이트된 사용자를 찾을 수 없습니다."));
        assertThat(updated.getRole()).isEqualTo(Role.MENTEE);
        assertThat(updated.getInterests())
                .containsExactlyInAnyOrder(Interest.AI, Interest.BACKEND);
    }

    @Test
    void profileOptions_andAllUsers_shouldBeAccessible() throws Exception {
        String userId = "list" + UUID.randomUUID().toString().substring(0, 8);
        String password = "ListUserPass!1";
        createUser(randomEmail(), userId, "목록 유저", password, Role.MENTOR);

        String token = obtainAccessToken(userId, password);

        mockMvc.perform(get("/api/users/profile-options")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.roles").isArray())
                .andExpect(jsonPath("$.data.roles",
                        Matchers.hasItem(Role.MENTOR.name())))
                .andExpect(jsonPath("$.data.interests",
                        Matchers.hasItem(Interest.AI.name())));

        mockMvc.perform(get("/api/users")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].userId").value(userId));
    }
}
