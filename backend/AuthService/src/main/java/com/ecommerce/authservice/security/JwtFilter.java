package com.ecommerce.authservice.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

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

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    protected boolean shouldNotFilter(
            HttpServletRequest request) {

        String path =
                request.getServletPath();

        String method =
                request.getMethod();

        // Don't process JWT for CORS preflight
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }

        // Public authentication APIs
        return path.equals("/auth/register")
                || path.equals("/auth/login")
                || path.equals("/auth/admin/create");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String token =
                getToken(request);

        if (token != null) {

            try {

                String email =
                        jwtUtil.extractEmail(token);

                if (email != null
                        && SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                                == null) {

                    UserDetails userDetails =
                            userDetailsService
                                .loadUserByUsername(
                                    email
                                );

                    if (jwtUtil.validateToken(
                            token,
                            userDetails.getUsername())) {

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                                );

                        authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                        );

                        SecurityContextHolder
                            .getContext()
                            .setAuthentication(
                                authentication
                            );
                    }
                }

            } catch (Exception e) {

                System.out.println(
                    "JWT Error: "
                    + e.getMessage()
                );
            }
        }

        filterChain.doFilter(
            request,
            response
        );
    }

    private String getToken(
            HttpServletRequest request) {

        String bearerToken =
                request.getHeader("Authorization");

        if (StringUtils.hasText(bearerToken)
                && bearerToken.startsWith("Bearer ")) {

            return bearerToken.substring(7);
        }

        return null;
    }
}