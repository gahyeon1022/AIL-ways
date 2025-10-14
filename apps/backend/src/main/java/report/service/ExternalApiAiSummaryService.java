package report.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;


import java.util.Map;

@Service
public class ExternalApiAiSummaryService implements AiSummaryService {

    private final WebClient webClient;
    private final String apiKey;

    // 생성자를 통해 WebClient와 application.properties에서 설정한 API 키를 주입받습니다.
    public ExternalApiAiSummaryService(WebClient.Builder webClientBuilder,
                                       @Value("${ai.api.url}") String apiUrl,
                                       @Value("${ai.api.key:dummy-key}") String apiKey) { //키 아직 없음 -> 더미키 임시
        this.webClient = webClientBuilder.baseUrl(apiUrl).build();
        this.apiKey = apiKey;
    }

    @Override
    public String summarize(String text) {
        if (text == null || text.isBlank()) {
            return "요약할 학습 내용이 없습니다.";
        }

        // AI API에 보낼 요청 본문(Body)을 구성합니다.
        // 실제 API 명세에 따라 모델명, 메시지 구조 등은 변경될 수 있습니다.
        String prompt = "다음 학습 내용을 한두 문장으로 요약해줘:\n\n" + text;

        Map<String, Object> requestBody = Map.of(
                "model", "gpt-3.5-turbo", // 예시: 사용하는 AI 모델명
                "messages", new Object[] { Map.of("role", "user", "content", prompt) },
                "temperature", 0.7
        );

        try {
            // API를 호출하고 응답을 동기적으로 받아옵니다.
            // 실제 프로덕션 환경에서는 비동기 처리를 고려하는 것이 좋습니다.
            Map<String, Object> response = webClient.post()
                    .uri("/chat/completions") // 예시: API의 세부 경로
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block(); // 동기적으로 결과를 기다림

            // API 응답 구조에 맞게 요약된 텍스트를 파싱합니다.
            // 이 부분은 사용하는 AI 서비스의 실제 응답 JSON 구조를 보고 맞춰야 합니다.
            // 예: ((java.util.List<Map<String, Object>>) response.get("choices")).get(0).get("message").get("content")
            return (String) ((Map<String, Object>) ((java.util.List<Map<String, Object>>) response.get("choices")).get(0).get("message")).get("content");

        } catch (Exception e) {
            // API 호출 실패 시 로그를 남기고 기본 메시지를 반환합니다.
            System.err.println("AI Summary API call failed: " + e.getMessage());
            return "AI 요약 생성에 실패했습니다.";
        }
    }
}