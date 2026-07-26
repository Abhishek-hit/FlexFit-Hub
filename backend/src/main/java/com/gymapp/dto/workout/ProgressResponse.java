package com.gymapp.dto.workout;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressResponse {
    private int currentStreak;
    private int longestStreak;
    private int totalWorkoutDays;
    private int completedThisWeek;
    private int completedThisMonth;
    private List<String> completedDatesThisMonth;
}
