package auth.local.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import user.domain.User;
import user.repository.UserRepository;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/users")           // 베이스 경로
public class UserController {
    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ✅ 전체 조회: GET /users
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ✅ 단일 조회: GET /users/{userId}
    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserByUserId(@PathVariable String userId) {
        return userRepository.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // (옵션) 더미 생성: POST /users/test
    @PostMapping("/test")
    public User insertTestUser() {
        User u = new User();
        u.setEmail("test@example.com");
        u.setUserId("test123");
        u.setUserName("홍길동");
        u.setCreatedAt(Instant.now());
        return userRepository.save(u);
    }
}
