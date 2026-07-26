package com.gymapp.entity;

import com.gymapp.entity.enums.OtpPurpose;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "otp_verifications")
public class OtpVerification {

    @Id
    private String id;

    /** email or phone the OTP was issued for */
    private String identifier;

    private String otpHash;

    private OtpPurpose purpose;

    private LocalDateTime expiresAt;

    @Builder.Default
    private boolean used = false;
}
