package com.gymapp.controller;

import com.gymapp.dto.gym.*;
import com.gymapp.security.UserPrincipal;
import com.gymapp.service.GymService;
import com.gymapp.service.integration.FileStorageService;
import com.gymapp.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/owner/gyms")
@RequiredArgsConstructor
public class OwnerGymController {

    private final GymService gymService;
    private final FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<GymResponse>>> myGyms(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("OK", gymService.getOwnerGyms(principal.getId())));
    }

    @GetMapping("/{gymId}")
    public ResponseEntity<ApiResponse<GymResponse>> getGym(@AuthenticationPrincipal UserPrincipal principal,
                                                             @PathVariable String gymId) {
        return ResponseEntity.ok(ApiResponse.success("OK", gymService.getOwnerGym(principal.getId(), gymId)));
    }

    @PutMapping("/{gymId}")
    public ResponseEntity<ApiResponse<GymResponse>> updateGym(@AuthenticationPrincipal UserPrincipal principal,
                                                                @PathVariable String gymId,
                                                                @RequestBody GymUpdateRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Gym updated", gymService.updateGym(principal.getId(), gymId, req)));
    }

    @PostMapping("/{gymId}/images")
    public ResponseEntity<ApiResponse<GymResponse>> uploadImage(@AuthenticationPrincipal UserPrincipal principal,
                                                                  @PathVariable String gymId,
                                                                  @RequestParam MultipartFile file) {
        String url = fileStorageService.uploadImage(file, "gyms/" + gymId);
        return ResponseEntity.ok(ApiResponse.success("Image uploaded", gymService.addImage(principal.getId(), gymId, url)));
    }

    @PostMapping("/{gymId}/plans")
    public ResponseEntity<ApiResponse<GymResponse>> addPlan(@AuthenticationPrincipal UserPrincipal principal,
                                                              @PathVariable String gymId,
                                                              @Valid @RequestBody MembershipPlanRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Plan added", gymService.addMembershipPlan(principal.getId(), gymId, req)));
    }

    @DeleteMapping("/{gymId}/plans/{planId}")
    public ResponseEntity<ApiResponse<GymResponse>> removePlan(@AuthenticationPrincipal UserPrincipal principal,
                                                                 @PathVariable String gymId,
                                                                 @PathVariable String planId) {
        return ResponseEntity.ok(ApiResponse.success("Plan removed", gymService.removeMembershipPlan(principal.getId(), gymId, planId)));
    }
}
