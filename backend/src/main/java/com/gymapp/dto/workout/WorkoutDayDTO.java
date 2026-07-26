package com.gymapp.dto.workout;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.util.List;

@Data
public class WorkoutDayDTO {
    @Min(1) @Max(7) private int dayNumber;
    private String title;
    @Valid private List<ExerciseDTO> exercises;
}
