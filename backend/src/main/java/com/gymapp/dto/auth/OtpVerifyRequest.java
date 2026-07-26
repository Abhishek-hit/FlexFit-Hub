package com.gymapp.dto.auth;

import com.gymapp.entity.enums.OtpPurpose;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OtpVerifyRequest {
    @NotBlank private String identifier; // email or phone
    @NotBlank private String otp;
    @NotBlank private OtpPurpose purpose;
}
