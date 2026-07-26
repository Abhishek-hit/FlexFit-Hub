package com.gymapp.controller;

import com.gymapp.dto.payment.*;
import com.gymapp.entity.enums.FeeStatus;
import com.gymapp.security.UserPrincipal;
import com.gymapp.service.PaymentService;
import com.gymapp.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/owner/gyms/{gymId}/fees")
@RequiredArgsConstructor
public class OwnerFeeController {

    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> list(@AuthenticationPrincipal UserPrincipal principal,
                                                                     @PathVariable String gymId,
                                                                     @RequestParam(required = false) FeeStatus status) {
        List<PaymentResponse> result = status == null
                ? paymentService.listGymFees(principal.getId(), gymId)
                : paymentService.listGymFeesByStatus(principal.getId(), gymId, status);
        return ResponseEntity.ok(ApiResponse.success("OK", result));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentResponse>> create(@AuthenticationPrincipal UserPrincipal principal,
                                                                 @PathVariable String gymId,
                                                                 @Valid @RequestBody CreatePaymentRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Fee record created",
                paymentService.createDuePayment(principal.getId(), gymId, req)));
    }

    @PostMapping("/{paymentId}/mark-paid")
    public ResponseEntity<ApiResponse<PaymentResponse>> markPaid(@AuthenticationPrincipal UserPrincipal principal,
                                                                   @PathVariable String gymId,
                                                                   @PathVariable String paymentId,
                                                                   @Valid @RequestBody MarkPaidRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Payment recorded",
                paymentService.markPaid(principal.getId(), gymId, paymentId, req)));
    }

    @PostMapping("/{paymentId}/remind")
    public ResponseEntity<ApiResponse<Void>> remind(@AuthenticationPrincipal UserPrincipal principal,
                                                      @PathVariable String gymId,
                                                      @PathVariable String paymentId) {
        paymentService.sendReminder(principal.getId(), gymId, paymentId);
        return ResponseEntity.ok(ApiResponse.success("Reminder sent"));
    }

    @GetMapping("/revenue-summary")
    public ResponseEntity<ApiResponse<RevenueSummaryResponse>> revenue(@AuthenticationPrincipal UserPrincipal principal,
                                                                        @PathVariable String gymId) {
        return ResponseEntity.ok(ApiResponse.success("OK", paymentService.revenueSummary(principal.getId(), gymId)));
    }
}
