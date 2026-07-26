package com.gymapp.dto.payment;

import com.gymapp.entity.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MarkPaidRequest {
    @NotNull private Double amountPaid;
    @NotNull private PaymentMethod method;
    private String transactionRef;
}
