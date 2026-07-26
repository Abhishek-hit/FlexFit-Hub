package com.gymapp.repository;

import com.gymapp.entity.OtpVerification;
import com.gymapp.entity.enums.OtpPurpose;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface OtpVerificationRepository extends MongoRepository<OtpVerification, String> {
    Optional<OtpVerification> findTopByIdentifierAndPurposeAndUsedFalseOrderByExpiresAtDesc(String identifier, OtpPurpose purpose);
}
