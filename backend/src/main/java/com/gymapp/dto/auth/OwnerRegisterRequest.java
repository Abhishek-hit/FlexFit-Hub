package com.gymapp.dto.auth;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class OwnerRegisterRequest {
    @NotBlank private String ownerName;
    @NotBlank private String gymName;
    @NotBlank @Pattern(regexp = "\\d{10}") private String mobileNumber;
    @NotBlank @Email private String email;
    @NotBlank @Size(min = 6) private String password;

    @NotBlank private String gymAddress;
    @NotBlank private String state;
    @NotBlank private String city;

    private Double latitude;
    private Double longitude;

    private String gymDescription;

    @NotBlank private String openingTime; // "06:00"
    @NotBlank private String closingTime; // "22:00"
}
