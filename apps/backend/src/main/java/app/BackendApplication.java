package app;

//import org.springframework.boot.SpringApplication;
//import org.springframework.boot.autoconfigure.SpringBootApplication;
//import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
//import org.springframework.data.mongodb.config.EnableMongoAuditing;
//
//@SpringBootApplication(
//        scanBasePackages = { "auth", "user", "common" } // 형제 패키지들 스캔
//)
//@EnableMongoRepositories(basePackages = "user.repository") // Mongo 리포지토리 위치
//@EnableMongoAuditing // @CreatedDate/@LastModifiedDate 쓰면 권장
//public class BackendApplication {
//    public static void main(String[] args) {
//        SpringApplication.run(BackendApplication.class, args);
//    }
//}


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
//import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

//@EnableMongoRepositories(basePackages = "user.repository") // Mongo 리포지토리 위치
//@EnableMongoAuditing // @CreatedDate/@LastModifiedDate 쓰면 권장
@SpringBootApplication (
        scanBasePackages = { "app", "auth", "user", "common" }
)  // 전부 스캔
public class BackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}