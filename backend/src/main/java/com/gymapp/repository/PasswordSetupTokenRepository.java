package com.gymapp.repository;

import com.gymapp.entity.PasswordSetupToken;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface PasswordSetupTokenRepository extends MongoRepository<PasswordSetupToken, String> {
    Optional<PasswordSetupToken> findByTokenAndUsedFalse(String token);
}
