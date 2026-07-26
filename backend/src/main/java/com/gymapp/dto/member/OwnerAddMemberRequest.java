package com.gymapp.dto.member;

import com.gymapp.entity.enums.Goal;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class OwnerAddMemberRequest {
    @NotBlank private String name;
    @NotBlank @Pattern(regexp = "\\d{10}") private String mobile;
    @NotBlank @Email private String email;
    private String address;
    private Goal goal;
    @NotBlank private String membershipPlanId;
}
