package com.ecommerce.adminservice.security;

import java.io.IOException;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String token = getToken(request);

        if (token != null
                && SecurityContextHolder
                    .getContext()
                    .getAuthentication() == null) {

            try {

                if (jwtUtil.validateToken(token)) {

                    String email =
                            jwtUtil.extractEmail(token);

                    String role =
                            jwtUtil.extractRole(token);

                    if (role != null) {

                        SimpleGrantedAuthority authority =
                                new SimpleGrantedAuthority(role);

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        email,
                                        null,
                                        Collections.singletonList(authority)
                                );

                        SecurityContextHolder
                                .getContext()
                                .setAuthentication(authentication);

                        System.out.println(
                                "JWT Email: " + email
                        );

                        System.out.println(
                                "JWT Role: " + role
                        );

                        System.out.println(
                                "Authority: " +
                                authentication.getAuthorities()
                        );
                    }
                }

            } catch (Exception e) {

                System.out.println(
                        "JWT Error: " + e.getMessage()
                );
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getToken(HttpServletRequest request) {

        String bearerToken =
                request.getHeader("Authorization");

        if (StringUtils.hasText(bearerToken)
                && bearerToken.startsWith("Bearer ")) {

            return bearerToken.substring(7);
        }

        return null;
    }
}