package com.gymapp.service;

import com.gymapp.entity.OtpVerification;
import com.gymapp.entity.enums.OtpPurpose;
import com.gymapp.exception.BadRequestException;
import com.gymapp.repository.OtpVerificationRepository;
import com.gymapp.service.integration.EmailService;
import com.gymapp.service.integration.SmsService;
import com.gymapp.util.CodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpVerificationRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final SmsService smsService;
    private final EmailService emailService;

    @Value("${app.otp.expiry-minutes}")
    private int expiryMinutes;

    private static boolean looksLikeEmail(String identifier) {
        return identifier.contains("@");
    }

    public void issueOtp(String identifier, OtpPurpose purpose) {
        String otp = CodeGenerator.generateOtp();

        OtpVerification record = OtpVerification.builder()
                .identifier(identifier)
                .otpHash(passwordEncoder.encode(otp))
                .purpose(purpose)
                .expiresAt(LocalDateTime.now().plusMinutes(expiryMinutes))
                .used(false)
                .build();
        otpRepository.save(record);

        String message = "Your HealUp Gym verification code is " + otp + ". Valid for " + expiryMinutes + " minutes.";
        if (looksLikeEmail(identifier)) {
            emailService.send(identifier, "Your verification code", message);
        } else {
            smsService.sendSms(identifier, message);
        }
    }

    public void verifyOtp(String identifier, String otp, OtpPurpose purpose) {
        OtpVerification record = otpRepository
                .findTopByIdentifierAndPurposeAndUsedFalseOrderByExpiresAtDesc(identifier, purpose)
                .orElseThrow(() -> new BadRequestException("No OTP request found. Please request a new code."));

        if (record.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP has expired. Please request a new code.");
        }
        if (!passwordEncoder.matches(otp, record.getOtpHash())) {
            throw new BadRequestException("Invalid OTP.");
        }

        record.setUsed(true);
        otpRepository.save(record);
    }
}
