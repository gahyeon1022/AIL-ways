package common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoRepositories(basePackages = {"auth.local.repository","user.repository", "board.repository", "match.repository", "report.repository"})
@EnableMongoAuditing
public class MongoConfig {
}