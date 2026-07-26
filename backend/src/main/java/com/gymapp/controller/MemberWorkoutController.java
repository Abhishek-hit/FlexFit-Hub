package com.gymapp.controller;

import com.gymapp.dto.workout.ProgressResponse;
import com.gymapp.dto.workout.WorkoutCompleteRequest;
import com.gymapp.entity.WorkoutPlan;
import com.gymapp.security.UserPrincipal;
import com.gymapp.service.WorkoutService;
import com.gymapp.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/member/workout")
@RequiredArgsConstructor
public class MemberWorkoutController {

    private final WorkoutService workoutService;

    @GetMapping("/plan")
    public ResponseEntity<ApiResponse<WorkoutPlan>> myPlan(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("OK", workoutService.myWorkoutPlan(principal.getId())));
    }

    @PostMapping("/complete")
    public ResponseEntity<ApiResponse<ProgressResponse>> markComplete(@AuthenticationPrincipal UserPrincipal principal,
                                                                        @Valid @RequestBody WorkoutCompleteRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Workout marked complete! Keep the streak going.",
                workoutService.markDayComplete(principal.getId(), req)));
    }

    @GetMapping("/progress")
    public ResponseEntity<ApiResponse<ProgressResponse>> progress(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("OK", workoutService.myProgress(principal.getId())));
    }
}
