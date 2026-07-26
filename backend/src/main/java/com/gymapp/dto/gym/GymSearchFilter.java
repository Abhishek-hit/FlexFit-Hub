package com.gymapp.dto.gym;

import lombok.Data;

@Data
public class GymSearchFilter {
    private String query;      // name / free text
    private String state;
    private String city;
    private Double minRating;
    private Double maxPrice;
    private Boolean weightGainSpecialized;
    private Boolean weightLossSpecialized;
    private Double lat;        // for distance sort
    private Double lng;
    private Double maxDistanceKm;
}
