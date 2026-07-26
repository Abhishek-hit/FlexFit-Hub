package com.gymapp.repository;

import com.gymapp.entity.Gym;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface GymRepository extends MongoRepository<Gym, String> {
    List<Gym> findByOwnerId(String ownerId);
    List<Gym> findByStateIgnoreCaseAndCityIgnoreCase(String state, String city);
    List<Gym> findByCityIgnoreCase(String city);
    List<Gym> findByStateIgnoreCase(String state);
    List<Gym> findByNameContainingIgnoreCase(String name);
    List<Gym> findTop10ByOrderByAvgRatingDescTotalReviewsDesc();
    List<Gym> findByWeightGainSpecializedTrue();
    List<Gym> findByWeightLossSpecializedTrue();
    Optional<Gym> findByIdAndOwnerId(String id, String ownerId);
}
