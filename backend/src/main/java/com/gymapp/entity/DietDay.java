package com.gymapp.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DietDay {
    private int dayNumber; // 1-7
    private Meal breakfast;
    private Meal lunch;
    private Meal dinner;
    private Meal snacks;
    private double totalCalories;
    private double waterIntakeLiters;
}
