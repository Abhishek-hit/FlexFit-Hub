package com.gymapp.controller;

import com.gymapp.dto.payment.PaymentResponse;
import com.gymapp.security.UserPrincipal;
import com.gymapp.service.PaymentService;
import com.gymapp.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/member/payments")
@RequiredArgsConstructor
public class MemberPaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> history(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("OK", paymentService.myPaymentHistory(principal.getId())));
    }
}
