package com.gymapp.repository;

import com.gymapp.entity.WorkoutProgress;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WorkoutProgressRepository extends MongoRepository<WorkoutProgress, String> {
    List<WorkoutProgress> findByMemberIdAndDateBetweenOrderByDateAsc(String memberId, LocalDate from, LocalDate to);
    Optional<WorkoutProgress> findByMemberIdAndDate(String memberId, LocalDate date);
    long countByMemberId(String memberId);
}
