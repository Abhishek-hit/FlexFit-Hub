package com.gymapp.service;

import com.gymapp.dto.payment.*;
import com.gymapp.entity.*;
import com.gymapp.entity.enums.*;
import com.gymapp.exception.BadRequestException;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.repository.*;
import com.gymapp.service.integration.EmailService;
import com.gymapp.service.integration.SmsService;
import com.gymapp.service.integration.WhatsAppService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    private final GymRepository gymRepository;

    private final SmsService smsService;
    private final WhatsAppService whatsAppService;
    private final EmailService emailService;
    private final NotificationService notificationService;

    // ---------------------------------------------------------- owner side
    public List<PaymentResponse> listGymFees(String ownerId, String gymId) {
        assertOwnsGym(ownerId, gymId);
        return enrich(paymentRepository.findByGymId(gymId));
    }

    public List<PaymentResponse> listGymFeesByStatus(String ownerId, String gymId, FeeStatus status) {
        assertOwnsGym(ownerId, gymId);
        return enrich(paymentRepository.findByGymIdAndStatus(gymId, status));
    }

    public PaymentResponse createDuePayment(String ownerId, String gymId, CreatePaymentRequest req) {
        assertOwnsGym(ownerId, gymId);
        Member member = memberRepository.findById(req.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        Payment payment = Payment.builder()
                .memberId(member.getId())
                .gymId(gymId)
                .membershipPlanId(req.getMembershipPlanId())
                .amount(req.getAmount())
                .remainingAmount(req.getAmount())
                .status(FeeStatus.PENDING)
                .dueDate(req.getDueDate())
                .build();
        payment = paymentRepository.save(payment);
        return toResponse(payment);
    }

    public PaymentResponse markPaid(String ownerId, String gymId, String paymentId, MarkPaidRequest req) {
        assertOwnsGym(ownerId, gymId);
        Payment payment = paymentRepository.findById(paymentId)
                .filter(p -> p.getGymId().equals(gymId))
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found"));

        double newRemaining = Math.max(0, payment.getRemainingAmount() - req.getAmountPaid());
        payment.setRemainingAmount(newRemaining);
        payment.setMethod(req.getMethod());
        payment.setTransactionRef(req.getTransactionRef());
        payment.setPaidDate(LocalDateTime.now());
        payment.setStatus(newRemaining <= 0 ? FeeStatus.PAID : FeeStatus.PENDING);
        payment = paymentRepository.save(payment);

        Member member = memberRepository.findById(payment.getMemberId()).orElse(null);
        if (member != null && payment.getStatus() == FeeStatus.PAID) {
            User user = userRepository.findById(member.getUserId()).orElse(null);
            if (user != null) {
                notificationService.notify(user.getId(), NotificationType.PAYMENT_SUCCESSFUL,
                        "Payment received", "We've received your payment of Rs. " + req.getAmountPaid() + ". Thank you!");
            }
        }

        return toResponse(payment);
    }

    public RevenueSummaryResponse revenueSummary(String ownerId, String gymId) {
        assertOwnsGym(ownerId, gymId);
        List<Payment> all = paymentRepository.findByGymId(gymId);

        double totalIncome = all.stream().filter(p -> p.getStatus() == FeeStatus.PAID)
                .mapToDouble(p -> p.getAmount() - p.getRemainingAmount()).sum();

        double pending = all.stream().filter(p -> p.getStatus() != FeeStatus.PAID)
                .mapToDouble(Payment::getRemainingAmount).sum();

        double paid = all.stream().filter(p -> p.getStatus() == FeeStatus.PAID)
                .mapToDouble(Payment::getAmount).sum();

        YearMonth thisMonth = YearMonth.now();
        double monthlyRevenue = all.stream()
                .filter(p -> p.getPaidDate() != null && YearMonth.from(p.getPaidDate()).equals(thisMonth))
                .mapToDouble(p -> p.getAmount() - (p.getStatus() == FeeStatus.PAID ? 0 : p.getRemainingAmount()))
                .sum();

        return RevenueSummaryResponse.builder()
                .monthlyRevenue(monthlyRevenue)
                .totalIncome(totalIncome)
                .pendingFees(pending)
                .paidFees(paid)
                .build();
    }

    // ---------------------------------------------------------- reminders
    public void sendReminder(String ownerId, String gymId, String paymentId) {
        assertOwnsGym(ownerId, gymId);
        Payment payment = paymentRepository.findById(paymentId)
                .filter(p -> p.getGymId().equals(gymId))
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found"));

        Member member = memberRepository.findById(payment.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));
        User user = userRepository.findById(member.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String message = "Reminder: Rs. " + payment.getRemainingAmount() + " is due on " + payment.getDueDate() + ". Please pay at your earliest convenience.";

        smsService.sendSms(user.getPhone(), message);
        whatsAppService.sendMessage(user.getPhone(), message);
        emailService.send(user.getEmail(), "Membership fee reminder", message);
        notificationService.notify(user.getId(), NotificationType.FEE_REMINDER, "Fee Reminder", message);
    }

    // ---------------------------------------------------------- member side
    public List<PaymentResponse> myPaymentHistory(String userId) {
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member profile not found"));
        return enrich(paymentRepository.findByMemberId(member.getId()));
    }

    // ---------------------------------------------------------- helpers
    private void assertOwnsGym(String ownerId, String gymId) {
        gymRepository.findByIdAndOwnerId(gymId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Gym not found for this owner"));
    }

    private List<PaymentResponse> enrich(List<Payment> payments) {
        return payments.stream().map(this::toResponse).toList();
    }

    private PaymentResponse toResponse(Payment p) {
        Member member = memberRepository.findById(p.getMemberId()).orElse(null);
        User user = member != null ? userRepository.findById(member.getUserId()).orElse(null) : null;
        Gym gym = gymRepository.findById(p.getGymId()).orElse(null);
        String planName = gym != null ? gym.getMembershipPlans().stream()
                .filter(pl -> pl.getId().equals(p.getMembershipPlanId()))
                .map(MembershipPlan::getName).findFirst().orElse(null) : null;

        return PaymentResponse.builder()
                .id(p.getId())
                .memberId(p.getMemberId())
                .memberName(user != null ? user.getName() : null)
                .membershipPlanName(planName)
                .amount(p.getAmount())
                .remainingAmount(p.getRemainingAmount())
                .status(p.getStatus())
                .dueDate(p.getDueDate())
                .paidDate(p.getPaidDate())
                .method(p.getMethod())
                .build();
    }
}
