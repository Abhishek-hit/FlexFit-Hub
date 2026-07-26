package com.gymapp.dto.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class ReviewRequest {
    @Min(1) @Max(5) private int rating;
    @NotBlank private String comment;
    private List<String> imageUrls;
}
