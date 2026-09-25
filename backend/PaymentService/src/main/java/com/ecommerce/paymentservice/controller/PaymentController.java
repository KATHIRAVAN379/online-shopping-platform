package com.ecommerce.paymentservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.ecommerce.paymentservice.entity.Payment;
import com.ecommerce.paymentservice.service.PaymentService;
import com.ecommerce.paymentservice.service.PaymentVerificationRequest;
import com.ecommerce.paymentservice.service.RazorpayOrderResponse;

import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    @Autowired
    private PaymentService service;


    // =========================================================
    // CREATE RAZORPAY ORDER
    // =========================================================

    @PostMapping("/create-order/{orderId}")
    public RazorpayOrderResponse createRazorpayOrder(
            @PathVariable int orderId,
            Authentication authentication,
            @RequestHeader("Authorization") String authorization)
            throws Exception {

        String email =
                authentication.getName();

        String token =
                extractToken(authorization);

        return service.createRazorpayOrder(
                orderId,
                email,
                token);
    }


    // =========================================================
    // VERIFY PAYMENT
    // =========================================================

    @PostMapping("/verify")
    public Payment verifyPayment(
            @RequestBody PaymentVerificationRequest request,
            Authentication authentication,
            @RequestHeader("Authorization") String authorization)
            throws Exception {

        String email =
                authentication.getName();

        String token =
                extractToken(authorization);

        return service.verifyPayment(
                request,
                email,
                token);
    }


    // =========================================================
    // REFUND PAYMENT
    // =========================================================

    @PostMapping("/refund/{orderId}")
    public Payment refundPayment(
            @PathVariable int orderId,
            Authentication authentication,
            @RequestHeader("Authorization") String authorization)
            throws Exception {

        String email =
                authentication.getName();

        String token =
                extractToken(authorization);

        return service.refundPayment(
                orderId,
                email,
                token);
    }


    // =========================================================
    // EXTRACT JWT
    // =========================================================

    private String extractToken(
            String authorization) {

        if (authorization == null
                || !authorization.startsWith("Bearer ")) {

            throw new RuntimeException(
                    "Invalid Authorization header");
        }

        return authorization.substring(7);
    }
}