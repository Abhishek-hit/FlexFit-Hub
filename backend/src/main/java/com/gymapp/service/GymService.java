package com.gymapp.service;

import com.gymapp.dto.gym.*;
import com.gymapp.entity.Gym;
import com.gymapp.entity.MembershipPlan;
import com.gymapp.exception.BadRequestException;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.repository.GymRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.Comparator;

@Service
@RequiredArgsConstructor
public class GymService {

    private final GymRepository gymRepository;
    private final MongoTemplate mongoTemplate;

    // ---------------------------------------------------------- public search / listing
    public List<GymResponse> search(GymSearchFilter filter) {
        Query query = new Query();

        if (filter.getQuery() != null && !filter.getQuery().isBlank()) {
            query.addCriteria(Criteria.where("name").regex(filter.getQuery(), "i"));
        }
        if (filter.getState() != null) {
            query.addCriteria(Criteria.where("state").regex("^" + filter.getState() + "$", "i"));
        }
        if (filter.getCity() != null) {
            query.addCriteria(Criteria.where("city").regex("^" + filter.getCity() + "$", "i"));
        }
        if (filter.getMinRating() != null) {
            query.addCriteria(Criteria.where("avgRating").gte(filter.getMinRating()));
        }
        if (Boolean.TRUE.equals(filter.getWeightGainSpecialized())) {
            query.addCriteria(Criteria.where("weightGainSpecialized").is(true));
        }
        if (Boolean.TRUE.equals(filter.getWeightLossSpecialized())) {
            query.addCriteria(Criteria.where("weightLossSpecialized").is(true));
        }
        query.addCriteria(Criteria.where("active").is(true));

        List<Gym> gyms = mongoTemplate.find(query, Gym.class);

        List<GymResponse> responses = gyms.stream().map(this::toResponse).toList();

        if (filter.getMaxPrice() != null) {
            responses = responses.stream()
                    .filter(g -> g.getStartingPrice() == 0 || g.getStartingPrice() <= filter.getMaxPrice())
                    .toList();
        }

        if (filter.getLat() != null && filter.getLng() != null) {
            responses = responses.stream()
                    .sorted(Comparator.comparingDouble(g -> distanceKm(filter.getLat(), filter.getLng(), g.getLatitude(), g.getLongitude())))
                    .toList();
            if (filter.getMaxDistanceKm() != null) {
                responses = responses.stream()
                        .filter(g -> distanceKm(filter.getLat(), filter.getLng(), g.getLatitude(), g.getLongitude()) <= filter.getMaxDistanceKm())
                        .toList();
            }
        }

        return responses;
    }

    public List<GymResponse> topTen() {
        return gymRepository.findTop10ByOrderByAvgRatingDescTotalReviewsDesc()
                .stream().map(this::toResponse).toList();
    }

    public GymResponse getById(String gymId) {
        Gym gym = gymRepository.findById(gymId).orElseThrow(() -> new ResourceNotFoundException("Gym not found"));
        return toResponse(gym);
    }

