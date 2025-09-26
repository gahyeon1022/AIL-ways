package auth.local.controller;

import auth.local.domain.LocalCredentials;
import auth.local.repository.LocalCredentialsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import user.domain.User;
import user.dto.UpdateProfileRequest;
import user.repository.UserRepository;
import user.service.UserService;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    // userRepository와 함께 userService를 주입받음
    private final UserRepository userRepository;
    private final UserService userService;

    // 전체 조회: GET /users
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // GET /users/{userId}
    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserByUserId(@PathVariable String userId) {
        return userRepository.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{userId}/profile")
    public ResponseEntity<User> updateUserProfile(
            @PathVariable String userId,
            @RequestBody UpdateProfileRequest req) {

        try {
            User updatedUser = userService.updateUserProfile(userId, req.getInterests(), req.getRole());
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @Autowired //자동 DI주입, 스프링부트가 객체 생성함
    private UserRepository userRepo;
    @Autowired
    private LocalCredentialsRepository credRepo;
    @Autowired
    private PasswordEncoder encoder;

    @PostMapping("/test")
    public User insertTestUser() {
        User u = new User();
        u.setEmail("test@example.com");
        u.setUserId("test123");
        u.setUserName("홍길동");
        u.setEmailVerified(true);
        u.setCreatedAt(Instant.now());
        u = userRepo.save(u);

        LocalCredentials cred = new LocalCredentials();
        cred.setEmailForLogin(u.getEmail());
        cred.setUserId(u.getUserId());
        cred.setPwHash(encoder.encode("test123"));
        cred.setUserRef(u.getId());
        credRepo.save(cred);

        return u;
    }
}
