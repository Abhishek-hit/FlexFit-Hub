package com.gymapp.service.integration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@ConditionalOnProperty(name = "sms.provider", havingValue = "MOCK", matchIfMissing = true)
public class MockSmsServiceImpl implements SmsService {
    @Override
    public void sendSms(String toPhoneNumber, String message) {
        log.info("[MOCK SMS] to={} message={}", toPhoneNumber, message);
    }
}
