package com.gymapp.dto.attendance;

import com.gymapp.entity.enums.AttendanceMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceResponse {
    private String id;
    private String memberId;
    private String memberName;
    private LocalDate date;
    private LocalDateTime checkInTime;
    private AttendanceMethod method;
    private boolean late;
}
