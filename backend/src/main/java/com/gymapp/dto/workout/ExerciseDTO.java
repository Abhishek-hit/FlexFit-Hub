package com.gymapp.dto.workout;

import com.gymapp.entity.enums.DifficultyLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ExerciseDTO {
    @NotBlank private String name;
    private int sets;
    private int reps;
    private int restTimeSeconds;
    @NotNull private DifficultyLevel difficulty;
    private String imageUrl;
    private String description;
    private String videoUrl;
}
