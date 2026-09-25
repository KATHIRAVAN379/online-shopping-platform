package com.ecommerce.orderservice.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.ecommerce.orderservice.entity.Order;
import com.ecommerce.orderservice.service.OrderService;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService service;


    // =========================================================
    // PLACE ORDER
    // =========================================================

    @PostMapping
    public Order placeOrder(
            @RequestBody Order order,
            Authentication authentication) {

        String email =
                authentication.getName();

        order.setUserEmail(email);

        return service.placeOrder(order);
    }


    // =========================================================
    // GET USER ORDERS
    // =========================================================

    @GetMapping
    public List<Order> getUserOrders(
            Authentication authentication) {

        String email =
                authentication.getName();

        return service.getUserOrders(email);
    }


    // =========================================================
    // GET ORDER BY ID
    // =========================================================

    @GetMapping("/{id}")
    public Order getOrderById(
            @PathVariable int id,
            Authentication authentication) {

        Order order =
                service.getOrderById(id);

        if (!order.getUserEmail()
                .equals(authentication.getName())) {

            throw new RuntimeException(
                    "You cannot access this order");
        }

        return order;
    }


    // =========================================================
    // CANCEL ORDER
    // =========================================================

    @PutMapping("/{id}/cancel")
    public Order cancelOrder(
            @PathVariable int id,
            Authentication authentication) {

        Order order =
                service.getOrderById(id);

        if (!order.getUserEmail()
                .equals(authentication.getName())) {

            throw new RuntimeException(
                    "You cannot cancel this order");
        }

        return service.cancelOrder(id);
    }


    // =========================================================
    // CONFIRM PAYMENT
    // =========================================================

    @PutMapping("/{id}/payment/confirm")
    public Order confirmPayment(
            @PathVariable int id,
            Authentication authentication) {

        Order order =
                service.getOrderById(id);

        if (!order.getUserEmail()
                .equals(authentication.getName())) {

            throw new RuntimeException(
                    "You cannot confirm payment for this order");
        }

        return service.confirmPayment(id);
    }


    // =========================================================
    // CONFIRM REFUND
    // =========================================================

    @PutMapping("/{id}/refund/confirm")
    public Order confirmRefund(
            @PathVariable int id,
            Authentication authentication) {

        Order order =
                service.getOrderById(id);

        if (!order.getUserEmail()
                .equals(authentication.getName())) {

            throw new RuntimeException(
                    "You cannot confirm refund for this order");
        }

        return service.markRefunded(id);
    }
}