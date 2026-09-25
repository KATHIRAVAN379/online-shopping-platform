package com.ecommerce.orderservice.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.ecommerce.orderservice.entity.Order;
import com.ecommerce.orderservice.repository.OrderRepository;

@Service
public class OrderService {

    @Autowired
    private OrderRepository repo;

    private final RestClient notificationClient;


    public OrderService() {

        notificationClient = RestClient.builder()
                .baseUrl("http://localhost:8086")
                .build();
    }


    // =========================================================
    // PLACE ORDER
    // =========================================================

    public Order placeOrder(Order order) {

        order.setOrderDate(
                LocalDateTime.now());

        order.setStatus("PLACED");

        order.setPaymentStatus("PENDING");

        Order savedOrder =
                repo.save(order);


        // Send order placed email
        sendOrderPlacedEmail(
                savedOrder.getUserEmail(),
                savedOrder.getId(),
                savedOrder.getTotalAmount());


        return savedOrder;
    }


    // =========================================================
    // GET USER ORDERS
    // =========================================================

    public List<Order> getUserOrders(
            String email) {

        return repo.findByUserEmail(email);
    }


    // =========================================================
    // GET ORDER BY ID
    // =========================================================

    public Order getOrderById(int id) {

        return repo.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found"));
    }


    // =========================================================
    // CANCEL ORDER
    // =========================================================

    public Order cancelOrder(int id) {

        Order order =
                getOrderById(id);


        if ("CANCELLED".equals(
                order.getStatus())) {

            throw new RuntimeException(
                    "Order is already cancelled");
        }


        if ("PAID".equals(
                order.getPaymentStatus())) {

            // Paid order needs refund
            order.setStatus("CANCELLED");

            order.setPaymentStatus(
                    "REFUND_PENDING");

        } else if ("PENDING".equals(
                order.getPaymentStatus())) {

            order.setStatus("CANCELLED");

            order.setPaymentStatus(
                    "NOT_REQUIRED");

        } else {

            throw new RuntimeException(
                    "Order cannot be cancelled");
        }


        Order savedOrder =
                repo.save(order);


        // Send cancellation email
        sendOrderCancelledEmail(
                savedOrder.getUserEmail(),
                savedOrder.getId(),
                savedOrder.getTotalAmount());


        // If paid, also tell customer refund started
        if ("REFUND_PENDING".equals(
                savedOrder.getPaymentStatus())) {

            sendRefundInitiatedEmail(
                    savedOrder.getUserEmail(),
                    savedOrder.getId(),
                    savedOrder.getTotalAmount());
        }


        return savedOrder;
    }


    // =========================================================
    // CONFIRM PAYMENT
    // =========================================================

    public Order confirmPayment(int id) {

        Order order =
                getOrderById(id);


        if ("CANCELLED".equals(
                order.getStatus())) {

            throw new RuntimeException(
                    "Cannot make payment for cancelled order");
        }


        order.setPaymentStatus("PAID");

        order.setStatus("CONFIRMED");


        Order savedOrder =
                repo.save(order);


        // Send order confirmed email
        sendOrderConfirmedEmail(
                savedOrder.getUserEmail(),
                savedOrder.getId(),
                savedOrder.getTotalAmount());


        return savedOrder;
    }


    // =========================================================
    // MARK REFUNDED
    // =========================================================

    public Order markRefunded(int id) {

        Order order =
                getOrderById(id);


        order.setPaymentStatus(
                "REFUNDED");


        Order savedOrder =
                repo.save(order);


        // Send refund completed email
        sendRefundCompletedEmail(
                savedOrder.getUserEmail(),
                savedOrder.getId(),
                savedOrder.getTotalAmount());


        return savedOrder;
    }


    // =========================================================
    // ORDER PLACED EMAIL
    // =========================================================

    private void sendOrderPlacedEmail(
            String email,
            int orderId,
            double amount) {

        try {

            notificationClient
                    .post()
                    .uri(uriBuilder ->
                            uriBuilder
                                    .path(
                                            "/notifications/order-placed")
                                    .queryParam(
                                            "email",
                                            email)
                                    .queryParam(
                                            "orderId",
                                            orderId)
                                    .queryParam(
                                            "amount",
                                            amount)
                                    .build())
                    .retrieve()
                    .toBodilessEntity();

        } catch (Exception e) {

            System.out.println(
                    "Order placed email failed: "
                    + e.getMessage());
        }
    }


    // =========================================================
    // ORDER CANCELLED EMAIL
    // =========================================================

    private void sendOrderCancelledEmail(
            String email,
            int orderId,
            double amount) {

        try {

            notificationClient
                    .post()
                    .uri(uriBuilder ->
                            uriBuilder
                                    .path(
                                            "/notifications/order-cancelled")
                                    .queryParam(
                                            "email",
                                            email)
                                    .queryParam(
                                            "orderId",
                                            orderId)
                                    .queryParam(
                                            "amount",
                                            amount)
                                    .build())
                    .retrieve()
                    .toBodilessEntity();

        } catch (Exception e) {

            System.out.println(
                    "Order cancellation email failed: "
                    + e.getMessage());
        }
    }


    // =========================================================
    // REFUND INITIATED EMAIL
    // =========================================================

    private void sendRefundInitiatedEmail(
            String email,
            int orderId,
            double amount) {

        try {

            notificationClient
                    .post()
                    .uri(uriBuilder ->
                            uriBuilder
                                    .path(
                                            "/notifications/refund-initiated")
                                    .queryParam(
                                            "email",
                                            email)
                                    .queryParam(
                                            "orderId",
                                            orderId)
                                    .queryParam(
                                            "amount",
                                            amount)
                                    .build())
                    .retrieve()
                    .toBodilessEntity();

        } catch (Exception e) {

            System.out.println(
                    "Refund initiated email failed: "
                    + e.getMessage());
        }
    }


    // =========================================================
    // REFUND COMPLETED EMAIL
    // =========================================================

    private void sendRefundCompletedEmail(
            String email,
            int orderId,
            double amount) {

        try {

            notificationClient
                    .post()
                    .uri(uriBuilder ->
                            uriBuilder
                                    .path(
                                            "/notifications/refund-completed")
                                    .queryParam(
                                            "email",
                                            email)
                                    .queryParam(
                                            "orderId",
                                            orderId)
                                    .queryParam(
                                            "amount",
                                            amount)
                                    .build())
                    .retrieve()
                    .toBodilessEntity();

        } catch (Exception e) {

            System.out.println(
                    "Refund completed email failed: "
                    + e.getMessage());
        }
    }


    // =========================================================
    // ORDER CONFIRMED EMAIL
    // =========================================================

    private void sendOrderConfirmedEmail(
            String email,
            int orderId,
            double amount) {

        try {

            notificationClient
                    .post()
                    .uri(uriBuilder ->
                            uriBuilder
                                    .path(
                                            "/notifications/order-confirmed")
                                    .queryParam(
                                            "email",
                                            email)
                                    .queryParam(
                                            "orderId",
                                            orderId)
                                    .queryParam(
                                            "amount",
                                            amount)
                                    .build())
                    .retrieve()
                    .toBodilessEntity();

        } catch (Exception e) {

            System.out.println(
                    "Order confirmed email failed: "
                    + e.getMessage());
        }
    }
}