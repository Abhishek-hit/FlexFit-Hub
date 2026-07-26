package com.gymapp.entity;

import com.gymapp.entity.enums.Goal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "workout_plans")
public class WorkoutPlan {

    @Id
    private String id;

    private String gymId;

    private Goal goal; // WEIGHT_GAIN or WEIGHT_LOSS

    private String title;

    /** exactly 7 entries, dayNumber 1..7 */
    private List<WorkoutDay> days;

    @Builder.Default
    private boolean active = true;

    @CreatedDate
    private LocalDateTime createdAt;
}
