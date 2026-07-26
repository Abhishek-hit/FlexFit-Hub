package com.gymapp.service;

import com.gymapp.dto.diet.*;
import com.gymapp.entity.*;
import com.gymapp.entity.enums.NotificationType;
import com.gymapp.exception.BadRequestException;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DietService {

    private final DietPlanRepository dietPlanRepository;
    private final MemberRepository memberRepository;
    private final GymRepository gymRepository;
    private final NotificationService notificationService;

    public DietPlan createOrReplacePlan(String ownerId, String gymId, DietPlanRequest req) {
        assertOwnsGym(ownerId, gymId);

        dietPlanRepository.findByGymIdAndGoalAndActiveTrue(gymId, req.getGoal())
                .ifPresent(existing -> {
                    existing.setActive(false);
                    dietPlanRepository.save(existing);
                });

        List<DietDay> days = req.getDays().stream().map(d -> {
            Meal breakfast = toMeal(d.getBreakfast());
            Meal lunch = toMeal(d.getLunch());
            Meal dinner = toMeal(d.getDinner());
            Meal snacks = toMeal(d.getSnacks());
            double total = breakfast.getCalories() + lunch.getCalories() + dinner.getCalories() + snacks.getCalories();
            return DietDay.builder()
                    .dayNumber(d.getDayNumber())
                    .breakfast(breakfast)
                    .lunch(lunch)
                    .dinner(dinner)
                    .snacks(snacks)
                    .totalCalories(total)
                    .waterIntakeLiters(d.getWaterIntakeLiters())
                    .build();
        }).toList();

        DietPlan plan = DietPlan.builder()
                .gymId(gymId)
                .goal(req.getGoal())
                .title(req.getTitle())
                .days(days)
                .active(true)
                .build();
        plan = dietPlanRepository.save(plan);

        memberRepository.findByGymId(gymId).stream()
                .filter(m -> m.getGoal() == req.getGoal())
                .forEach(m -> notificationService.notify(m.getUserId(), NotificationType.NEW_DIET_PLAN,
                        "New diet plan available", "A new " + req.getGoal() + " diet plan has been published."));

        return plan;
    }

    public List<DietPlan> gymPlans(String ownerId, String gymId) {
        assertOwnsGym(ownerId, gymId);
        return dietPlanRepository.findByGymId(gymId);
    }

    public DietPlan myDietPlan(String userId) {
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member profile not found"));
        if (member.getGoal() == null) {
            throw new BadRequestException("Set a fitness goal on your profile first.");
        }
        return dietPlanRepository.findByGymIdAndGoalAndActiveTrue(member.getGymId(), member.getGoal())
                .orElseThrow(() -> new ResourceNotFoundException("No diet plan published for your goal yet."));
    }

    private Meal toMeal(MealDTO dto) {
        return Meal.builder()
                .description(dto.getDescription())
                .calories(dto.getCalories())
                .proteinGrams(dto.getProteinGrams())
                .carbsGrams(dto.getCarbsGrams())
                .fatsGrams(dto.getFatsGrams())
                .build();
    }

    private void assertOwnsGym(String ownerId, String gymId) {
        gymRepository.findByIdAndOwnerId(gymId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Gym not found for this owner"));
    }
}
