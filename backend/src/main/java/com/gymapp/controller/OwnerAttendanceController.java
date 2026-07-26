package com.gymapp.controller;

import com.gymapp.dto.attendance.AttendanceReportResponse;
import com.gymapp.dto.attendance.AttendanceResponse;
import com.gymapp.security.UserPrincipal;
import com.gymapp.service.AttendanceService;
import com.gymapp.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/owner/gyms/{gymId}/attendance")
@RequiredArgsConstructor
public class OwnerAttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> byDate(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String gymId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate target = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(ApiResponse.success("OK",
                attendanceService.gymAttendanceForDate(principal.getId(), gymId, target)));
    }

    @GetMapping("/report")
    public ResponseEntity<ApiResponse<AttendanceReportResponse>> report(@AuthenticationPrincipal UserPrincipal principal,
                                                                          @PathVariable String gymId) {
        return ResponseEntity.ok(ApiResponse.success("OK", attendanceService.gymAttendanceReport(principal.getId(), gymId)));
    }
}
