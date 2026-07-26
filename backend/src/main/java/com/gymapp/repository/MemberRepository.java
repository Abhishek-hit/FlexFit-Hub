package com.gymapp.repository;

import com.gymapp.entity.Member;
import com.gymapp.entity.enums.MembershipStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MemberRepository extends MongoRepository<Member, String> {
    Optional<Member> findByUserId(String userId);
    List<Member> findByGymId(String gymId);
    List<Member> findByGymIdAndMembershipStatus(String gymId, MembershipStatus status);
    long countByGymId(String gymId);
    long countByGymIdAndMembershipStatus(String gymId, MembershipStatus status);
    List<Member> findByMembershipExpiryBeforeAndMembershipStatus(LocalDate date, MembershipStatus status);
    List<Member> findByTrialEndDateBeforeAndMembershipStatus(LocalDate date, MembershipStatus status);
    Optional<Member> findByAttendanceCode(String attendanceCode);
}
