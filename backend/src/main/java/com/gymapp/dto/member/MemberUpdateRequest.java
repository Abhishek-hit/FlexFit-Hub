package com.gymapp.dto.member;

import com.gymapp.entity.enums.Gender;
import com.gymapp.entity.enums.Goal;
import lombok.Data;

@Data
public class MemberUpdateRequest {
    private String name;
    private String address;
    private Integer age;
    private Gender gender;
    private Double heightCm;
    private Double weightKg;
    private Goal goal;
    private String photoUrl;
}
