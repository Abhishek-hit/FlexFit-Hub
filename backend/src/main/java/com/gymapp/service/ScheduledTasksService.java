package com.gymapp.service;

import com.gymapp.entity.Member;
import com.gymapp.entity.Payment;
import com.gymapp.entity.User;
import com.gymapp.entity.enums.FeeStatus;
import com.gymapp.entity.enums.MembershipStatus;
import com.gymapp.entity.enums.NotificationType;
import com.gymapp.repository.MemberRepository;
import com.gymapp.repository.PaymentRepository;
import com.gymapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

/**
 * Nightly jobs that keep membership/fee state accurate and push proactive
 * notifications (trial ending, membership expiring, fee overdue).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduledTasksService {

    private final MemberRepository memberRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    /** Runs every day at 00:30 server time. */
    @Scheduled(cron = "0 30 0 * * *")
    public void expireTrialsAndMemberships() {
        LocalDate today = LocalDate.now();

        List<Member> expiredTrials = memberRepository.findByTrialEndDateBeforeAndMembershipStatus(today, MembershipStatus.TRIAL);
        for (Member m : expiredTrials) {
            m.setMembershipStatus(MembershipStatus.EXPIRED);
            memberRepository.save(m);
            notifyMember(m, NotificationType.MEMBERSHIP_EXPIRY, "Trial ended",
                    "Your free trial has ended. Purchase a membership plan to keep training with us.");
        }

        List<Member> expiredMemberships = memberRepository.findByMembershipExpiryBeforeAndMembershipStatus(today, MembershipStatus.ACTIVE);
        for (Member m : expiredMemberships) {
            m.setMembershipStatus(MembershipStatus.EXPIRED);
            memberRepository.save(m);
            notifyMember(m, NotificationType.MEMBERSHIP_EXPIRY, "Membership expired",
                    "Your membership has expired. Renew now to continue your fitness journey uninterrupted.");
        }

        log.info("Expired {} trials and {} memberships", expiredTrials.size(), expiredMemberships.size());
    }

    /** Runs every day at 08:00 - warn members whose trial/membership ends within 2 days. */
    @Scheduled(cron = "0 0 8 * * *")
    public void sendExpiryWarnings() {
        LocalDate warnDate = LocalDate.now().plusDays(2);

        memberRepository.findByTrialEndDateBeforeAndMembershipStatus(warnDate.plusDays(1), MembershipStatus.TRIAL)
                .forEach(m -> notifyMember(m, NotificationType.TRIAL_ENDING, "Trial ending soon",
                        "Your free trial ends in 2 days. Choose a plan to avoid losing access."));
    }

    /** Runs every day at 09:00 - flag overdue fees and remind members. */
    @Scheduled(cron = "0 0 9 * * *")
    public void flagOverdueFees() {
        LocalDate today = LocalDate.now();
        List<Payment> overdue = paymentRepository.findByDueDateBeforeAndStatus(today, FeeStatus.PENDING);
        for (Payment p : overdue) {
            p.setStatus(FeeStatus.OVERDUE);
            paymentRepository.save(p);

            memberRepository.findById(p.getMemberId()).ifPresent(m ->
                    notifyMember(m, NotificationType.FEE_REMINDER, "Fee overdue",
                            "Your payment of Rs. " + p.getRemainingAmount() + " is overdue. Please pay to avoid membership suspension."));
        }
        log.info("Flagged {} overdue payments", overdue.size());
    }

    private void notifyMember(Member m, NotificationType type, String title, String message) {
        User user = userRepository.findById(m.getUserId()).orElse(null);
        if (user != null) {
            notificationService.notify(user.getId(), type, title, message);
        }
    }
}
