package com.gymapp.service;

import com.gymapp.dto.auth.*;
import com.gymapp.entity.*;
import com.gymapp.entity.enums.*;
import com.gymapp.exception.BadRequestException;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.repository.*;
import com.gymapp.security.JwtService;
import com.gymapp.security.UserPrincipal;
import com.gymapp.service.integration.EmailService;
import com.gymapp.service.integration.SmsService;
import com.gymapp.util.CodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final GymRepository gymRepository;
    private final MemberRepository memberRepository;
    private final PasswordSetupTokenRepository passwordSetupTokenRepository;

    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    private final OtpService otpService;
    private final EmailService emailService;
    private final SmsService smsService;
    private final NotificationService notificationService;

    @Value("${app.trial.default-days}")
    private int trialDays;

    // ---------------------------------------------------------------- Owner registration
    @Transactional
    public ApiMessage registerOwner(OwnerRegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new BadRequestException("An account already exists with this email.");
        }
        if (userRepository.existsByPhone(req.getMobileNumber())) {
            throw new BadRequestException("An account already exists with this mobile number.");
        }

        User user = User.builder()
                .name(req.getOwnerName())
                .email(req.getEmail())
                .phone(req.getMobileNumber())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(Role.OWNER)
                .emailVerified(false)
                .phoneVerified(false)
                .build();
        user = userRepository.save(user);

        Gym gym = Gym.builder()
                .ownerId(user.getId())
                .name(req.getGymName())
                .description(req.getGymDescription())
                .address(req.getGymAddress())
                .state(req.getState())
                .city(req.getCity())
                .contactNumber(req.getMobileNumber())
                .images(List.of())
                .facilities(List.of())
                .membershipPlans(List.of())
                .openingTime(LocalTime.parse(req.getOpeningTime()))
                .closingTime(LocalTime.parse(req.getClosingTime()))
                .build();

        if (req.getLatitude() != null && req.getLongitude() != null) {
            gym.setLocation(new GeoJsonPoint(req.getLongitude(), req.getLatitude()));
        }
        gymRepository.save(gym);

        otpService.issueOtp(user.getEmail(), OtpPurpose.EMAIL_VERIFICATION);
        otpService.issueOtp(user.getPhone(), OtpPurpose.PHONE_VERIFICATION);

        return new ApiMessage("Registration successful. Please verify your email and mobile number with the OTP codes sent to you.");
    }

    // ---------------------------------------------------------------- Member self registration
    @Transactional
    public AuthResponse registerMemberSelf(MemberSelfRegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new BadRequestException("An account already exists with this email.");
        }
        if (userRepository.existsByPhone(req.getMobile())) {
            throw new BadRequestException("An account already exists with this mobile number.");
        }
        Gym gym = gymRepository.findById(req.getGymId())
                .orElseThrow(() -> new ResourceNotFoundException("Gym not found"));

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .phone(req.getMobile())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(Role.MEMBER)
                .build();
        user = userRepository.save(user);

        Member member = Member.builder()
                .userId(user.getId())
                .gymId(gym.getId())
                .address(req.getAddress())
                .age(req.getAge())
                .gender(req.getGender())
                .heightCm(req.getHeightCm())
                .weightKg(req.getWeightKg())
                .goal(req.getGoal())
                .joiningDate(LocalDate.now())
                .membershipStatus(MembershipStatus.TRIAL)
                .trialEndDate(LocalDate.now().plusDays(trialDays))
                .attendanceCode(CodeGenerator.generateAttendanceCode())
                .build();
        member = memberRepository.save(member);

        gymRepository.save(incrementMemberCount(gym));

        otpService.issueOtp(user.getEmail(), OtpPurpose.EMAIL_VERIFICATION);
        notificationService.notify(user.getId(), NotificationType.WELCOME,
                "Welcome to " + gym.getName() + "!",
                "Your " + trialDays + "-day free trial has started. Enjoy full access!");

        return buildAuthResponse(user, member.getGymId());
    }

    // ---------------------------------------------------------------- Owner adds a member manually
    @Transactional
    public ApiMessage ownerAddMember(String ownerId, String gymId, com.gymapp.dto.member.OwnerAddMemberRequest req) {
        Gym gym = gymRepository.findByIdAndOwnerId(gymId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Gym not found for this owner"));

        if (userRepository.existsByEmail(req.getEmail())) {
            throw new BadRequestException("A user already exists with this email.");
        }

        MembershipPlan plan = gym.getMembershipPlans().stream()
                .filter(p -> p.getId().equals(req.getMembershipPlanId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Membership plan not found"));

        // Temporary unusable password - member must set their own via the emailed link.
        String tempPassword = CodeGenerator.generateToken();

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .phone(req.getMobile())
                .password(passwordEncoder.encode(tempPassword))
                .role(Role.MEMBER)
                .passwordSetupPending(true)
                .build();
        user = userRepository.save(user);

        Member member = Member.builder()
                .userId(user.getId())
                .gymId(gym.getId())
                .address(req.getAddress())
                .goal(req.getGoal())
                .joiningDate(LocalDate.now())
                .membershipPlanId(plan.getId())
                .membershipStatus(MembershipStatus.ACTIVE)
                .membershipExpiry(LocalDate.now().plusDays(plan.getDurationInDays()))
                .attendanceCode(CodeGenerator.generateAttendanceCode())
                .build();
        memberRepository.save(member);

        gymRepository.save(incrementMemberCount(gym));

        String token = CodeGenerator.generateToken();
        passwordSetupTokenRepository.save(PasswordSetupToken.builder()
                .userId(user.getId())
                .token(token)
                .expiresAt(LocalDateTime.now().plusDays(2))
                .build());

        String setupLink = "https://app.healupgym.com/setup-password?token=" + token;
        emailService.send(user.getEmail(), "Welcome to " + gym.getName(),
                "Hi " + user.getName() + ", your account has been created. Set your password here: " + setupLink);
        smsService.sendSms(user.getPhone(), "Welcome to " + gym.getName() + "! Set your password: " + setupLink);

        return new ApiMessage("Member added. A welcome email/SMS with a password setup link has been sent.");
    }

    private Gym incrementMemberCount(Gym gym) {
        gym.setTotalMembers(gym.getTotalMembers() + 1);
        gym.setActiveMembers(gym.getActiveMembers() + 1);
        return gym;
    }

    // ---------------------------------------------------------------- Login / tokens
    public AuthResponse login(LoginRequest req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));

        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String gymId = resolveGymId(user);
        return buildAuthResponse(user, gymId);
    }

    public AuthResponse refresh(RefreshTokenRequest req) {
        String email = jwtService.extractEmail(req.getRefreshToken());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        UserPrincipal principal = new UserPrincipal(user);
        if (!jwtService.isTokenValid(req.getRefreshToken(), principal)) {
            throw new BadRequestException("Invalid or expired refresh token.");
        }
        String gymId = resolveGymId(user);
        return buildAuthResponse(user, gymId);
    }

    // ---------------------------------------------------------------- OTP verification
    @Transactional
    public ApiMessage verifyOtp(OtpVerifyRequest req) {
        otpService.verifyOtp(req.getIdentifier(), req.getOtp(), req.getPurpose());

        User user = req.getPurpose() == OtpPurpose.PHONE_VERIFICATION
                ? userRepository.findByPhone(req.getIdentifier()).orElseThrow(() -> new ResourceNotFoundException("User not found"))
                : userRepository.findByEmail(req.getIdentifier()).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (req.getPurpose() == OtpPurpose.EMAIL_VERIFICATION) user.setEmailVerified(true);
        if (req.getPurpose() == OtpPurpose.PHONE_VERIFICATION) user.setPhoneVerified(true);
        userRepository.save(user);

        return new ApiMessage("Verified successfully.");
    }

    public ApiMessage resendOtp(OtpRequest req) {
        otpService.issueOtp(req.getIdentifier(), req.getPurpose());
        return new ApiMessage("A new OTP has been sent.");
    }

    // ---------------------------------------------------------------- Forgot / reset / setup password
    public ApiMessage forgotPassword(ForgotPasswordRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No account found with this email."));

        String token = CodeGenerator.generateToken();
        passwordSetupTokenRepository.save(PasswordSetupToken.builder()
                .userId(user.getId())
                .token(token)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .build());

        String resetLink = "https://app.healupgym.com/reset-password?token=" + token;
        emailService.send(user.getEmail(), "Reset your password", "Reset your password here: " + resetLink);
        return new ApiMessage("Password reset instructions sent to your email.");
    }

    @Transactional
    public ApiMessage resetPassword(ResetPasswordRequest req) {
        PasswordSetupToken tokenRecord = passwordSetupTokenRepository.findByTokenAndUsedFalse(req.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid or expired token."));
        if (tokenRecord.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This link has expired. Please request a new one.");
        }
        User user = userRepository.findById(tokenRecord.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        user.setPasswordSetupPending(false);
        userRepository.save(user);

        tokenRecord.setUsed(true);
        passwordSetupTokenRepository.save(tokenRecord);

        return new ApiMessage("Password updated successfully. You can now log in.");
    }

    // ---------------------------------------------------------------- helpers
    private String resolveGymId(User user) {
        if (user.getRole() == Role.OWNER) {
            return gymRepository.findByOwnerId(user.getId()).stream().findFirst().map(Gym::getId).orElse(null);
        }
        return memberRepository.findByUserId(user.getId()).map(Member::getGymId).orElse(null);
    }

    private AuthResponse buildAuthResponse(User user, String gymId) {
        UserPrincipal principal = new UserPrincipal(user);
        String accessToken = jwtService.generateAccessToken(principal, user.getId(), user.getRole().name());
        String refreshToken = jwtService.generateRefreshToken(principal, user.getId());

        return AuthResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .gymId(gymId)
                .build();
    }

    public record ApiMessage(String message) {}
}
