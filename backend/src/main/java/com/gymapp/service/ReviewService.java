package com.gymapp.service;

import com.gymapp.dto.review.ReviewRequest;
import com.gymapp.dto.review.ReviewResponse;
import com.gymapp.entity.Member;
import com.gymapp.entity.Review;
import com.gymapp.entity.User;
import com.gymapp.exception.BadRequestException;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.repository.MemberRepository;
import com.gymapp.repository.ReviewRepository;
import com.gymapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    private final GymService gymService;

    public ReviewResponse addReview(String userId, String gymId, ReviewRequest req) {
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member profile not found"));

        if (!member.getGymId().equals(gymId)) {
            throw new BadRequestException("You can only review the gym you are a member of.");
        }
        if (reviewRepository.existsByGymIdAndMemberId(gymId, member.getId())) {
            throw new BadRequestException("You have already reviewed this gym.");
        }

        Review review = Review.builder()
                .gymId(gymId)
                .memberId(member.getId())
                .rating(req.getRating())
                .comment(req.getComment())
                .images(req.getImageUrls())
                .build();
        review = reviewRepository.save(review);

        recalcGymRating(gymId);

        User user = userRepository.findById(userId).orElse(null);
        return toResponse(review, user);
    }

    public List<ReviewResponse> gymReviews(String gymId) {
        List<Review> reviews = reviewRepository.findByGymId(gymId);
        return reviews.stream().map(r -> {
            Member m = memberRepository.findById(r.getMemberId()).orElse(null);
            User u = m != null ? userRepository.findById(m.getUserId()).orElse(null) : null;
            return toResponse(r, u);
        }).toList();
    }

    private void recalcGymRating(String gymId) {
        List<Review> all = reviewRepository.findByGymId(gymId);
        double avg = all.stream().mapToInt(Review::getRating).average().orElse(0);
        gymService.recalculateRating(gymId, avg, all.size());
    }

    private ReviewResponse toResponse(Review r, User user) {
        return ReviewResponse.builder()
                .id(r.getId())
                .memberName(user != null ? user.getName() : "Anonymous")
                .rating(r.getRating())
                .comment(r.getComment())
                .images(r.getImages())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
