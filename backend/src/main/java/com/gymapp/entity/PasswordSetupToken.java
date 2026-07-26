package com.gymapp.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/** Used both for forgot-password reset and for owner-created-member initial password setup. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "password_setup_tokens")
public class PasswordSetupToken {

    @Id
    private String id;

    private String userId;
    private String token;

    private LocalDateTime expiresAt;

    @Builder.Default
    private boolean used = false;
}
