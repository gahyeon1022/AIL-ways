package auth.local.repository;// package com.ailways.alpha.repository;
import auth.local.domain.EmailCode;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailCodeRepository extends MongoRepository<EmailCode, String> {
    Optional<EmailCode> findTopByEmailAndUsedIsFalseOrderByCreatedAtDesc(String email);
}
