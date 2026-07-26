package com.gymapp.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "gyms")
public class Gym {

    @Id
    private String id;

    /** references User.id of the owner */
    private String ownerId;

    private String name;

    private String description;

    private String address;
    private String state;
    private String city;

    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private GeoJsonPoint location; // [lng, lat]

    private List<String> images;

    private String contactNumber;

    private LocalTime openingTime;
    private LocalTime closingTime;

    private List<String> facilities;

    @Builder.Default
    private boolean weightGainSpecialized = false;

    @Builder.Default
    private boolean weightLossSpecialized = false;

    @Builder.Default
    private List<MembershipPlan> membershipPlans = List.of();

    @Field("avgRating")
    @Builder.Default
    private double avgRating = 0.0;

    @Builder.Default
    private int totalReviews = 0;

    @Builder.Default
    private int totalMembers = 0;

    @Builder.Default
    private int activeMembers = 0;

    /** UPI id / QR string used by owner to collect payments */
    private String upiId;

    @Builder.Default
    private boolean active = true;

    @CreatedDate
    private LocalDateTime createdAt;
}
