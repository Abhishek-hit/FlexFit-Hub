package com.gymapp.service.integration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@ConditionalOnProperty(name = "whatsapp.provider", havingValue = "MOCK", matchIfMissing = true)
public class MockWhatsAppServiceImpl implements WhatsAppService {
    @Override
    public void sendMessage(String toPhoneNumber, String message) {
        log.info("[MOCK WHATSAPP] to={} message={}", toPhoneNumber, message);
    }
}
