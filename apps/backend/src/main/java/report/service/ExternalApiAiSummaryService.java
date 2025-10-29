package report.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class ExternalApiAiSummaryService implements AiSummaryService {

    private final WebClient webClient;

    public ExternalApiAiSummaryService(WebClient.Builder webClientBuilder,
                                       @Value("${ai.api.url}") String apiUrl) {
        // application.yml 의 ai.api.url: http://127.0.0.1:8000
        this.webClient = webClientBuilder.baseUrl(apiUrl).build();
    }

    @Override
    public String summarize(String text) {
        if (text == null || text.isBlank()) {
            return "요약할 학습 내용이 없습니다.";
        }

        try {
            // FastAPI /summarize 엔드포인트에 전송할 요청 본문
            Map<String, Object> requestBody = Map.of("textToSummarize", text);

            Map<String, Object> response = webClient.post()
                    .uri("/summarize")                      // ✅ FastAPI 엔드포인트
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();                               // 동기 호출

            // FastAPI가 {"aisummary": "..."} 형태로 반환
            if (response != null && response.containsKey("aisummary")) {
                return (String) response.get("aisummary");
            }
            return "AI 요약 응답이 비어 있습니다.";

        } catch (Exception e) {
            System.err.println("AI Summary API 호출 실패: " + e.getMessage());
            return "AI 요약 생성에 실패했습니다.";
        }
    }
}
