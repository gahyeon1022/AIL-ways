package auth.local.repository;// package com.ailways.alpha.repository;
import auth.local.domain.LocalCredentials;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface LocalCredentialsRepository extends MongoRepository<LocalCredentials, String> {
    Optional<LocalCredentials> findByEmailForLogin(String emailForLogin);
}
