package com.gymapp.dto.member;

import com.gymapp.entity.enums.Gender;
import com.gymapp.entity.enums.Goal;
import com.gymapp.entity.enums.MembershipStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberResponse {
    private String id;
    private String name;
    private String email;
    private String mobile;
    private String photoUrl;
    private String address;
    private Integer age;
    private Gender gender;
    private Double heightCm;
    private Double weightKg;
    private Double bmi;
    private Goal goal;
    private LocalDate joiningDate;
    private String membershipPlanId;
    private String membershipPlanName;
    private MembershipStatus membershipStatus;
    private LocalDate membershipExpiry;
    private LocalDate trialEndDate;
    private int currentStreak;
    private int longestStreak;
    private int totalWorkoutDays;
    private String attendanceCode;
}
