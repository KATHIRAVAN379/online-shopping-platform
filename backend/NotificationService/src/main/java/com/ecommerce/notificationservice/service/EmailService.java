package com.ecommerce.notificationservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // 1. ORDER PLACED
    public void sendOrderPlacedEmail(String email, int orderId, double amount) {

        sendEmail(
            email,
            "Order Placed Successfully - Order #" + orderId,

            "Hello,\n\n"
            + "Your order has been placed successfully.\n\n"
            + "Order ID: " + orderId + "\n"
            + "Amount: ₹" + amount + "\n"
            + "Order Status: PLACED\n"
            + "Payment Status: PENDING\n\n"
            + "Please complete the payment to confirm your order.\n\n"
            + "Thank you for shopping with us!\n\n"
            + "Online Shopping Application"
        );
    }


    // 2. PAYMENT SUCCESS
    public void sendPaymentSuccessEmail(String email, int orderId, double amount) {

        sendEmail(
            email,
            "Payment Successful - Order #" + orderId,

            "Hello,\n\n"
            + "Your payment was successful.\n\n"
            + "Order ID: " + orderId + "\n"
            + "Amount: ₹" + amount + "\n"
            + "Payment Status: PAID\n"
            + "Order Status: CONFIRMED\n\n"
            + "Your order has been confirmed successfully.\n\n"
            + "Thank you for shopping with us!\n\n"
            + "Online Shopping Application"
        );
    }


    // 3. PAYMENT FAILED
    public void sendPaymentFailedEmail(String email, int orderId, double amount) {

        sendEmail(
            email,
            "Payment Failed - Order #" + orderId,

            "Hello,\n\n"
            + "Unfortunately, your payment could not be completed.\n\n"
            + "Order ID: " + orderId + "\n"
            + "Amount: ₹" + amount + "\n"
            + "Payment Status: FAILED\n\n"
            + "Please try the payment again.\n\n"
            + "Thank you,\n"
            + "Online Shopping Application"
        );
    }


    // 4. ORDER CANCELLED
    public void sendOrderCancelledEmail(String email, int orderId, double amount) {

        sendEmail(
            email,
            "Order Cancelled - Order #" + orderId,

            "Hello,\n\n"
            + "Your order has been cancelled.\n\n"
            + "Order ID: " + orderId + "\n"
            + "Amount: ₹" + amount + "\n"
            + "Order Status: CANCELLED\n\n"
            + "If you have already paid, your refund will be processed.\n\n"
            + "Thank you,\n"
            + "Online Shopping Application"
        );
    }


    // 5. REFUND INITIATED
    public void sendRefundInitiatedEmail(String email, int orderId, double amount) {

        sendEmail(
            email,
            "Refund Initiated - Order #" + orderId,

            "Hello,\n\n"
            + "Your refund has been initiated.\n\n"
            + "Order ID: " + orderId + "\n"
            + "Refund Amount: ₹" + amount + "\n"
            + "Refund Status: REFUND PENDING\n\n"
            + "The refund will be processed through the payment system.\n\n"
            + "Thank you,\n"
            + "Online Shopping Application"
        );
    }


    // 6. REFUND COMPLETED
    public void sendRefundCompletedEmail(String email, int orderId, double amount) {

        sendEmail(
            email,
            "Refund Completed - Order #" + orderId,

            "Hello,\n\n"
            + "Your refund has been completed successfully.\n\n"
            + "Order ID: " + orderId + "\n"
            + "Refund Amount: ₹" + amount + "\n"
            + "Refund Status: REFUNDED\n\n"
            + "The amount will be credited according to your payment provider's processing time.\n\n"
            + "Thank you,\n"
            + "Online Shopping Application"
        );
    }


    // 7. ORDER CONFIRMED
    public void sendOrderConfirmedEmail(String email, int orderId, double amount) {

        sendEmail(
            email,
            "Order Confirmed - Order #" + orderId,

            "Hello,\n\n"
            + "Your order has been confirmed successfully.\n\n"
            + "Order ID: " + orderId + "\n"
            + "Amount: ₹" + amount + "\n"
            + "Order Status: CONFIRMED\n\n"
            + "We will process your order shortly.\n\n"
            + "Thank you for shopping with us!\n\n"
            + "Online Shopping Application"
        );
    }


    // COMMON EMAIL METHOD
    private void sendEmail(String email, String subject, String body) {

        try {

            SimpleMailMessage message = new SimpleMailMessage();

            // Customer email
            message.setTo(email);

            // Subject
            message.setSubject(subject);

            // Email content
            message.setText(body);

            // Sender is automatically taken from
            // spring.mail.username in application.yml
            mailSender.send(message);

            System.out.println(
                "Email sent successfully to: " + email
            );

        } catch (Exception e) {

            System.out.println(
                "Email sending failed to " + email
                + ": " + e.getMessage()
            );

            throw e;
        }
    }
}