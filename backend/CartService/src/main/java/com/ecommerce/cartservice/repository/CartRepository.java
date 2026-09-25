package com.ecommerce.cartservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.cartservice.entity.Cart;

@Repository
public interface CartRepository extends JpaRepository<Cart, Integer> {

    List<Cart> findByUserEmail(String userEmail);

    Cart findByUserEmailAndProductId(String userEmail, int productId);
}