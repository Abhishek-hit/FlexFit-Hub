package com.gymapp.controller;

import com.gymapp.dto.workout.WorkoutPlanRequest;
import com.gymapp.entity.WorkoutPlan;
import com.gymapp.security.UserPrincipal;
import com.gymapp.service.WorkoutService;
import com.gymapp.service.integration.FileStorageService;
import com.gymapp.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/owner/gyms/{gymId}/workout-plans")
@RequiredArgsConstructor
public class OwnerWorkoutController {

    private final WorkoutService workoutService;
    private final FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WorkoutPlan>>> list(@AuthenticationPrincipal UserPrincipal principal,
                                                                 @PathVariable String gymId) {
        return ResponseEntity.ok(ApiResponse.success("OK", workoutService.gymPlans(principal.getId(), gymId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WorkoutPlan>> createOrReplace(@AuthenticationPrincipal UserPrincipal principal,
                                                                      @PathVariable String gymId,
                                                                      @Valid @RequestBody WorkoutPlanRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Workout plan published",
                workoutService.createOrReplacePlan(principal.getId(), gymId, req)));
    }

    /** Upload an exercise image or tutorial/machine-usage video and get back its URL to embed in a plan. */
    @PostMapping("/media")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadMedia(@PathVariable String gymId,
                                                                          @RequestParam MultipartFile file,
                                                                          @RequestParam(defaultValue = "image") String type) {
        String url = "video".equalsIgnoreCase(type)
                ? fileStorageService.uploadVideo(file, "gyms/" + gymId + "/workout-videos")
                : fileStorageService.uploadImage(file, "gyms/" + gymId + "/workout-images");
        return ResponseEntity.ok(ApiResponse.success("Uploaded", Map.of("url", url)));
    }
}
