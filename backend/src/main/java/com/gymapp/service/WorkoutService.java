package com.gymapp.service;

import com.gymapp.dto.workout.*;
import com.gymapp.entity.*;
import com.gymapp.entity.enums.NotificationType;
import com.gymapp.exception.BadRequestException;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkoutService {

    private final WorkoutPlanRepository workoutPlanRepository;
    private final WorkoutProgressRepository workoutProgressRepository;
    private final MemberRepository memberRepository;
    private final GymRepository gymRepository;
    private final NotificationService notificationService;

    // ---------------------------------------------------------- owner side
    public WorkoutPlan createOrReplacePlan(String ownerId, String gymId, WorkoutPlanRequest req) {
        assertOwnsGym(ownerId, gymId);

        workoutPlanRepository.findByGymIdAndGoalAndActiveTrue(gymId, req.getGoal())
                .ifPresent(existing -> {
                    existing.setActive(false);
                    workoutPlanRepository.save(existing);
                });

        List<WorkoutDay> days = req.getDays().stream().map(d -> WorkoutDay.builder()
                .dayNumber(d.getDayNumber())
                .title(d.getTitle())
                .exercises(d.getExercises().stream().map(e -> Exercise.builder()
                        .name(e.getName())
                        .sets(e.getSets())
                        .reps(e.getReps())
                        .restTimeSeconds(e.getRestTimeSeconds())
                        .difficulty(e.getDifficulty())
                        .imageUrl(e.getImageUrl())
                        .description(e.getDescription())
                        .videoUrl(e.getVideoUrl())
                        .build()).toList())
                .build()).toList();

        WorkoutPlan plan = WorkoutPlan.builder()
                .gymId(gymId)
                .goal(req.getGoal())
                .title(req.getTitle())
                .days(days)
                .active(true)
                .build();
        plan = workoutPlanRepository.save(plan);

        // notify all active members with this goal
        memberRepository.findByGymId(gymId).stream()
                .filter(m -> m.getGoal() == req.getGoal())
                .forEach(m -> notificationService.notify(m.getUserId(), NotificationType.NEW_WORKOUT,
                        "New workout plan available", "A new " + req.getGoal() + " workout plan has been published."));

        return plan;
    }

    public List<WorkoutPlan> gymPlans(String ownerId, String gymId) {
        assertOwnsGym(ownerId, gymId);
        return workoutPlanRepository.findByGymId(gymId);
    }

    // ---------------------------------------------------------- member side
    public WorkoutPlan myWorkoutPlan(String userId) {
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member profile not found"));
        if (member.getGoal() == null) {
            throw new BadRequestException("Set a fitness goal on your profile first.");
        }
        return workoutPlanRepository.findByGymIdAndGoalAndActiveTrue(member.getGymId(), member.getGoal())
                .orElseThrow(() -> new ResourceNotFoundException("No workout plan published for your goal yet."));
    }

    public ProgressResponse markDayComplete(String userId, WorkoutCompleteRequest req) {
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member profile not found"));

        LocalDate today = LocalDate.now();
        if (workoutProgressRepository.findByMemberIdAndDate(member.getId(), today).isPresent()) {
            throw new BadRequestException("Today's workout is already marked as completed.");
        }

        workoutProgressRepository.save(WorkoutProgress.builder()
                .memberId(member.getId())
                .date(today)
                .completed(true)
                .workoutDayNumber(req.getDayNumber())
                .build());

        // streak logic: if yesterday was also completed, extend streak; else restart at 1
        boolean yesterdayDone = workoutProgressRepository.findByMemberIdAndDate(member.getId(), today.minusDays(1)).isPresent();
        int newStreak = yesterdayDone ? member.getCurrentStreak() + 1 : 1;

        member.setCurrentStreak(newStreak);
        member.setLongestStreak(Math.max(member.getLongestStreak(), newStreak));
        member.setTotalWorkoutDays(member.getTotalWorkoutDays() + 1);
        memberRepository.save(member);

        return progressFor(member);
    }

    public ProgressResponse myProgress(String userId) {
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member profile not found"));
        return progressFor(member);
    }

    private ProgressResponse progressFor(Member member) {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(6);
        LocalDate monthStart = today.withDayOfMonth(1);

        List<WorkoutProgress> monthRecords = workoutProgressRepository
                .findByMemberIdAndDateBetweenOrderByDateAsc(member.getId(), monthStart, today);

        long completedThisWeek = monthRecords.stream().filter(p -> !p.getDate().isBefore(weekStart)).count();

        return ProgressResponse.builder()
                .currentStreak(member.getCurrentStreak())
                .longestStreak(member.getLongestStreak())
                .totalWorkoutDays(member.getTotalWorkoutDays())
                .completedThisWeek((int) completedThisWeek)
                .completedThisMonth(monthRecords.size())
                .completedDatesThisMonth(monthRecords.stream().map(p -> p.getDate().toString()).toList())
                .build();
    }

    private void assertOwnsGym(String ownerId, String gymId) {
        gymRepository.findByIdAndOwnerId(gymId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Gym not found for this owner"));
    }
}
