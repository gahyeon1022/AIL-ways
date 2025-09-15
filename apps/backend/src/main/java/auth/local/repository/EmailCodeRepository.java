package auth.local.repository;// package com.ailways.alpha.repository;
import auth.local.domain.EmailCode;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface EmailCodeRepository extends MongoRepository<EmailCode, String> {
    Optional<EmailCode> findTopByEmailAndUsedIsFalseOrderByExpireAtDesc(String email);
}
