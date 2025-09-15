import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"auth", "common"})
public class AilWaysBackendApplication {
	public static void main(String[] args) {
		SpringApplication.run(AilWaysBackendApplication.class, args);
	}
}
