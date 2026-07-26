package com.gymapp.repository;

import com.gymapp.entity.Review;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByGymId(String gymId);
    List<Review> findByMemberId(String memberId);
    boolean existsByGymIdAndMemberId(String gymId, String memberId);
}
