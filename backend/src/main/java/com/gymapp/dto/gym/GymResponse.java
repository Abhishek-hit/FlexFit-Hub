package com.gymapp.dto.gym;

import com.gymapp.entity.MembershipPlan;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GymResponse {
    private String id;
    private String name;
    private String description;
    private String address;
    private String state;
    private String city;
    private Double latitude;
    private Double longitude;
    private List<String> images;
    private String contactNumber;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private List<String> facilities;
    private boolean weightGainSpecialized;
    private boolean weightLossSpecialized;
    private List<MembershipPlan> membershipPlans;
    private double avgRating;
    private int totalReviews;
    private int totalMembers;
    private double startingPrice;
}
