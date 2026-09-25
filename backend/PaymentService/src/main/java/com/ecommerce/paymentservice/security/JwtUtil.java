package com.ecommerce.paymentservice.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;


    private Claims extractClaims(String token) {

        return Jwts.parser()
                .verifyWith(
                        Keys.hmacShaKeyFor(
                                secret.getBytes(
                                        StandardCharsets.UTF_8)))
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }


    public String extractEmail(String token) {

        return extractClaims(token)
                .getSubject();
    }


    public String extractRole(String token) {

        return extractClaims(token)
                .get("role", String.class);
    }


    public boolean isTokenExpired(String token) {

        return extractClaims(token)
                .getExpiration()
                .before(new Date());
    }


    public boolean validateToken(String token) {

        try {

            extractClaims(token);

            return !isTokenExpired(token);

        } catch (Exception e) {

            return false;
        }
    }
}