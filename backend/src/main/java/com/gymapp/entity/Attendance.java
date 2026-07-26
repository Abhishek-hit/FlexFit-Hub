package com.gymapp.entity;

import com.gymapp.entity.enums.AttendanceMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "attendance")
public class Attendance {

    @Id
    private String id;

    private String memberId;
    private String gymId;

    private LocalDate date;
    private LocalDateTime checkInTime;

    private AttendanceMethod method;

    @Builder.Default
    private boolean late = false;
}
