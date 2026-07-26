package com.gymapp.controller;

import com.gymapp.dto.dashboard.MemberDashboardResponse;
import com.gymapp.security.UserPrincipal;
import com.gymapp.service.DashboardService;
import com.gymapp.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/member/dashboard")
@RequiredArgsConstructor
public class MemberDashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<MemberDashboardResponse>> overview(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("OK", dashboardService.memberOverview(principal.getId())));
    }
}
