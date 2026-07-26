package com.gymapp.dto.diet;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MealDTO {
    @NotBlank private String description;
    private double calories;
    private double proteinGrams;
    private double carbsGrams;
    private double fatsGrams;
}
