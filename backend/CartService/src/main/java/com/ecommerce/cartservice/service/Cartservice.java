package com.ecommerce.cartservice.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ecommerce.cartservice.entity.Cart;
import com.ecommerce.cartservice.repository.CartRepository;

@Service
public class Cartservice {

    @Autowired
    private CartRepository repo;

    // Add product to cart
    public Cart addToCart(Cart cart) {

        Cart existingCart =
                repo.findByUserEmailAndProductId(
                        cart.getUserEmail(),
                        cart.getProductId());

        if (existingCart != null) {

            existingCart.setQuantity(
                    existingCart.getQuantity() + cart.getQuantity());

            return repo.save(existingCart);
        }

        return repo.save(cart);
    }

    // Get user's cart
    public List<Cart> getUserCart(String userEmail) {

        return repo.findByUserEmail(userEmail);
    }

    // Update product quantity
    public Cart updateQuantity(
            String userEmail,
            int productId,
            int quantity) {

        Cart cart =
                repo.findByUserEmailAndProductId(
                        userEmail,
                        productId);

        if (cart == null) {
            throw new RuntimeException(
                    "Product not found in cart");
        }

        cart.setQuantity(quantity);

        return repo.save(cart);
    }

    // Remove product from cart
    public String removeFromCart(
            String userEmail,
            int productId) {

        Cart cart =
                repo.findByUserEmailAndProductId(
                        userEmail,
                        productId);

        if (cart == null) {
            throw new RuntimeException(
                    "Product not found in cart");
        }

        repo.delete(cart);

        return "Product removed from cart";
    }

    // Clear entire cart
    public String clearCart(String userEmail) {

        List<Cart> carts =
                repo.findByUserEmail(userEmail);

        repo.deleteAll(carts);

        return "Cart cleared successfully";
    }
}