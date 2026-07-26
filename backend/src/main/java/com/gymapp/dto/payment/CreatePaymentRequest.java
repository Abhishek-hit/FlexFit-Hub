package com.gymapp.dto.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreatePaymentRequest {
    @NotBlank private String memberId;
    @NotBlank private String membershipPlanId;
    @NotNull private Double amount;
    @NotNull private LocalDate dueDate;
}
