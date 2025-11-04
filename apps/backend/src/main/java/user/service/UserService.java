package user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // <<< 1. @Transactional 임포트
import user.domain.*;
import user.dto.ConsentDTO;
import user.repository.UserRepository;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional // <<< 1. 트랜잭션 보장을 위해 추가
    public User updateUserProfile(String userId, List<String> interestsStr, String roleStr) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        // <<< 3. 로직 단순화: 이미 프로필이 모두 설정되었는지 먼저 확인 (Guard Clause)
        if (user.getRole() != null && user.getInterests() != null && !user.getInterests().isEmpty()) {
            throw new IllegalStateException("이미 프로필이 설정되어 있어 수정할 수 없습니다.");
        }

        // 역할(Role) 업데이트
        if (user.getRole() == null && roleStr != null) {
            validateRole(roleStr); // <<< 2. 입력값 검증 로직 추가
            user.setRole(Role.valueOf(roleStr.toUpperCase()));
        }

        // 흥미(Interests) 업데이트
        if ((user.getInterests() == null || user.getInterests().isEmpty()) && interestsStr != null && !interestsStr.isEmpty()) {
            validateInterests(interestsStr); // <<< 2. 입력값 검증 로직 추가
            List<Interest> interests = interestsStr.stream()
                    .map(s -> Interest.valueOf(s.toUpperCase()))
                    .collect(Collectors.toList());
            user.setInterests(interests);
        }

        user.setUpdatedAt(Instant.now());
        return userRepository.save(user);
    }

    // <<< 2. 역할(Role) 문자열이 유효한 Enum 값인지 검증하는 헬퍼 메소드
    private void validateRole(String roleStr) {
        Arrays.stream(Role.values())
                .filter(role -> role.name().equalsIgnoreCase(roleStr))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 역할입니다: " + roleStr));
    }

    // <<< 2. 흥미(Interests) 목록이 유효한 Enum 값들인지 검증하는 헬퍼 메소드
    private void validateInterests(List<String> interestsStr) {
        for (String interestStr : interestsStr) {
            Arrays.stream(Interest.values())
                    .filter(interest -> interest.name().equalsIgnoreCase(interestStr))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 흥미 분야입니다: " + interestStr));
        }
    }

    // <<< 3. 카카오 최초 로그인시 약관 동의 항목
    @Transactional
    public void saveConsents(String userId, List<ConsentDTO> consents) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("사용자를 찾을 수 없습니다."));

        //  DTO -> Entity 변환
        List<Consent> consentEntities = consents.stream()
                .map(dto -> new Consent(
                        ConsentType.valueOf(dto.getType().toUpperCase()),            // 약관 유형
                        dto.isAgreed(),                   // 동의 여부
                        dto.getAgreedAt() != null         // 동의 일시 (없으면 서버 기준 시간)
                                ? dto.getAgreedAt()
                                : Instant.now()
                ))
                .toList();

        //  User에 약관 동의 내역 저장
        user.setConsents(consentEntities);
        userRepository.save(user);
    }
}
