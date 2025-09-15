package auth.local;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication(
        scanBasePackages = {
                "auth.local",   // 현재 서비스/컨트롤러/도메인
                "user"          // user.domain / user.repository
        }
)
@EnableMongoRepositories(basePackages = {
        "auth.local.repository",   // 🔹 이 줄 추가
        "user.repository"
})
public class AlphaApplication {
    public static void main(String[] args) {
        SpringApplication.run(AlphaApplication.class, args);
    }
}
