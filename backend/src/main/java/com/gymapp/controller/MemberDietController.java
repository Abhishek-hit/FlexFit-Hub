package com.gymapp.controller;

import com.gymapp.entity.DietPlan;
import com.gymapp.security.UserPrincipal;
import com.gymapp.service.DietService;
import com.gymapp.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/member/diet")
@RequiredArgsConstructor
public class MemberDietController {

    private final DietService dietService;

    @GetMapping("/plan")
    public ResponseEntity<ApiResponse<DietPlan>> myPlan(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("OK", dietService.myDietPlan(principal.getId())));
    }
}
