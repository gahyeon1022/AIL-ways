package user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import user.domain.User;
import user.repository.UserRepository;
import user.domain.Role;
import user.domain.Interest;
import java.util.stream.Collectors;

import java.time.Instant;
import java.util.List;


@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User updateUserProfile(String userId, List<String> interestsStr, String roleStr) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        if (interestsStr != null) {
            List<Interest> interests = interestsStr.stream()
                    .map(s -> Interest.valueOf(s.toUpperCase()))
                    .collect(Collectors.toList());

            user.setInterests(interests);
        }
        if (roleStr != null) {
            user.setRole(Role.valueOf(roleStr.toUpperCase()));
        }

        user.setUpdatedAt(Instant.now());
        return userRepository.save(user);
    }
}