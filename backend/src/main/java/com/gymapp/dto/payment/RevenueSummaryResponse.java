package com.gymapp.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueSummaryResponse {
    private double monthlyRevenue;
    private double totalIncome;
    private double pendingFees;
    private double paidFees;
}
