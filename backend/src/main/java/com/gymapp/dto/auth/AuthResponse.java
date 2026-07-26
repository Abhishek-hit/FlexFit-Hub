package com.gymapp.dto.auth;

import com.gymapp.entity.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String userId;
    private String name;
    private String email;
    private Role role;
    private String accessToken;
    private String refreshToken;
    /** for a member, id of their gym; for an owner, could be their primary gym id */
    private String gymId;
}