    // ---------------------------------------------------------- owner profile management
    public GymResponse getOwnerGym(String ownerId, String gymId) {
        Gym gym = gymRepository.findByIdAndOwnerId(gymId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Gym not found for this owner"));
        return toResponse(gym);
    }

    public List<GymResponse> getOwnerGyms(String ownerId) {
        return gymRepository.findByOwnerId(ownerId).stream().map(this::toResponse).toList();
    }

    public GymResponse updateGym(String ownerId, String gymId, GymUpdateRequest req) {
        Gym gym = gymRepository.findByIdAndOwnerId(gymId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Gym not found for this owner"));

        if (req.getName() != null) gym.setName(req.getName());
        if (req.getDescription() != null) gym.setDescription(req.getDescription());
        if (req.getAddress() != null) gym.setAddress(req.getAddress());
        if (req.getState() != null) gym.setState(req.getState());
        if (req.getCity() != null) gym.setCity(req.getCity());
        if (req.getContactNumber() != null) gym.setContactNumber(req.getContactNumber());
        if (req.getOpeningTime() != null) gym.setOpeningTime(LocalTime.parse(req.getOpeningTime()));
        if (req.getClosingTime() != null) gym.setClosingTime(LocalTime.parse(req.getClosingTime()));
        if (req.getFacilities() != null) gym.setFacilities(req.getFacilities());
        if (req.getWeightGainSpecialized() != null) gym.setWeightGainSpecialized(req.getWeightGainSpecialized());
        if (req.getWeightLossSpecialized() != null) gym.setWeightLossSpecialized(req.getWeightLossSpecialized());
        if (req.getUpiId() != null) gym.setUpiId(req.getUpiId());
        if (req.getLatitude() != null && req.getLongitude() != null) {
            gym.setLocation(new GeoJsonPoint(req.getLongitude(), req.getLatitude()));
        }

        return toResponse(gymRepository.save(gym));
    }

    public GymResponse addImage(String ownerId, String gymId, String imageUrl) {
        Gym gym = gymRepository.findByIdAndOwnerId(gymId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Gym not found for this owner"));
        var images = new java.util.ArrayList<>(gym.getImages() == null ? List.of() : gym.getImages());
        images.add(imageUrl);
        gym.setImages(images);
        return toResponse(gymRepository.save(gym));
    }

    // ---------------------------------------------------------- membership plans
    public GymResponse addMembershipPlan(String ownerId, String gymId, MembershipPlanRequest req) {
        Gym gym = gymRepository.findByIdAndOwnerId(gymId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Gym not found for this owner"));

        MembershipPlan plan = MembershipPlan.builder()
                .id(UUID.randomUUID().toString())
                .name(req.getName())
                .durationInDays(req.getDurationInDays())
                .price(req.getPrice())
                .features(req.getFeatures())
                .build();

        var plans = new java.util.ArrayList<>(gym.getMembershipPlans() == null ? List.of() : gym.getMembershipPlans());
        plans.add(plan);
        gym.setMembershipPlans(plans);
        return toResponse(gymRepository.save(gym));
    }

    public GymResponse removeMembershipPlan(String ownerId, String gymId, String planId) {
        Gym gym = gymRepository.findByIdAndOwnerId(gymId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Gym not found for this owner"));

        var plans = gym.getMembershipPlans().stream().filter(p -> !p.getId().equals(planId)).toList();
        gym.setMembershipPlans(plans);
        return toResponse(gymRepository.save(gym));
    }

    // ---------------------------------------------------------- rating recompute (called by ReviewService)
    public void recalculateRating(String gymId, double newAvg, int totalReviews) {
        Gym gym = gymRepository.findById(gymId).orElseThrow(() -> new ResourceNotFoundException("Gym not found"));
        gym.setAvgRating(Math.round(newAvg * 10.0) / 10.0);
        gym.setTotalReviews(totalReviews);
        gymRepository.save(gym);
    }

    // ---------------------------------------------------------- helpers
    private double distanceKm(double lat1, double lon1, Double lat2, Double lon2) {
        if (lat2 == null || lon2 == null) return Double.MAX_VALUE;
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private GymResponse toResponse(Gym gym) {
        Double lat = gym.getLocation() != null ? gym.getLocation().getY() : null;
        Double lng = gym.getLocation() != null ? gym.getLocation().getX() : null;
        double startingPrice = gym.getMembershipPlans() == null || gym.getMembershipPlans().isEmpty() ? 0 :
                gym.getMembershipPlans().stream().mapToDouble(MembershipPlan::getPrice).min().orElse(0);

        return GymResponse.builder()
                .id(gym.getId())
                .name(gym.getName())
                .description(gym.getDescription())
                .address(gym.getAddress())
                .state(gym.getState())
                .city(gym.getCity())
                .latitude(lat)
                .longitude(lng)
                .images(gym.getImages())
                .contactNumber(gym.getContactNumber())
                .openingTime(gym.getOpeningTime())
                .closingTime(gym.getClosingTime())
                .facilities(gym.getFacilities())
                .weightGainSpecialized(gym.isWeightGainSpecialized())
                .weightLossSpecialized(gym.isWeightLossSpecialized())
                .membershipPlans(gym.getMembershipPlans())
                .avgRating(gym.getAvgRating())
                .totalReviews(gym.getTotalReviews())
                .totalMembers(gym.getTotalMembers())
                .startingPrice(startingPrice)
                .build();
    }
}
