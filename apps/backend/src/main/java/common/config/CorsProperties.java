package common.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.cors")
public class CorsProperties {
    private List<String> allowedOrigins = List.of();
    private String allowedMethods = "GET,POST,PUT,DELETE,OPTIONS";
    private String allowedHeaders = "*";
    private boolean allowCredentials = true;
}
