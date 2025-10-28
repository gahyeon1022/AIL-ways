package app.session;

import app.support.IntegrationTestSupport;
import board.domain.Board;
import board.domain.EntryStatus;
import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import report.domain.Report;
import user.domain.Role;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class qSessionAndReportIntegrationTest extends IntegrationTestSupport {

    @Test
    void sessionLifecycle_shouldGenerateReportAndBoardEntries() throws Exception {
        String mentorId = "mentor" + UUID.randomUUID().toString().substring(0, 6);
        String mentorPw = "Mentor123!";
        String menteeId = "mentee" + UUID.randomUUID().toString().substring(0, 6);
        String menteePw = "Mentee123!";

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
                        .andReturn()
        ).path("matchId").asText();

        mockMvc.perform(post("/api/matches/{matchId}/accept", matchId)
                        .header("Authorization", bearer(mentorToken)))
                .andExpect(status().isOk());

        Board board = boardRepository.findByMatchId(matchId)
                .orElseThrow(() -> new AssertionError("매칭 수락 이후 보드를 찾을 수 없습니다."));

        String sessionId = extractDataNode(
                mockMvc.perform(post("/api/sessions/start")
                                .header("Authorization", bearer(menteeToken))
                                .param("matchId", matchId)
                                .param("mentorUserId", mentorId))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                        .andReturn()
        ).path("sessionId").asText();

        mockMvc.perform(post("/api/sessions/{sessionId}/studyLogs", sessionId)
                        .header("Authorization", bearer(menteeToken))
                        .param("content", "정렬 알고리즘 복습"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.studyLogs[0].content").value("정렬 알고리즘 복습"));

        mockMvc.perform(post("/api/sessions/{sessionId}/questionLogs", sessionId)
                        .header("Authorization", bearer(menteeToken))
                        .param("question", "해시맵 충돌 처리는 어떻게 하나요?"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.questionLogs[0].question").value("해시맵 충돌 처리는 어떻게 하나요?"));

        mockMvc.perform(post("/api/sessions/{sessionId}/distractions", sessionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"activity": "휴대폰 확인", "detectionType": "VISION_AI"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PAUSED"));

        mockMvc.perform(post("/api/sessions/{sessionId}/distractions/selfFeedback", sessionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"comment": "다시 집중하겠습니다", "createdAt": "%s"}
                                """.formatted(Instant.now().toString())))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/sessions/{sessionId}/resume", sessionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));

        mockMvc.perform(post("/api/sessions/{sessionId}/end", sessionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ENDED"));

        Report report = reportRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new AssertionError("리포트가 생성되지 않았습니다."));
        assertThat(report.getMatchId()).isEqualTo(matchId);
        assertThat(report.getAiSummary()).isEqualTo("요약 결과");
        assertThat(report.getDistractionLogs()).isNotEmpty();

        Board updatedBoard = boardRepository.findById(board.getId())
                .orElseThrow(() -> new AssertionError("보드를 다시 조회할 수 없습니다."));
        assertThat(updatedBoard.getEntries()).isNotEmpty();
        assertThat(updatedBoard.getEntries().get(updatedBoard.getEntries().size() - 1).getStatus())
                .isEqualTo(EntryStatus.INCOMPLETE);

        JsonNode reportList = extractDataNode(
                mockMvc.perform(get("/api/reports/by-match/{matchId}", matchId)
                                .header("Authorization", bearer(menteeToken)))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.data").isArray())
                        .andReturn()
        );

        String reportId = reportList.get(0).path("id").asText();
        assertThat(reportId).isEqualTo(report.getId());

        mockMvc.perform(post("/api/reports/{reportId}/feedback", reportId)
                        .header("Authorization", bearer(mentorToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"comment": "수고 많았어요"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.mentorFeedback.comment").value("수고 많았어요"));

        mockMvc.perform(get("/api/reports/{reportId}", reportId)
                        .header("Authorization", bearer(mentorToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.mentorFeedback.comment").value("수고 많았어요"));
    }
}
