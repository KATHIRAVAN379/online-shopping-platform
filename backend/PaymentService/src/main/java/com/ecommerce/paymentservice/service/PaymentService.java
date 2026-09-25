package com.ecommerce.paymentservice.service;

import java.time.LocalDateTime;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.ecommerce.paymentservice.entity.Payment;
import com.ecommerce.paymentservice.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private RazorpayClient razorpayClient;

    @Value("${razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret}")
    private String razorpayKeySecret;

    /*
     * Order Service
     * Port: 8084
     */
    private final RestClient orderClient;

    /*
     * Notification Service
     * Port: 8086
     */
    private final RestClient notificationClient;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public PaymentService() {

        orderClient = RestClient.builder()
                .baseUrl("http://localhost:8084")
                .build();

        notificationClient = RestClient.builder()
                .baseUrl("http://localhost:8086")
                .build();
    }


    // =========================================================
    // CREATE RAZORPAY ORDER
    // =========================================================

    public RazorpayOrderResponse createRazorpayOrder(
            int orderId,
            String userEmail,
            String token) throws Exception {

        OrderResponse order =
                getOrder(orderId, token);


        // Check ownership
        if (!order.getUserEmail().equals(userEmail)) {

            throw new RuntimeException(
                    "You cannot make payment for this order");
        }


        // Cancelled order cannot be paid
        if ("CANCELLED".equals(order.getStatus())) {

            throw new RuntimeException(
                    "Cannot make payment for cancelled order");
        }


        // Payment must be pending
        if (!"PENDING".equals(order.getPaymentStatus())) {

            throw new RuntimeException(
                    "Order payment is already processed");
        }


        // Check existing payment
        Payment existingPayment =
                paymentRepository
                        .findByOrderId(orderId)
                        .orElse(null);


        if (existingPayment != null
                && "PAID".equals(existingPayment.getStatus())) {

            throw new RuntimeException(
                    "Payment already completed for this order");
        }


        // Convert rupees to paise
        int amountInPaise =
                (int) Math.round(
                        order.getTotalAmount() * 100);


        // Razorpay request
        JSONObject request =
                new JSONObject();

        request.put(
                "amount",
                amountInPaise);

        request.put(
                "currency",
                "INR");

        request.put(
                "receipt",
                "order_" + orderId);


        // Create Razorpay order
        Order razorpayOrder =
                razorpayClient.orders.create(request);


        String razorpayOrderId =
                razorpayOrder.get("id");


        // Save payment
        Payment payment;

        if (existingPayment != null) {

            payment = existingPayment;

        } else {

            payment = new Payment();
        }


        payment.setOrderId(orderId);

        payment.setUserEmail(userEmail);

        payment.setAmount(
                order.getTotalAmount());

        payment.setStatus("CREATED");

        payment.setRazorpayOrderId(
                razorpayOrderId);

        payment.setRazorpayPaymentId(null);

        payment.setPaymentDate(
                LocalDateTime.now());


        paymentRepository.save(payment);


        System.out.println(
                "Razorpay order created: "
                + razorpayOrderId);


        return new RazorpayOrderResponse(
                razorpayOrderId,
                amountInPaise,
                "INR",
                razorpayKeyId);
    }


    // =========================================================
    // GET ORDER FROM ORDER SERVICE
    // =========================================================

    private OrderResponse getOrder(
            int orderId,
            String token) {

        return orderClient
                .get()
                .uri(
                        "/orders/"
                        + orderId)
                .header(
                        HttpHeaders.AUTHORIZATION,
                        "Bearer " + token)
                .retrieve()
                .body(OrderResponse.class);
    }


    // =========================================================
    // VERIFY RAZORPAY PAYMENT
    // =========================================================

    public Payment verifyPayment(
            PaymentVerificationRequest request,
            String userEmail,
            String token) throws Exception {


        // Validate Razorpay Order ID
        if (request.getRazorpayOrderId() == null
                || request.getRazorpayOrderId().isBlank()) {

            throw new RuntimeException(
                    "Razorpay order ID is required");
        }


        // Validate Razorpay Payment ID
        if (request.getRazorpayPaymentId() == null
                || request.getRazorpayPaymentId().isBlank()) {

            throw new RuntimeException(
                    "Razorpay payment ID is required");
        }


        // Validate signature
        if (request.getRazorpaySignature() == null
                || request.getRazorpaySignature().isBlank()) {

            throw new RuntimeException(
                    "Razorpay signature is required");
        }


        // Find payment
        Payment payment =
                paymentRepository
                        .findByRazorpayOrderId(
                                request.getRazorpayOrderId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment order not found"));


        // Check ownership
        if (!payment.getUserEmail()
                .equals(userEmail)) {

            throw new RuntimeException(
                    "You cannot verify this payment");
        }


        // Already paid
        if ("PAID".equals(payment.getStatus())) {

            return payment;
        }


        // Get original order
        OrderResponse order =
                getOrder(
                        payment.getOrderId(),
                        token);


        // Check ownership
        if (!order.getUserEmail()
                .equals(userEmail)) {

            throw new RuntimeException(
                    "Order ownership validation failed");
        }


        // Cancelled order
        if ("CANCELLED".equals(order.getStatus())) {

            throw new RuntimeException(
                    "Cannot complete payment for cancelled order");
        }


        // Check amount
        if (Double.compare(
                payment.getAmount(),
                order.getTotalAmount()) != 0) {

            throw new RuntimeException(
                    "Payment amount does not match order amount");
        }


        // =====================================================
        // VERIFY RAZORPAY SIGNATURE
        // =====================================================

        JSONObject attributes =
                new JSONObject();

        attributes.put(
                "razorpay_order_id",
                request.getRazorpayOrderId());

        attributes.put(
                "razorpay_payment_id",
                request.getRazorpayPaymentId());

        attributes.put(
                "razorpay_signature",
                request.getRazorpaySignature());


        boolean isValid =
                Utils.verifyPaymentSignature(
                        attributes,
                        razorpayKeySecret);


        // =====================================================
        // PAYMENT FAILED
        // =====================================================

        if (!isValid) {

            payment.setStatus("FAILED");

            payment.setPaymentDate(
                    LocalDateTime.now());

            paymentRepository.save(payment);


            sendPaymentFailedEmail(
                    payment.getUserEmail(),
                    payment.getOrderId(),
                    payment.getAmount());


            throw new RuntimeException(
                    "Invalid Razorpay payment signature");
        }


        // =====================================================
        // PAYMENT SUCCESS
        // =====================================================

        payment.setRazorpayPaymentId(
                request.getRazorpayPaymentId());

        payment.setStatus("PAID");

        payment.setPaymentDate(
                LocalDateTime.now());


        Payment savedPayment =
                paymentRepository.save(payment);


        System.out.println(
                "Payment successfully verified");


        // =====================================================
        // UPDATE ORDER
        // =====================================================

        confirmOrderPayment(
                payment.getOrderId(),
                token);


        // =====================================================
        // SEND PAYMENT SUCCESS EMAIL
        // =====================================================

        sendPaymentSuccessEmail(
                payment.getUserEmail(),
                payment.getOrderId(),
                payment.getAmount());


        return savedPayment;
    }


    // =========================================================
    // CONFIRM PAYMENT IN ORDER SERVICE
    // =========================================================

    private void confirmOrderPayment(
            int orderId,
            String token) {

        try {

            orderClient
                    .put()
                    .uri(
                            "/orders/"
                            + orderId
                            + "/payment/confirm")
                    .header(
                            HttpHeaders.AUTHORIZATION,
                            "Bearer " + token)
                    .retrieve()
                    .toBodilessEntity();


            System.out.println(
                    "Order payment confirmed: "
                    + orderId);

        } catch (Exception e) {

            System.out.println(
                    "Order payment confirmation failed: "
                    + e.getMessage());

            throw e;
        }
    }


    // =========================================================
    // REFUND PAYMENT
    // =========================================================

    public Payment refundPayment(
            int orderId,
            String userEmail,
            String token) throws Exception {


        // -----------------------------------------------------
        // Find payment
        // -----------------------------------------------------

        Payment payment =
                paymentRepository
                        .findByOrderId(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment not found for this order"));


        // -----------------------------------------------------
        // Check ownership
        // -----------------------------------------------------

        if (!payment.getUserEmail()
                .equals(userEmail)) {

            throw new RuntimeException(
                    "You cannot refund this payment");
        }


        // -----------------------------------------------------
        // Get order
        // -----------------------------------------------------

        OrderResponse order =
                getOrder(
                        orderId,
                        token);


        // -----------------------------------------------------
        // Check order ownership
        // -----------------------------------------------------

        if (!order.getUserEmail()
                .equals(userEmail)) {

            throw new RuntimeException(
                    "Order ownership validation failed");
        }


        // -----------------------------------------------------
        // Order must be cancelled
        // -----------------------------------------------------

        if (!"CANCELLED".equals(
                order.getStatus())) {

            throw new RuntimeException(
                    "Order must be cancelled before refund");
        }


        // =====================================================
        // ALREADY REFUNDED
        // =====================================================

        if ("REFUNDED".equals(
                payment.getStatus())) {

            System.out.println(
                    "Payment already refunded for order: "
                    + orderId);

            // Make sure OrderService is also updated
            markOrderRefunded(
                    orderId,
                    token);

            return payment;
        }


        // =====================================================
        // PAYMENT MUST BE PAID
        // =====================================================

        if (!"PAID".equals(
                payment.getStatus())) {

            throw new RuntimeException(
                    "Only paid orders can be refunded");
        }


        // =====================================================
        // RAZORPAY PAYMENT ID CHECK
        // =====================================================

        if (payment.getRazorpayPaymentId() == null
                || payment.getRazorpayPaymentId().isBlank()) {

            throw new RuntimeException(
                    "Razorpay payment ID not found");
        }


        // =====================================================
        // CREATE RAZORPAY REFUND
        // =====================================================

        com.razorpay.Refund refund =
                razorpayClient.payments.refund(
                        payment.getRazorpayPaymentId());


        System.out.println(
                "Razorpay refund created: "
                + refund.get("id"));

        System.out.println(
                "Refund status: "
                + refund.get("status"));


        // =====================================================
        // UPDATE PAYMENT STATUS
        // =====================================================

        payment.setStatus("REFUNDED");

        payment.setPaymentDate(
                LocalDateTime.now());


        Payment savedPayment =
                paymentRepository.save(payment);


        // =====================================================
        // UPDATE ORDER STATUS
        // =====================================================

        markOrderRefunded(
                orderId,
                token);


        System.out.println(
                "Payment refunded successfully for order: "
                + orderId);


        return savedPayment;
    }


    // =========================================================
    // MARK ORDER REFUNDED
    // =========================================================

    private void markOrderRefunded(
            int orderId,
            String token) {

        try {

            orderClient
                    .put()
                    .uri(
                            "/orders/"
                            + orderId
                            + "/refund/confirm")
                    .header(
                            HttpHeaders.AUTHORIZATION,
                            "Bearer " + token)
                    .retrieve()
                    .toBodilessEntity();


            System.out.println(
                    "Order marked as REFUNDED: "
                    + orderId);

        } catch (Exception e) {

            System.out.println(
                    "Order refund confirmation failed: "
                    + e.getMessage());

            throw e;
        }
    }


    // =========================================================
    // PAYMENT SUCCESS EMAIL
    // =========================================================

    private void sendPaymentSuccessEmail(
            String customerEmail,
            int orderId,
            double amount) {

        try {

            System.out.println(
                    "Sending payment success email to: "
                    + customerEmail);


            notificationClient
                    .post()
                    .uri(uriBuilder ->
                            uriBuilder
                                    .path(
                                            "/notifications/payment-success")
                                    .queryParam(
                                            "email",
                                            customerEmail)
                                    .queryParam(
                                            "orderId",
                                            orderId)
                                    .queryParam(
                                            "amount",
                                            amount)
                                    .build())
                    .retrieve()
                    .toBodilessEntity();


            System.out.println(
                    "Payment success email sent to: "
                    + customerEmail);

        } catch (Exception e) {

            System.out.println(
                    "Payment success notification failed: "
                    + e.getMessage());
        }
    }


    // =========================================================
    // PAYMENT FAILED EMAIL
    // =========================================================

    private void sendPaymentFailedEmail(
            String customerEmail,
            int orderId,
            double amount) {

        try {

            System.out.println(
                    "Sending payment failed email to: "
                    + customerEmail);


            notificationClient
                    .post()
                    .uri(uriBuilder ->
                            uriBuilder
                                    .path(
                                            "/notifications/payment-failed")
                                    .queryParam(
                                            "email",
                                            customerEmail)
                                    .queryParam(
                                            "orderId",
                                            orderId)
                                    .queryParam(
                                            "amount",
                                            amount)
                                    .build())
                    .retrieve()
                    .toBodilessEntity();


            System.out.println(
                    "Payment failed email sent to: "
                    + customerEmail);

        } catch (Exception e) {

            System.out.println(
                    "Payment failed notification failed: "
                    + e.getMessage());
        }
    }
}