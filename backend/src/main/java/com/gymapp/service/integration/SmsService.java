package com.gymapp.service.integration;

/**
 * Abstraction over the SMS provider. In dev/test (sms.provider=MOCK) messages are only
 * logged. Plug in a real provider (Twilio, MSG91, etc.) by implementing this interface
 * and switching sms.provider.
 */
public interface SmsService {
    void sendSms(String toPhoneNumber, String message);
}
