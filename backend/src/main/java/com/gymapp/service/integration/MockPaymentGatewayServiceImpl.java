package com.gymapp.service.integration;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@ConditionalOnProperty(name = "payment.gateway.provider", havingValue = "MOCK", matchIfMissing = true)
public class MockPaymentGatewayServiceImpl implements PaymentGatewayService {
    @Override
    public PaymentOrder createOrder(double amount, String receiptId) {
        return new PaymentOrder("mock_order_" + UUID.randomUUID(), amount, "INR", "mock_key");
    }
}
