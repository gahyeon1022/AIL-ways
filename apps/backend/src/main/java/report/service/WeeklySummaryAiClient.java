package report.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Component
@Slf4j
public class WeeklySummaryAiClient {

    private static final String FAILURE_MESSAGE = "주간 요약을 생성하지 못했습니다.";

    private final WebClient webClient;
    private final String apiKey;
    private final Duration timeout;

    public WeeklySummaryAiClient(
            WebClient.Builder webClientBuilder,
            @Value("${ai.weekly.api.url:http://127.0.0.1:8001}") String apiUrl,
            @Value("${OPENAI_API_KEY}") String apiKey,
            @Value("${ai.weekly.api.timeout-seconds:30}") long timeoutSeconds
    ) {
        this.webClient = webClientBuilder
                .baseUrl(apiUrl)
                .build();
        this.apiKey = apiKey;
        this.timeout = Duration.ofSeconds(timeoutSeconds);
    }

    public String summarize(Map<String, Double> studyHours,
                            double totalHours,
                            int focusMe,
                            int focusAvg) {
        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("study_hours", studyHours);
            requestBody.put("total_hours", totalHours);
            requestBody.put("focus_me", focusMe);
            requestBody.put("focus_avg", focusAvg);

            WebClient.RequestHeadersSpec<?> request = webClient.post()
                    .uri("/analyze-weekly")
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(requestBody);

            if (apiKey != null && !apiKey.isBlank()) {
                request = request.header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey);
            }

            Map<String, Object> response = request.retrieve()
                    .bodyToMono(Map.class)
                    .block(timeout);

            if (response == null) {
                log.error("주간 요약 응답이 비었습니다.");
                return FAILURE_MESSAGE;
            }

            String summary = extractSummaryFromResponse(response);
            if (summary != null && !summary.isBlank()) {
                return summary.trim();
            }

            log.error("주간 요약 응답 포맷이 예상과 다릅니다. response={}", response);
            return FAILURE_MESSAGE;
        } catch (Exception e) {
            log.error("주간 요약 AI 호출 실패", e);
            return FAILURE_MESSAGE;
        }
    }

    private String extractSummaryFromResponse(Map<String, Object> response) {
        // 1) 직접 aisummary 필드를 반환하는 경우 ({ "aisummary": "..." })
        Object direct = response.get("aisummary");
        if (direct instanceof String directStr) {
            return directStr;
        }

        // 2) data.ai_summary 형태 ({ "data": { "ai_summary": "..." } })
        Object data = response.get("data");
        if (data instanceof Map<?, ?> dataMap) {
            Object nested = dataMap.get("ai_summary");
            if (nested instanceof String nestedStr) {
                return nestedStr;
            }
            // FastAPI 기본 직렬화 시 키가 aisummary로 내려올 수도 있으므로 둘 다 체크
            Object nestedAlt = dataMap.get("aisummary");
            if (nestedAlt instanceof String altStr) {
                return altStr;
            }
        }

        return null;
    }
}
