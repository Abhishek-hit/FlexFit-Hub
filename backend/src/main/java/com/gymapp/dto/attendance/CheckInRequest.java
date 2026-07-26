package com.gymapp.dto.attendance;

import com.gymapp.entity.enums.AttendanceMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CheckInRequest {
    /** the member's attendanceCode, scanned via QR/NFC, or member id for owner-manual entry */
    @NotBlank private String code;
    @NotNull private AttendanceMethod method;
    private Double gpsLat;
    private Double gpsLng;
}
