package com.gymapp.repository;

import com.gymapp.entity.DietPlan;
import com.gymapp.entity.enums.Goal;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface DietPlanRepository extends MongoRepository<DietPlan, String> {
    List<DietPlan> findByGymId(String gymId);
    Optional<DietPlan> findByGymIdAndGoalAndActiveTrue(String gymId, Goal goal);
}
