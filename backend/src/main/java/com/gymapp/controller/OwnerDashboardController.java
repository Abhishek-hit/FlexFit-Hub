package com.gymapp.controller;

import com.gymapp.dto.dashboard.OwnerDashboardResponse;
import com.gymapp.security.UserPrincipal;
import com.gymapp.service.DashboardService;
import com.gymapp.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/owner/gyms/{gymId}/dashboard")
@RequiredArgsConstructor
public class OwnerDashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<OwnerDashboardResponse>> overview(@AuthenticationPrincipal UserPrincipal principal,
                                                                          @PathVariable String gymId) {
        return ResponseEntity.ok(ApiResponse.success("OK", dashboardService.ownerOverview(principal.getId(), gymId)));
    }
}
