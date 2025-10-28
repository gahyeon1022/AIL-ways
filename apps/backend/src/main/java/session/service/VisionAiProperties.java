package session.service;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "ai.vision")
public class VisionAiProperties {
    /**
     * Vision AI 서버의 베이스 URL (예: http://localhost:8000).
     */
    private String baseUrl;

    /**
     * Vision AI 연동 사용 여부. 기본값은 비활성화.
     */
    private boolean enabled = false;
}
