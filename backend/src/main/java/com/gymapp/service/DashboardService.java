package com.gymapp.service;

import com.gymapp.dto.dashboard.MemberDashboardResponse;
import com.gymapp.dto.dashboard.OwnerDashboardResponse;
import com.gymapp.dto.member.MemberResponse;
import com.gymapp.dto.payment.PaymentResponse;
import com.gymapp.entity.Member;
import com.gymapp.entity.Payment;
import com.gymapp.entity.User;
import com.gymapp.entity.enums.FeeStatus;
import com.gymapp.entity.enums.MembershipStatus;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final MemberRepository memberRepository;
    private final PaymentRepository paymentRepository;
    private final AttendanceRepository attendanceRepository;
    private final NotificationRepository notificationRepository;
    private final GymRepository gymRepository;
    private final UserRepository userRepository;

    private final MemberService memberService;
    private final PaymentService paymentService;
    private final WorkoutService workoutService;
    private final NotificationService notificationService;

    public OwnerDashboardResponse ownerOverview(String ownerId, String gymId) {
        gymRepository.findByIdAndOwnerId(gymId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Gym not found for this owner"));

        long total = memberRepository.countByGymId(gymId);
        long active = memberRepository.countByGymIdAndMembershipStatus(gymId, MembershipStatus.ACTIVE)
                + memberRepository.countByGymIdAndMembershipStatus(gymId, MembershipStatus.TRIAL);
        long expired = memberRepository.countByGymIdAndMembershipStatus(gymId, MembershipStatus.EXPIRED);

        YearMonth thisMonth = YearMonth.now();
        long newThisMonth = memberRepository.findByGymId(gymId).stream()
                .filter(m -> m.getJoiningDate() != null && YearMonth.from(m.getJoiningDate()).equals(thisMonth))
                .count();

        long todaysAttendance = attendanceRepository.countByGymIdAndDate(gymId, LocalDate.now());

        var revenue = paymentService.revenueSummary(ownerId, gymId);

        User owner = userRepository.findById(ownerId).orElse(null);
        long unread = owner != null ? notificationRepository.countByUserIdAndReadFalse(owner.getId()) : 0;

        return OwnerDashboardResponse.builder()
                .totalMembers(total)
                .activeMembers(active)
                .expiredMembers(expired)
                .newMembersThisMonth(newThisMonth)
                .monthlyRevenue(revenue.getMonthlyRevenue())
                .todaysAttendance(todaysAttendance)
                .pendingFees(revenue.getPendingFees())
                .paidFees(revenue.getPaidFees())
                .totalIncome(revenue.getTotalIncome())
                .unreadNotifications(unread)
                .build();
    }

    public MemberDashboardResponse memberOverview(String userId) {
        MemberResponse profile = memberService.getMyProfile(userId);
        var progress = workoutService.myProgress(userId);
        List<PaymentResponse> recentPayments = paymentService.myPaymentHistory(userId).stream()
                .sorted(Comparator.comparing(PaymentResponse::getDueDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .toList();
        long unread = notificationService.unreadCount(userId);

        return MemberDashboardResponse.builder()
                .profile(profile)
                .progress(progress)
                .recentPayments(recentPayments)
                .unreadNotifications(unread)
                .build();
    }
}
