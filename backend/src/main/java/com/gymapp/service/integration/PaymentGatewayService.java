package com.gymapp.service.integration;

/**
 * Abstraction over an online payment gateway (e.g. Razorpay/Stripe) for members paying
 * membership fees online. MOCK implementation simulates an always-successful order.
 */
public interface PaymentGatewayService {
    PaymentOrder createOrder(double amount, String receiptId);

    record PaymentOrder(String orderId, double amount, String currency, String providerKey) {}
}
