package com.gymapp.entity;

import com.gymapp.entity.enums.FeeStatus;
import com.gymapp.entity.enums.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "payments")
public class Payment {

    @Id
    private String id;

    private String memberId;
    private String gymId;
    private String membershipPlanId;

    private double amount;
    private double remainingAmount;

    @Builder.Default
    private FeeStatus status = FeeStatus.PENDING;

    private LocalDate dueDate;
    private LocalDateTime paidDate;

    private PaymentMethod method;

    /** external gateway transaction reference, if any */
    private String transactionRef;

    @CreatedDate
    private LocalDateTime createdAt;
}
