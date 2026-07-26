package com.gymapp.controller;

import com.gymapp.dto.gym.GymResponse;
import com.gymapp.dto.gym.GymSearchFilter;
import com.gymapp.dto.review.ReviewResponse;
import com.gymapp.service.GymService;
import com.gymapp.service.ReviewService;
import com.gymapp.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Public endpoints - no auth required. Powers the visitor-facing website. */
@RestController
@RequestMapping("/api/gyms")
@RequiredArgsConstructor
public class PublicGymController {

    private final GymService gymService;
    private final ReviewService reviewService;

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<GymResponse>>> search(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Boolean weightGainSpecialized,
            @RequestParam(required = false) Boolean weightLossSpecialized,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Double maxDistanceKm) {

        GymSearchFilter filter = new GymSearchFilter();
        filter.setQuery(query);
        filter.setState(state);
        filter.setCity(city);
        filter.setMinRating(minRating);
        filter.setMaxPrice(maxPrice);
        filter.setWeightGainSpecialized(weightGainSpecialized);
        filter.setWeightLossSpecialized(weightLossSpecialized);
        filter.setLat(lat);
        filter.setLng(lng);
        filter.setMaxDistanceKm(maxDistanceKm);

        return ResponseEntity.ok(ApiResponse.success("OK", gymService.search(filter)));
    }

    @GetMapping("/top10")
    public ResponseEntity<ApiResponse<List<GymResponse>>> topTen() {
        return ResponseEntity.ok(ApiResponse.success("OK", gymService.topTen()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GymResponse>> getById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("OK", gymService.getById(id)));
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> reviews(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("OK", reviewService.gymReviews(id)));
    }
}
