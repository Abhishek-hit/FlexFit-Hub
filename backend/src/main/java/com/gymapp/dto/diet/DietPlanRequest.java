package com.gymapp.dto.diet;

import com.gymapp.entity.enums.Goal;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class DietPlanRequest {
    @NotNull private Goal goal;
    @NotBlank private String title;
    @Valid @Size(min = 7, max = 7, message = "A diet plan must have exactly 7 days")
    private List<DietDayDTO> days;
}
