package com.gymapp.dto.gym;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class MembershipPlanRequest {
    @NotBlank private String name;
    @NotNull @Min(1) private Integer durationInDays;
    @NotNull @Min(0) private Double price;
    private List<String> features;
}
