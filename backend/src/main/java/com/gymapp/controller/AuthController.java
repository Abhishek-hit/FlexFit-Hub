package com.gymapp.controller;

import com.gymapp.dto.auth.*;
import com.gymapp.service.AuthService;
import com.gymapp.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register/owner")
    public ResponseEntity<ApiResponse<Void>> registerOwner(@Valid @RequestBody OwnerRegisterRequest req) {
        var result = authService.registerOwner(req);
        return ResponseEntity.ok(ApiResponse.success(result.message()));
    }

    @PostMapping("/register/member")
    public ResponseEntity<ApiResponse<AuthResponse>> registerMember(@Valid @RequestBody MemberSelfRegisterRequest req) {
        AuthResponse result = authService.registerMemberSelf(req);
        return ResponseEntity.ok(ApiResponse.success("Registration successful. Your 3-day free trial has started!", result));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest req) {
        AuthResponse result = authService.login(req);
        return ResponseEntity.ok(ApiResponse.success("Login successful", result));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest req) {
        AuthResponse result = authService.refresh(req);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", result));
    }

    @PostMapping("/otp/send")
    public ResponseEntity<ApiResponse<Void>> sendOtp(@Valid @RequestBody OtpRequest req) {
        var result = authService.resendOtp(req);
        return ResponseEntity.ok(ApiResponse.success(result.message()));
    }

    @PostMapping("/otp/verify")
    public ResponseEntity<ApiResponse<Void>> verifyOtp(@Valid @RequestBody OtpVerifyRequest req) {
        var result = authService.verifyOtp(req);
        return ResponseEntity.ok(ApiResponse.success(result.message()));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        var result = authService.forgotPassword(req);
        return ResponseEntity.ok(ApiResponse.success(result.message()));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        var result = authService.resetPassword(req);
        return ResponseEntity.ok(ApiResponse.success(result.message()));
    }

    /** same flow is used when an owner-created member sets their initial password */
    @PostMapping("/setup-password")
    public ResponseEntity<ApiResponse<Void>> setupPassword(@Valid @RequestBody ResetPasswordRequest req) {
        var result = authService.resetPassword(req);
        return ResponseEntity.ok(ApiResponse.success(result.message()));
    }
}
