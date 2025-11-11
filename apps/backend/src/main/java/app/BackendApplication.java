package app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication (
        scanBasePackages = { "app", "auth", "user", "common", "board", "match", "report" , "session"}//app과 동등한 위치 패키지 생성시마다 추가필수
)  // 전부 스캔
public class BackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
        System.out.println("🧩 MONGO_URI_PROPERTY=" + System.getProperty("spring.data.mongodb.uri"));

    }
}