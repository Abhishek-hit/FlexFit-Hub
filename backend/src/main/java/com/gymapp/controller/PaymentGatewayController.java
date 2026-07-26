package com.gymapp.controller;

import com.gymapp.service.integration.PaymentGatewayService;
import com.gymapp.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.gymapp.security.UserPrincipal;

/** Member-initiated online payment order creation (Razorpay/Stripe-style flow). */
@RestController
@RequestMapping("/api/member/payments/online")
@RequiredArgsConstructor
public class PaymentGatewayController {

    private final PaymentGatewayService paymentGatewayService;

    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse<PaymentGatewayService.PaymentOrder>> createOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam double amount) {
        var order = paymentGatewayService.createOrder(amount, "member_" + principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Order created", order));
    }
}
