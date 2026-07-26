package com.gymapp.dto.auth;

import com.gymapp.entity.enums.Gender;
import com.gymapp.entity.enums.Goal;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class MemberSelfRegisterRequest {
    @NotBlank private String name;
    @NotBlank @Pattern(regexp = "\\d{10}") private String mobile;
    @NotBlank @Email private String email;
    @NotBlank @Size(min = 6) private String password;
    private String address;

    @NotNull private Double weightKg;
    @NotNull private Double heightCm;
    @NotNull @Min(10) @Max(100) private Integer age;
    @NotNull private Gender gender;
    @NotNull private Goal goal;

    @NotBlank private String gymId;
}
