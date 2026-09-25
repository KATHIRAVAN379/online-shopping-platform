package com.ecommerce.paymentservice.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.paymentservice.entity.Payment;

@Repository
public interface PaymentRepository
        extends JpaRepository<Payment, Integer> {

    Optional<Payment> findByOrderId(int orderId);

    List<Payment> findByUserEmail(String userEmail);

    Optional<Payment> findByRazorpayOrderId(
            String razorpayOrderId);
}