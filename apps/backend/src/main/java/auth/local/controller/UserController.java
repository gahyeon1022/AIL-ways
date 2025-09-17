package auth.local.controller;

import user.domain.User;
import user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping        // ← GET /users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping("/test")   // ← POST /users/test (더미 데이터 넣기)
    public User insertTestUser() {
        User u = new User();
        u.setEmail("test@example.com");
        u.setUserId("test123");
        u.setUserName("홍길동");
        u.setCreatedAt(Instant.now());
        return userRepository.save(u);
    }
}


