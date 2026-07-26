package com.gymapp.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutDay {
    private int dayNumber; // 1-7
    private String title;  // e.g. "Push Day"
    private List<Exercise> exercises;
}
