package com.gymapp.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerDashboardResponse {
    private long totalMembers;
    private long activeMembers;
    private long expiredMembers;
    private long newMembersThisMonth;
    private double monthlyRevenue;
    private long todaysAttendance;
    private double pendingFees;
    private double paidFees;
    private double totalIncome;
    private long unreadNotifications;
}
