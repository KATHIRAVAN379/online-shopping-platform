package com.ecommerce.authservice;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordGenerator {

    public static void main(String[] args) {

        BCryptPasswordEncoder encoder =
                new BCryptPasswordEncoder();

        String hash =
                encoder.encode("Password");

        System.out.println(hash);
    }
}
