package com.ecommerce.notificationservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.ecommerce.notificationservice.service.EmailService;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private EmailService emailService;


    // =========================================================
    // ORDER PLACED
    // =========================================================

    @PostMapping("/order-placed")
    public String orderPlaced(
            @RequestParam String email,
            @RequestParam int orderId,
            @RequestParam double amount) {

        emailService.sendOrderPlacedEmail(
                email,
                orderId,
                amount);

        return "Order placed email sent";
    }


    // =========================================================
    // PAYMENT SUCCESS
    // =========================================================

    @PostMapping("/payment-success")
    public String paymentSuccess(
            @RequestParam String email,
            @RequestParam int orderId,
            @RequestParam double amount) {

        emailService.sendPaymentSuccessEmail(
                email,
                orderId,
                amount);

        return "Payment success email sent";
    }


    // =========================================================
    // PAYMENT FAILED
    // =========================================================

    @PostMapping("/payment-failed")
    public String paymentFailed(
            @RequestParam String email,
            @RequestParam int orderId,
            @RequestParam double amount) {

        emailService.sendPaymentFailedEmail(
                email,
                orderId,
                amount);

        return "Payment failed email sent";
    }


    // =========================================================
    // ORDER CANCELLED
    // =========================================================

    @PostMapping("/order-cancelled")
    public String orderCancelled(
            @RequestParam String email,
            @RequestParam int orderId,
            @RequestParam double amount) {

        emailService.sendOrderCancelledEmail(
                email,
                orderId,
                amount);

        return "Order cancelled email sent";
    }


    // =========================================================
    // REFUND INITIATED
    // =========================================================

    @PostMapping("/refund-initiated")
    public String refundInitiated(
            @RequestParam String email,
            @RequestParam int orderId,
            @RequestParam double amount) {

        emailService.sendRefundInitiatedEmail(
                email,
                orderId,
                amount);

        return "Refund initiated email sent";
    }


    // =========================================================
    // REFUND COMPLETED
    // =========================================================

    @PostMapping("/refund-completed")
    public String refundCompleted(
            @RequestParam String email,
            @RequestParam int orderId,
            @RequestParam double amount) {

        emailService.sendRefundCompletedEmail(
                email,
                orderId,
                amount);

        return "Refund completed email sent";
    }


    // =========================================================
    // ORDER CONFIRMED
    // =========================================================

    @PostMapping("/order-confirmed")
    public String orderConfirmed(
            @RequestParam String email,
            @RequestParam int orderId,
            @RequestParam double amount) {

        emailService.sendOrderConfirmedEmail(
                email,
                orderId,
                amount);

        return "Order confirmed email sent";
    }
}