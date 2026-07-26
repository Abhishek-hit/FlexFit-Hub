package com.gymapp.controller;

import com.gymapp.dto.attendance.AttendanceResponse;
import com.gymapp.dto.attendance.CheckInRequest;
import com.gymapp.service.AttendanceService;
import com.gymapp.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Shared check-in endpoint - hit either by the member's own app (QR/NFC/GPS scan) or by
 * gym staff/kiosk scanning a member's QR code. Authentication is optional here on purpose
 * so a gym-floor kiosk/tablet (not logged in as any particular user) can also check members in;
 * the attendanceCode itself is the source of truth for which member is being marked present.
 */
@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceCheckInController {

    private final AttendanceService attendanceService;

    @PostMapping("/check-in")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkIn(@Valid @RequestBody CheckInRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Checked in successfully", attendanceService.checkIn(req)));
    }
}
