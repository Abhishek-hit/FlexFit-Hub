package com.gymapp.entity;

import com.gymapp.entity.enums.DifficultyLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Exercise {
    private String name;
    private int sets;
    private int reps;
    private int restTimeSeconds;
    private DifficultyLevel difficulty;
    private String imageUrl;
    private String description;
    private String videoUrl;
}
