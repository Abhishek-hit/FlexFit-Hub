package com.gymapp.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Embedded within Gym - defines a purchasable plan (e.g. "1 Month", "6 Months").
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MembershipPlan {
    private String id;
    private String name;
    private int durationInDays;
    private double price;
    private List<String> features;
}
