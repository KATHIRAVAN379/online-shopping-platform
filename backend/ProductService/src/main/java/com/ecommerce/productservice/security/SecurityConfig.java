package com.ecommerce.productservice.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;


    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .cors(Customizer.withDefaults())

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            .authorizeHttpRequests(auth -> auth

                // Anyone can view products
                .requestMatchers(
                    HttpMethod.GET,
                    "/products",
                    "/products/**"
                )
                .permitAll()


                // Only ADMIN can add products
                .requestMatchers(
                    HttpMethod.POST,
                    "/products"
                )
                .hasAuthority("ADMIN")


                // Only ADMIN can update products
                .requestMatchers(
                    HttpMethod.PUT,
                    "/products/**"
                )
                .hasAuthority("ADMIN")


                // Only ADMIN can delete products
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/products/**"
                )
                .hasAuthority("ADMIN")


                // Everything else requires authentication
                .anyRequest()
                .authenticated()
            );


        http.addFilterBefore(
            jwtFilter,
            UsernamePasswordAuthenticationFilter.class
        );

        return http.build();
    }
}