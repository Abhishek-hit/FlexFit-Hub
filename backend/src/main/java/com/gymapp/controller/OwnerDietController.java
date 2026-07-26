package com.gymapp.controller;

import com.gymapp.dto.diet.DietPlanRequest;
import com.gymapp.entity.DietPlan;
import com.gymapp.security.UserPrincipal;
import com.gymapp.service.DietService;
import com.gymapp.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/owner/gyms/{gymId}/diet-plans")
@RequiredArgsConstructor
public class OwnerDietController {

    private final DietService dietService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DietPlan>>> list(@AuthenticationPrincipal UserPrincipal principal,
                                                              @PathVariable String gymId) {
        return ResponseEntity.ok(ApiResponse.success("OK", dietService.gymPlans(principal.getId(), gymId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DietPlan>> createOrReplace(@AuthenticationPrincipal UserPrincipal principal,
                                                                   @PathVariable String gymId,
                                                                   @Valid @RequestBody DietPlanRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Diet plan published",
                dietService.createOrReplacePlan(principal.getId(), gymId, req)));
    }
}
