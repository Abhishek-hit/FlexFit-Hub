package com.gymapp.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gymapp.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Without this, Spring Security's default entry point (Http403ForbiddenEntryPoint)
 * returns 403 for ANY unauthenticated request — including one with a missing or
 * expired JWT — which is indistinguishable from a real "authenticated but not
 * allowed" 403. That breaks the frontend's token-refresh logic, which only retries
 * on 401. This entry point restores correct REST semantics: 401 for "not
 * authenticated" (missing/invalid/expired token), 403 stays reserved for
 * "authenticated but lacking the required role".
 */
@Component
public class JsonAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                          AuthenticationException authException) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ApiResponse<Object> body = ApiResponse.error("Authentication required or your session has expired. Please sign in again.");
        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
