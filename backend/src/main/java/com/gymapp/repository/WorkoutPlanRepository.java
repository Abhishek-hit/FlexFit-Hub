package com.gymapp.repository;

import com.gymapp.entity.WorkoutPlan;
import com.gymapp.entity.enums.Goal;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface WorkoutPlanRepository extends MongoRepository<WorkoutPlan, String> {
    List<WorkoutPlan> findByGymId(String gymId);
    Optional<WorkoutPlan> findByGymIdAndGoalAndActiveTrue(String gymId, Goal goal);
}
