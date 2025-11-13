package app.board;

import app.support.IntegrationTestSupport;
import board.domain.Board;
import board.domain.EntryStatus;
import com.fasterxml.jackson.databind.JsonNode;
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

        JsonNode mentorCommentData = extractDataNode(
                mockMvc.perform(post("/api/boards/{boardId}/entries/{entryId}/comments", board.getId(), entryId)
                                .header("Authorization", bearer(mentorToken))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {"comment": "열심히 해봅시다!"}
                                        """))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.data.entries[0].comments[0].content").value("열심히 해봅시다!"))
                        .andReturn()
        );
        String mentorCommentId = mentorCommentData.path("entries").get(0).path("comments").get(0).path("commentId").asText();

        JsonNode menteeReplyData = extractDataNode(
                mockMvc.perform(post("/api/boards/{boardId}/entries/{entryId}/comments", board.getId(), entryId)
                                .header("Authorization", bearer(menteeToken))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                          "comment": "이 부분은 더 궁금해요.",
                                          "parentCommentId": "%s"
                                        }
                                        """.formatted(mentorCommentId)))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.data.entries[0].comments[0].replies[0].content").value("이 부분은 더 궁금해요."))
                        .andReturn()
        );
        String menteeReplyId = menteeReplyData.path("entries").get(0)
                .path("comments").get(0)
                .path("replies").get(0)
                .path("commentId").asText();

        mockMvc.perform(post("/api/boards/{boardId}/entries/{entryId}/comments", board.getId(), entryId)
                        .header("Authorization", bearer(mentorToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "comment": "추가 설명도 정리했어요.",
                                  "parentCommentId": "%s"
                                }
                                """.formatted(menteeReplyId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.entries[0].comments[0].replies[0].replies[0].content").value("추가 설명도 정리했어요."));

        mockMvc.perform(patch("/api/boards/{boardId}/entries/{entryId}/complete", board.getId(), entryId)
                        .header("Authorization", bearer(menteeToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.entries[0].status").value("COMPLETED"));

        mockMvc.perform(post("/api/boards/{boardId}/entries/{entryId}/comments", board.getId(), entryId)
                        .header("Authorization", bearer(mentorToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"comment": "완료 후에는 더 달 수 없어요."}
                                """))
                .andExpect(status().is4xxClientError());

        Board updatedBoard = boardRepository.findById(board.getId())
                .orElseThrow(() -> new AssertionError("보드를 다시 조회할 수 없습니다."));

        updatedBoard.getEntries().stream()
                .filter(entry -> entry.getEntryId().equals(entryId))
                .findFirst()
                .ifPresentOrElse(
                        savedEntry -> {
                            assertThat(savedEntry.getStatus()).isEqualTo(EntryStatus.COMPLETED);
                            assertThat(savedEntry.getComments()).hasSize(1);
                            assertThat(savedEntry.getComments().get(0).getContent()).isEqualTo("열심히 해봅시다!");
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
