package app.board;

import app.support.IntegrationTestSupport;
import board.domain.Board;
import board.domain.EntryStatus;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import user.domain.Role;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class BoardIntegrationTest extends IntegrationTestSupport {

    @Test
    void boardFlow_shouldAllowMembersToManageEntries() throws Exception {
        String mentorId = "mentor" + UUID.randomUUID().toString().substring(0, 6);
        String mentorPw = "MentorPass!1";
        String menteeId = "mentee" + UUID.randomUUID().toString().substring(0, 6);
        String menteePw = "MenteePass!1";

        createUser(randomEmail(), mentorId, "멘토", mentorPw, Role.MENTOR);
        createUser(randomEmail(), menteeId, "멘티", menteePw, Role.MENTEE);

        String mentorToken = obtainAccessToken(mentorId, mentorPw);
        String menteeToken = obtainAccessToken(menteeId, menteePw);

        String matchId = extractDataNode(
                mockMvc.perform(post("/api/matches/request")
                                .header("Authorization", bearer(menteeToken))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {"mentorUserId": "%s"}
                                        """.formatted(mentorId)))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.data.status").value("PENDING"))
                        .andReturn()
        ).path("matchId").asText();

        mockMvc.perform(post("/api/matches/{matchId}/accept", matchId)
                        .header("Authorization", bearer(mentorToken)))
                .andExpect(status().isOk());

        Board board = boardRepository.findByMatchId(matchId)
                .orElseThrow(() -> new AssertionError("매칭 수락 이후 보드가 생성되지 않았습니다."));

        mockMvc.perform(get("/api/boards/{boardId}", board.getId())
                        .header("Authorization", bearer(menteeToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.memberUserIds",
                        Matchers.hasItems(mentorId, menteeId)));

        mockMvc.perform(get("/api/boards/by-users")
                        .param("userId1", mentorId)
                        .param("userId2", menteeId)
                        .header("Authorization", bearer(mentorToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.matchId").value(matchId));

        String entryId = extractDataNode(
                mockMvc.perform(post("/api/boards/{boardId}/entries", board.getId())
                                .header("Authorization", bearer(menteeToken))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                          "title": "첫 질문",
                                          "questionNote": "멘토님께 질문드리고 싶어요."
                                        }
                                        """))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.data.entries").isArray())
                        .andReturn()
        ).path("entries").get(0).path("entryId").asText();

        mockMvc.perform(post("/api/boards/{boardId}/entries/{entryId}/answer", board.getId(), entryId)
                        .header("Authorization", bearer(mentorToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"comment": "열심히 해봅시다!"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.entries[0].boardAnswer.comment").value("열심히 해봅시다!"));

        mockMvc.perform(patch("/api/boards/{boardId}/entries/{entryId}/complete", board.getId(), entryId)
                        .header("Authorization", bearer(mentorToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.entries[0].status").value("COMPLETED"));

        Board updatedBoard = boardRepository.findById(board.getId())
                .orElseThrow(() -> new AssertionError("보드를 다시 조회할 수 없습니다."));

        updatedBoard.getEntries().stream()
                .filter(entry -> entry.getEntryId().equals(entryId))
                .findFirst()
                .ifPresentOrElse(
                        savedEntry -> {
                            assertThat(savedEntry.getStatus()).isEqualTo(EntryStatus.COMPLETED);
                            assertThat(savedEntry.getBoardAnswer().getComment()).isEqualTo("열심히 해봅시다!");
                        },
                        () -> {
                            throw new AssertionError("게시글이 보드에 존재하지 않습니다.");
                        }
                );

        mockMvc.perform(get("/api/matches/myMentees")
                        .header("Authorization", bearer(mentorToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].userId").value(menteeId));

        mockMvc.perform(get("/api/matches/myMentors")
                        .header("Authorization", bearer(menteeToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].userId").value(mentorId));
    }
}
