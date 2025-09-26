package auth.local.repository;// package com.ailways.alpha.repository;
import auth.local.domain.LocalCredentials;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LocalCredentialsRepository extends MongoRepository<LocalCredentials, String> {
    Optional<LocalCredentials> findByEmailForLogin(String emailForLogin);

    // ✅ userId 로 자격증명 조회
    Optional<LocalCredentials> findByUserId(String userId);
}

