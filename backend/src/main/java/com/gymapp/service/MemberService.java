package com.gymapp.service;

import com.gymapp.dto.member.MemberResponse;
import com.gymapp.dto.member.MemberUpdateRequest;
import com.gymapp.entity.Gym;
import com.gymapp.entity.Member;
import com.gymapp.entity.MembershipPlan;
import com.gymapp.entity.User;
import com.gymapp.exception.ResourceNotFoundException;
import com.gymapp.repository.GymRepository;
import com.gymapp.repository.MemberRepository;
import com.gymapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    private final GymRepository gymRepository;

    // ---------------------------------------------------------- owner side
    public List<MemberResponse> listGymMembers(String ownerId, String gymId) {
        assertOwnsGym(ownerId, gymId);
        List<Member> members = memberRepository.findByGymId(gymId);
        return enrich(members);
    }

    public List<MemberResponse> searchGymMembers(String ownerId, String gymId, String query) {
        assertOwnsGym(ownerId, gymId);
        List<Member> members = memberRepository.findByGymId(gymId);
        List<String> userIds = members.stream().map(Member::getUserId).toList();
        Map<String, User> usersById = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        String q = query == null ? "" : query.toLowerCase();
        List<Member> filtered = members.stream()
                .filter(m -> {
                    User u = usersById.get(m.getUserId());
                    return u != null && (u.getName().toLowerCase().contains(q)
                            || u.getEmail().toLowerCase().contains(q)
                            || u.getPhone().contains(q));
                }).toList();
        return enrich(filtered);
    }

    public MemberResponse updateMember(String ownerId, String gymId, String memberId, MemberUpdateRequest req) {
        assertOwnsGym(ownerId, gymId);
        Member member = memberRepository.findById(memberId)
                .filter(m -> m.getGymId().equals(gymId))
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        User user = userRepository.findById(member.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (req.getName() != null) { user.setName(req.getName()); userRepository.save(user); }
        if (req.getAddress() != null) member.setAddress(req.getAddress());
        if (req.getAge() != null) member.setAge(req.getAge());
        if (req.getGender() != null) member.setGender(req.getGender());
        if (req.getHeightCm() != null) member.setHeightCm(req.getHeightCm());
        if (req.getWeightKg() != null) member.setWeightKg(req.getWeightKg());
        if (req.getGoal() != null) member.setGoal(req.getGoal());
        if (req.getPhotoUrl() != null) member.setPhotoUrl(req.getPhotoUrl());

        member = memberRepository.save(member);
        return toResponse(member, user);
    }

    public void deleteMember(String ownerId, String gymId, String memberId) {
        Gym gym = assertOwnsGym(ownerId, gymId);
        Member member = memberRepository.findById(memberId)
                .filter(m -> m.getGymId().equals(gymId))
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        memberRepository.delete(member);
        userRepository.findById(member.getUserId()).ifPresent(u -> {
            u.setEnabled(false);
            userRepository.save(u);
        });

        gym.setTotalMembers(Math.max(0, gym.getTotalMembers() - 1));
        gym.setActiveMembers(Math.max(0, gym.getActiveMembers() - 1));
        gymRepository.save(gym);
    }

    public MemberResponse getMemberDetail(String ownerId, String gymId, String memberId) {
        assertOwnsGym(ownerId, gymId);
        Member member = memberRepository.findById(memberId)
                .filter(m -> m.getGymId().equals(gymId))
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));
        User user = userRepository.findById(member.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toResponse(member, user);
    }

    // ---------------------------------------------------------- member (self) side
    public MemberResponse getMyProfile(String userId) {
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member profile not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toResponse(member, user);
    }

    public MemberResponse updateMyProfile(String userId, MemberUpdateRequest req) {
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member profile not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (req.getName() != null) { user.setName(req.getName()); userRepository.save(user); }
        if (req.getAddress() != null) member.setAddress(req.getAddress());
        if (req.getAge() != null) member.setAge(req.getAge());
        if (req.getGender() != null) member.setGender(req.getGender());
        if (req.getHeightCm() != null) member.setHeightCm(req.getHeightCm());
        if (req.getWeightKg() != null) member.setWeightKg(req.getWeightKg());
        if (req.getGoal() != null) member.setGoal(req.getGoal());
        if (req.getPhotoUrl() != null) member.setPhotoUrl(req.getPhotoUrl());

        member = memberRepository.save(member);
        return toResponse(member, user);
    }

    // ---------------------------------------------------------- helpers
    private Gym assertOwnsGym(String ownerId, String gymId) {
        return gymRepository.findByIdAndOwnerId(gymId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Gym not found for this owner"));
    }

    private List<MemberResponse> enrich(List<Member> members) {
        List<String> userIds = members.stream().map(Member::getUserId).toList();
        Map<String, User> usersById = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));
        return members.stream()
                .map(m -> toResponse(m, usersById.get(m.getUserId())))
                .toList();
    }

    private MemberResponse toResponse(Member m, User user) {
        Gym gym = gymRepository.findById(m.getGymId()).orElse(null);
        String planName = null;
        if (gym != null && m.getMembershipPlanId() != null) {
            planName = gym.getMembershipPlans().stream()
                    .filter(p -> p.getId().equals(m.getMembershipPlanId()))
                    .map(MembershipPlan::getName)
                    .findFirst().orElse(null);
        }

        return MemberResponse.builder()
                .id(m.getId())
                .name(user != null ? user.getName() : null)
                .email(user != null ? user.getEmail() : null)
                .mobile(user != null ? user.getPhone() : null)
                .photoUrl(m.getPhotoUrl())
                .address(m.getAddress())
                .age(m.getAge())
                .gender(m.getGender())
                .heightCm(m.getHeightCm())
                .weightKg(m.getWeightKg())
                .bmi(m.bmi())
                .goal(m.getGoal())
                .joiningDate(m.getJoiningDate())
                .membershipPlanId(m.getMembershipPlanId())
                .membershipPlanName(planName)
                .membershipStatus(m.getMembershipStatus())
                .membershipExpiry(m.getMembershipExpiry())
                .trialEndDate(m.getTrialEndDate())
                .currentStreak(m.getCurrentStreak())
                .longestStreak(m.getLongestStreak())
                .totalWorkoutDays(m.getTotalWorkoutDays())
                .attendanceCode(m.getAttendanceCode())
                .build();
    }
}
