package com.gymapp.dto.auth;

import com.gymapp.entity.enums.OtpPurpose;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OtpRequest {
    @NotBlank private String identifier;
    @NotBlank private OtpPurpose purpose;
}
