package com.ecommerce.cartservice.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.ecommerce.cartservice.entity.Cart;
import com.ecommerce.cartservice.service.Cartservice;

@RestController
@RequestMapping("/cart")
public class CartController {

    @Autowired
    private Cartservice service;

    // Add product to cart
    @PostMapping
    public Cart addToCart(
            @RequestBody Cart cart,
            Authentication authentication) {

        String email = authentication.getName();

        cart.setUserEmail(email);

        return service.addToCart(cart);
    }

    // Get logged-in user's cart
    @GetMapping
    public List<Cart> getUserCart(
            Authentication authentication) {

        String email = authentication.getName();

        return service.getUserCart(email);
    }

    // Update quantity
    @PutMapping("/{productId}")
    public Cart updateQuantity(
            @PathVariable int productId,
            @RequestParam int quantity,
            Authentication authentication) {

        String email = authentication.getName();

        return service.updateQuantity(
                email,
                productId,
                quantity);
    }

    // Remove product
    @DeleteMapping("/{productId}")
    public String removeFromCart(
            @PathVariable int productId,
            Authentication authentication) {

        String email = authentication.getName();

        return service.removeFromCart(
                email,
                productId);
    }

    // Clear cart
    @DeleteMapping
    public String clearCart(
            Authentication authentication) {

        String email = authentication.getName();

        return service.clearCart(email);
    }
}