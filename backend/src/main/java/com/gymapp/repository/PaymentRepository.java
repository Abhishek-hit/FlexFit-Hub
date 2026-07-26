package com.gymapp.repository;

import com.gymapp.entity.Payment;
import com.gymapp.entity.enums.FeeStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface PaymentRepository extends MongoRepository<Payment, String> {
    List<Payment> findByMemberId(String memberId);
    List<Payment> findByGymId(String gymId);
    List<Payment> findByGymIdAndStatus(String gymId, FeeStatus status);
    List<Payment> findByDueDateBeforeAndStatus(LocalDate date, FeeStatus status);
    List<Payment> findByGymIdAndPaidDateBetween(String gymId, LocalDateTime from, LocalDateTime to);
}
