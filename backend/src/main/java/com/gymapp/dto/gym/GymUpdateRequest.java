package com.gymapp.dto.gym;

import lombok.Data;

import java.util.List;

@Data
public class GymUpdateRequest {
    private String name;
    private String description;
    private String address;
    private String state;
    private String city;
    private Double latitude;
    private Double longitude;
    private String contactNumber;
    private String openingTime;
    private String closingTime;
    private List<String> facilities;
    private Boolean weightGainSpecialized;
    private Boolean weightLossSpecialized;
    private String upiId;
}
