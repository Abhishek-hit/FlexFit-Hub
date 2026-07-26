package com.gymapp.entity;

import com.gymapp.entity.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Base authentication entity shared by Gym Owners and Members.
 * Role-specific profile data lives in {@link Gym} (owner) and {@link Member}.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    @Indexed(unique = true)
    private String phone;

    private String password;

    private Role role;

    @Builder.Default
    private boolean emailVerified = false;

    @Builder.Default
    private boolean phoneVerified = false;

    @Builder.Default
    private boolean enabled = true;

    /** Set true when an owner created a member and the member hasn't set their own password yet. */
    @Builder.Default
    private boolean passwordSetupPending = false;

    @CreatedDate
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
