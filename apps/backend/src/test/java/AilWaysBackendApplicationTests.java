import app.BackendApplication;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(classes = BackendApplication.class, properties = "MONGO_DB_URI=mongodb://localhost:27017/test")
class AilWaysBackendApplicationTests {

    @Test
    void contextLoads() {
    }
}
