package com.gymapp.repository;

import com.gymapp.entity.Attendance;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends MongoRepository<Attendance, String> {
    List<Attendance> findByMemberIdAndDateBetween(String memberId, LocalDate from, LocalDate to);
    List<Attendance> findByGymIdAndDate(String gymId, LocalDate date);
    List<Attendance> findByGymIdAndDateBetween(String gymId, LocalDate from, LocalDate to);
    Optional<Attendance> findByMemberIdAndDate(String memberId, LocalDate date);
    long countByGymIdAndDate(String gymId, LocalDate date);
}
