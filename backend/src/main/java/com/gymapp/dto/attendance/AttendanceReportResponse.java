package com.gymapp.dto.attendance;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceReportResponse {
    private long todayCount;
    private long weeklyCount;
    private long monthlyCount;
    private long lastMonthCount;
    private double attendancePercentage;
    private long lateEntries;
}
