package com.gymapp.dto.diet;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DietDayDTO {
    @Min(1) @Max(7) private int dayNumber;
    @Valid @NotNull private MealDTO breakfast;
    @Valid @NotNull private MealDTO lunch;
    @Valid @NotNull private MealDTO dinner;
    @Valid @NotNull private MealDTO snacks;
    private double waterIntakeLiters;
}
