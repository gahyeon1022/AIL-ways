package user.repository;

import user.domain.Provider;
import user.domain.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByProviderAndProviderUserId(Provider provider, String providerUserId);
    Optional<User> findByEmail(String email);
    Optional<User> findByUserId(String userId);
    List<User> findAllByUserIdIn(List<String> menteeUserIds);
}
