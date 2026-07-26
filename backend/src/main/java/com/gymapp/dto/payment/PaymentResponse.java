package com.gymapp.dto.payment;

import com.gymapp.entity.enums.FeeStatus;
import com.gymapp.entity.enums.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private String id;
    private String memberId;
    private String memberName;
    private String membershipPlanName;
    private double amount;
    private double remainingAmount;
    private FeeStatus status;
    private LocalDate dueDate;
    private LocalDateTime paidDate;
    private PaymentMethod method;
}
