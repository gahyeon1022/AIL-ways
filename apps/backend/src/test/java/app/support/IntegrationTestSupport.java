package app.support;

import app.BackendApplication;
import auth.local.domain.EmailCode;
import auth.local.domain.LocalCredentials;
import auth.local.repository.EmailCodeRepository;
import auth.local.repository.LocalCredentialsRepository;
import board.repository.BoardRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import common.security.jwt.JwtUtil;
import jakarta.mail.internet.MimeMessage;
import match.repository.MatchRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import report.repository.ReportRepository;
import report.service.AiSummaryService;
import session.repository.StudySessionRepository;
import user.domain.Provider;
import user.domain.Role;
import user.domain.User;
import user.repository.UserRepository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.when;

@SpringBootTest(classes = BackendApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public abstract class IntegrationTestSupport {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected LocalCredentialsRepository localCredentialsRepository;

    @Autowired
    protected EmailCodeRepository emailCodeRepository;

    @Autowired
    protected MatchRepository matchRepository;

    @Autowired
    protected BoardRepository boardRepository;

    @Autowired
    protected ReportRepository reportRepository;

    @Autowired
    protected StudySessionRepository studySessionRepository;

    @Autowired
    protected PasswordEncoder passwordEncoder;

    @Autowired
    protected JwtUtil jwtUtil;

    @MockBean
    protected RedisTemplate<String, String> redisTemplate;

    @MockBean
    protected JavaMailSender javaMailSender;

    @MockBean
    protected AiSummaryService aiSummaryService;

    protected ValueOperations<String, String> redisValueOperations;

    @BeforeEach
    void resetState() {
        reportRepository.deleteAll();
        studySessionRepository.deleteAll();
        boardRepository.deleteAll();
        matchRepository.deleteAll();
        emailCodeRepository.deleteAll();
        localCredentialsRepository.deleteAll();
        userRepository.deleteAll();

        reset(redisTemplate, javaMailSender, aiSummaryService);

        redisValueOperations = mock(ValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(redisValueOperations);
        when(redisValueOperations.get(anyString())).thenReturn(null);

        when(aiSummaryService.summarize(anyString())).thenReturn("요약 결과");

        when(javaMailSender.createMimeMessage()).thenReturn(mock(MimeMessage.class));
        doNothing().when(javaMailSender).send(any(SimpleMailMessage.class));
    }

    protected User createUser(String email,
                              String userId,
                              String userName,
                              String rawPassword,
                              Role role) {
        Instant now = Instant.now();

        User user = User.builder()
                .email(email)
                .userId(userId)
                .userName(userName)
                .userPw(passwordEncoder.encode(rawPassword))
                .role(role)
                .provider(Provider.LOCAL)
                .emailVerified(true)
                .createdAt(now)
                .updatedAt(now)
                .consents(new ArrayList<>())
                .interests(new ArrayList<>())
                .build();

        User saved = userRepository.save(user);

        LocalCredentials credentials = new LocalCredentials();
        credentials.setEmailForLogin(email);
        credentials.setUserId(userId);
        credentials.setPwHash(passwordEncoder.encode(rawPassword));
        credentials.setUserRef(saved.getId());
        localCredentialsRepository.save(credentials);

        return saved;
    }

    protected String obtainAccessToken(String userId, String rawPassword) throws Exception {
        String payload = """
                {
                  "userId": "%s",
                  "userPw": "%s"
                }
                """.formatted(userId, rawPassword);

        MvcResult result = mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/local/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andReturn();

        assertThat(result.getResponse().getStatus())
                .as("로그인 요청이 성공해야 토큰을 획득할 수 있습니다.")
                .isEqualTo(200);

        JsonNode data = extractDataNode(result);
        return data.path("accessToken").asText();
    }

    protected EmailCode createVerificationCode(String email, String code, boolean verified) {
        Instant now = Instant.now();
        EmailCode emailCode = new EmailCode();
        emailCode.setEmail(email.toLowerCase());
        emailCode.setCode(code);
        emailCode.setAttempts(0);
        emailCode.setUsed(false);
        emailCode.setCreatedAt(now);
        emailCode.setExpireAt(now.plusSeconds(300));
        emailCode.setVerified(verified);
        if (verified) {
            emailCode.setVerifiedAt(now);
        }
        return emailCodeRepository.save(emailCode);
    }

    protected String bearer(String token) {
        return "Bearer " + token;
    }

    protected JsonNode extractDataNode(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString())
                .path("data");
    }

    protected String randomEmail() {
        return "user-" + UUID.randomUUID() + "@example.com";
    }
}
