package com.gymapp.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

/**
 * One record per member per day marking whether the scheduled workout was completed.
 * Used to compute daily / weekly / monthly progress and streaks.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "workout_progress")
public class WorkoutProgress {

    @Id
    private String id;

    private String memberId;
    private LocalDate date;

    @Builder.Default
    private boolean completed = true;

    private int workoutDayNumber; // which day (1-7) of the plan
}
