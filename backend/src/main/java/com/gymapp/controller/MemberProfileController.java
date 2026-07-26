package com.gymapp.controller;

import com.gymapp.dto.member.MemberResponse;
import com.gymapp.dto.member.MemberUpdateRequest;
import com.gymapp.security.UserPrincipal;
import com.gymapp.service.MemberService;
import com.gymapp.service.integration.FileStorageService;
import com.gymapp.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/member/profile")
@RequiredArgsConstructor
public class MemberProfileController {

    private final MemberService memberService;
    private final FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<ApiResponse<MemberResponse>> myProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("OK", memberService.getMyProfile(principal.getId())));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<MemberResponse>> updateProfile(@AuthenticationPrincipal UserPrincipal principal,
                                                                       @RequestBody MemberUpdateRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated", memberService.updateMyProfile(principal.getId(), req)));
    }

    @PostMapping("/photo")
    public ResponseEntity<ApiResponse<MemberResponse>> uploadPhoto(@AuthenticationPrincipal UserPrincipal principal,
                                                                     @RequestParam MultipartFile file) {
        String url = fileStorageService.uploadImage(file, "members/" + principal.getId());
        MemberUpdateRequest req = new MemberUpdateRequest();
        req.setPhotoUrl(url);
        return ResponseEntity.ok(ApiResponse.success("Photo uploaded", memberService.updateMyProfile(principal.getId(), req)));
    }
}
