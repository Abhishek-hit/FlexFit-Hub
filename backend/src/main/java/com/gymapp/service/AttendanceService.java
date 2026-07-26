package com.gymapp.service;

import com.gymapp.dto.attendance.*;
import com.gymapp.entity.*;
import com.gymapp.entity.enums.NotificationType;
import com.gymapp.exception.BadRequestException;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    private final GymRepository gymRepository;

    private final RealtimePushService realtimePushService;
    private final NotificationService notificationService;

    /** LATE cutoff - after this local time, a check-in is flagged late. Configurable per gym in future. */
    private static final LocalTime LATE_CUTOFF = LocalTime.of(10, 0);

    public AttendanceResponse checkIn(CheckInRequest req) {
        Member member = memberRepository.findByAttendanceCode(req.getCode())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid attendance code"));

        LocalDate today = LocalDate.now();
        if (attendanceRepository.findByMemberIdAndDate(member.getId(), today).isPresent()) {
            throw new BadRequestException("Attendance already marked for today.");
        }

        LocalDateTime now = LocalDateTime.now();
        Attendance attendance = Attendance.builder()
                .memberId(member.getId())
                .gymId(member.getGymId())
                .date(today)
                .checkInTime(now)
                .method(req.getMethod())
                .late(now.toLocalTime().isAfter(LATE_CUTOFF))
                .build();
        attendance = attendanceRepository.save(attendance);

        User user = userRepository.findById(member.getUserId()).orElse(null);
        AttendanceResponse response = toResponse(attendance, user);

        realtimePushService.pushAttendance(member.getGymId(), response);
        if (user != null) {
            notificationService.notify(user.getId(), NotificationType.ATTENDANCE_MARKED,
                    "Attendance marked", "Your attendance for today has been recorded. Keep up the streak!");
        }

        return response;
    }

    // ---------------------------------------------------------- owner side reports
    public List<AttendanceResponse> gymAttendanceForDate(String ownerId, String gymId, LocalDate date) {
        assertOwnsGym(ownerId, gymId);
        return attendanceRepository.findByGymIdAndDate(gymId, date).stream()
                .map(a -> toResponse(a, resolveUser(a.getMemberId())))
                .toList();
    }

    public AttendanceReportResponse gymAttendanceReport(String ownerId, String gymId) {
        assertOwnsGym(ownerId, gymId);
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(6);
        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate lastMonthStart = monthStart.minusMonths(1);
        LocalDate lastMonthEnd = monthStart.minusDays(1);

        long todayCount = attendanceRepository.countByGymIdAndDate(gymId, today);
        long weeklyCount = attendanceRepository.findByGymIdAndDateBetween(gymId, weekStart, today).size();
        long monthlyCount = attendanceRepository.findByGymIdAndDateBetween(gymId, monthStart, today).size();
        long lastMonthCount = attendanceRepository.findByGymIdAndDateBetween(gymId, lastMonthStart, lastMonthEnd).size();
        long lateEntries = attendanceRepository.findByGymIdAndDateBetween(gymId, monthStart, today).stream()
                .filter(Attendance::isLate).count();

        long totalMembers = Math.max(1, memberRepository.countByGymId(gymId));
        double attendancePercentage = Math.round((todayCount * 100.0 / totalMembers) * 10.0) / 10.0;

        return AttendanceReportResponse.builder()
                .todayCount(todayCount)
                .weeklyCount(weeklyCount)
                .monthlyCount(monthlyCount)
                .lastMonthCount(lastMonthCount)
                .attendancePercentage(attendancePercentage)
                .lateEntries(lateEntries)
                .build();
    }

    // ---------------------------------------------------------- member side
    public List<AttendanceResponse> myAttendance(String userId, LocalDate from, LocalDate to) {
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member profile not found"));
        User user = userRepository.findById(userId).orElse(null);
        return attendanceRepository.findByMemberIdAndDateBetween(member.getId(), from, to).stream()
                .map(a -> toResponse(a, user))
                .toList();
    }

    // ---------------------------------------------------------- helpers
    private void assertOwnsGym(String ownerId, String gymId) {
        gymRepository.findByIdAndOwnerId(gymId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Gym not found for this owner"));
    }

    private User resolveUser(String memberId) {
        return memberRepository.findById(memberId)
                .flatMap(m -> userRepository.findById(m.getUserId()))
                .orElse(null);
    }

    private AttendanceResponse toResponse(Attendance a, User user) {
        return AttendanceResponse.builder()
                .id(a.getId())
                .memberId(a.getMemberId())
                .memberName(user != null ? user.getName() : null)
                .date(a.getDate())
                .checkInTime(a.getCheckInTime())
                .method(a.getMethod())
                .late(a.isLate())
                .build();
    }
}
