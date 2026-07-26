package com.gymapp.entity;

import com.gymapp.entity.enums.Gender;
import com.gymapp.entity.enums.Goal;
import com.gymapp.entity.enums.MembershipStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "members")
public class Member {

    @Id
    private String id;

    /** references User.id */
    private String userId;

    /** references Gym.id */
    private String gymId;

    private String photoUrl;
    private String address;
    private Integer age;
    private Gender gender;

    private Double heightCm;
    private Double weightKg;

    private Goal goal;

    private LocalDate joiningDate;

    private String membershipPlanId;

    @Builder.Default
    private MembershipStatus membershipStatus = MembershipStatus.TRIAL;

    private LocalDate membershipExpiry;
    private LocalDate trialEndDate;

    @Builder.Default
    private int currentStreak = 0;

    @Builder.Default
    private int longestStreak = 0;

    @Builder.Default
    private int totalWorkoutDays = 0;

    /** QR/NFC unique code used for check-in */
    private String attendanceCode;

    @Builder.Default
    private boolean active = true;

    @CreatedDate
    private LocalDateTime createdAt;

    // ----- convenience helpers -----
    public double bmi() {
        if (heightCm == null || weightKg == null || heightCm == 0) return 0;
        double heightM = heightCm / 100.0;
        return Math.round((weightKg / (heightM * heightM)) * 100.0) / 100.0;
    }
}
