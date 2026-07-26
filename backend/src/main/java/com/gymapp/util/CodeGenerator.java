package com.gymapp.util;

import java.security.SecureRandom;
import java.util.UUID;

public class CodeGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();

    public static String generateOtp() {
        int otp = 100000 + RANDOM.nextInt(900000);
        return String.valueOf(otp);
    }

    public static String generateToken() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    public static String generateAttendanceCode() {
        return "MEM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
