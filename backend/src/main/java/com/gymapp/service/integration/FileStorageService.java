package com.gymapp.service.integration;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Wraps Cloudinary uploads for gym images, member photos, exercise images/videos.
 * Requires cloudinary.cloud-name / api-key / api-secret to be configured with real
 * credentials in application.yml (env vars) to work against the live Cloudinary API.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FileStorageService {

    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile file, String folder) {
        return upload(file, folder, "image");
    }

    public String uploadVideo(MultipartFile file, String folder) {
        return upload(file, folder, "video");
    }

    @SuppressWarnings("unchecked")
    private String upload(MultipartFile file, String folder, String resourceType) {
        try {
            Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap("folder", folder, "resource_type", resourceType));
            return (String) result.get("secure_url");
        } catch (IOException e) {
            log.error("File upload failed", e);
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }
}
