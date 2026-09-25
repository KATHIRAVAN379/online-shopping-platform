package com.ecommerce.authservice.config;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.ecommerce.authservice.entity.Users;
import com.ecommerce.authservice.repository.Userrepository;

@Component
public class AdminDataInitializer implements CommandLineRunner {

    @Autowired
    private Userrepository repo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        String adminEmail = "admin@ecommerce.com";

        if (repo.findByEmail(adminEmail).isEmpty()) {

            Users admin = new Users();

            admin.setUsername("Admin");
            admin.setEmail(adminEmail);
            admin.setPhone("9876543211");

            admin.setPassword(
                    passwordEncoder.encode("Admin@123")
            );

            admin.setRole("ADMIN");

            admin.setCreatedAt(
                    LocalDateTime.now()
            );

            admin.setAddress("Chennai");

            repo.save(admin);

            System.out.println(
                    "======================================"
            );

            System.out.println(
                    "DEFAULT ADMIN CREATED"
            );

            System.out.println(
                    "Email: admin@ecommerce.com"
            );

            System.out.println(
                    "Password: Admin@123"
            );

            System.out.println(
                    "Role: ADMIN"
            );

            System.out.println(
                    "======================================"
            );

        } else {

            System.out.println(
                    "Admin account already exists."
            );
        }
    }
}