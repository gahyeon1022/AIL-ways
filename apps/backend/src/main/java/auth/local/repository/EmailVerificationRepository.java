package auth.local.repository;// package com.ailways.alpha.repository;
import auth.local.domain.EmailVerification;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface EmailVerificationRepository extends MongoRepository<EmailVerification, String> {
    Optional<EmailVerification> findByTokenAndUsedIsFalse(String token);
}
