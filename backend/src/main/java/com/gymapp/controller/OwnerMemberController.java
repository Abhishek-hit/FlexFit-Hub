package com.gymapp.controller;

import com.gymapp.dto.member.*;
import com.gymapp.security.UserPrincipal;
import com.gymapp.service.AuthService;
import com.gymapp.service.MemberService;
import com.gymapp.service.integration.FileStorageService;
import com.gymapp.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/owner/gyms/{gymId}/members")
@RequiredArgsConstructor
public class OwnerMemberController {

    private final MemberService memberService;
    private final AuthService authService;
    private final FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MemberResponse>>> list(@AuthenticationPrincipal UserPrincipal principal,
                                                                    @PathVariable String gymId,
                                                                    @RequestParam(required = false) String q) {
        List<MemberResponse> members = (q == null || q.isBlank())
                ? memberService.listGymMembers(principal.getId(), gymId)
                : memberService.searchGymMembers(principal.getId(), gymId, q);
        return ResponseEntity.ok(ApiResponse.success("OK", members));
    }

    @GetMapping("/{memberId}")
    public ResponseEntity<ApiResponse<MemberResponse>> get(@AuthenticationPrincipal UserPrincipal principal,
                                                             @PathVariable String gymId,
                                                             @PathVariable String memberId) {
        return ResponseEntity.ok(ApiResponse.success("OK", memberService.getMemberDetail(principal.getId(), gymId, memberId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> add(@AuthenticationPrincipal UserPrincipal principal,
                                                   @PathVariable String gymId,
                                                   @Valid @RequestBody OwnerAddMemberRequest req) {
        var result = authService.ownerAddMember(principal.getId(), gymId, req);
        return ResponseEntity.ok(ApiResponse.success(result.message()));
    }

    @PutMapping("/{memberId}")
    public ResponseEntity<ApiResponse<MemberResponse>> update(@AuthenticationPrincipal UserPrincipal principal,
                                                                @PathVariable String gymId,
                                                                @PathVariable String memberId,
                                                                @RequestBody MemberUpdateRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Member updated",
                memberService.updateMember(principal.getId(), gymId, memberId, req)));
    }

    @DeleteMapping("/{memberId}")
    public ResponseEntity<ApiResponse<Void>> delete(@AuthenticationPrincipal UserPrincipal principal,
                                                      @PathVariable String gymId,
                                                      @PathVariable String memberId) {
        memberService.deleteMember(principal.getId(), gymId, memberId);
        return ResponseEntity.ok(ApiResponse.success("Member removed"));
    }

    @PostMapping("/{memberId}/photo")
    public ResponseEntity<ApiResponse<MemberResponse>> uploadPhoto(@AuthenticationPrincipal UserPrincipal principal,
                                                                     @PathVariable String gymId,
                                                                     @PathVariable String memberId,
                                                                     @RequestParam MultipartFile file) {
        String url = fileStorageService.uploadImage(file, "members/" + memberId);
        MemberUpdateRequest req = new MemberUpdateRequest();
        req.setPhotoUrl(url);
        return ResponseEntity.ok(ApiResponse.success("Photo uploaded",
                memberService.updateMember(principal.getId(), gymId, memberId, req)));
    }
}
