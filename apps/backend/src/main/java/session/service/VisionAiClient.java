package session.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class VisionAiClient {

    private final RestTemplate restTemplate;
    private final VisionAiProperties properties;

    /**
     * Vision AI 서버에 프레임을 전달해 딴짓 여부를 판별합니다.
     * 감지된 경우 activity/detectionType을 반환하고, 감지되지 않았거나 연동이 비활성화된 경우 빈 Optional을 반환합니다.
     */
    public Optional<DetectedDistraction> detectDistraction(String sessionId, MultipartFile frame) {
        if (!properties.isEnabled() || !StringUtils.hasText(properties.getBaseUrl())) {
            return Optional.empty();
        }

        try {
            ByteArrayResource resource = new ByteArrayResource(frame.getBytes()) {
                @Override
                public String getFilename() {
                    String original = frame.getOriginalFilename();
                    return (original != null && !original.isBlank()) ? original : "frame.jpg";
                }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", resource);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));

            HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);

            String url = buildAnalyzeUrl(sessionId);
            ResponseEntity<VisionAiResponse> response = restTemplate.postForEntity(url, request, VisionAiResponse.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody()
                        .detectedActivity()
                        .map(activity -> new DetectedDistraction(activity, "VISION_AI"));
            }
        } catch (IOException e) {
            log.warn("Failed to read frame for Vision AI detection", e);
        } catch (Exception e) {
            log.warn("Vision AI detection failed for session {}", sessionId, e);
        }

        return Optional.empty();
    }

    private String buildAnalyzeUrl(String sessionId) {
        String raw = properties.getBaseUrl().trim();
        String base = raw.endsWith("/") ? raw.substring(0, raw.length() - 1) : raw;
        return base + "/analyze-frame/" + sessionId;
    }

    public record DetectedDistraction(String activity, String detectionType) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record VisionAiResponse(
            boolean phone,
            boolean drowsy,
            @JsonProperty("left_seat") boolean leftSeat,
            String activity
    ) {
        public Optional<String> detectedActivity() {
            if (activity != null && !activity.isBlank()) {
                return Optional.of(activity);
            }
            if (phone) {
                return Optional.of("스마트폰 사용");
            }
            if (drowsy) {
                return Optional.of("졸음 감지");
            }
            if (leftSeat) {
                return Optional.of("자리 이탈");
            }
            return Optional.empty();
        }
    }
}
