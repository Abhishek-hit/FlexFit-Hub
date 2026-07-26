package com.gymapp.dto.dashboard;

import com.gymapp.dto.member.MemberResponse;
import com.gymapp.dto.payment.PaymentResponse;
import com.gymapp.dto.workout.ProgressResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberDashboardResponse {
    private MemberResponse profile;
    private ProgressResponse progress;
    private List<PaymentResponse> recentPayments;
    private long unreadNotifications;
}
