package com.gymapp.controller;

import com.gymapp.dto.review.ReviewRequest;
import com.gymapp.dto.review.ReviewResponse;
import com.gymapp.security.UserPrincipal;
import com.gymapp.service.ReviewService;
import com.gymapp.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/member/gyms/{gymId}/reviews")
@RequiredArgsConstructor
public class MemberReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> addReview(@AuthenticationPrincipal UserPrincipal principal,
                                                                   @PathVariable String gymId,
                                                                   @Valid @RequestBody ReviewRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Review submitted", reviewService.addReview(principal.getId(), gymId, req)));
    }
}
