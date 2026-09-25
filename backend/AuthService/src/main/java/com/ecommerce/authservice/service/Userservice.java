package com.ecommerce.authservice.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ecommerce.authservice.entity.Users;
import com.ecommerce.authservice.repository.Userrepository;
import com.ecommerce.authservice.security.JwtUtil;

@Service
public class Userservice {

    @Autowired
    private Userrepository repo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;


    // =========================
    // REGISTER USER
    // =========================

    public Users register(Users user) {

        if (repo.findByEmail(user.getEmail()).isPresent()) {

            throw new RuntimeException(
                    "Email Already Exist"
            );
        }

        if (repo.findByPhone(user.getPhone()).isPresent()) {

            throw new RuntimeException(
                    "Phone Already Exist"
            );
        }

        user.setCreatedAt(LocalDateTime.now());

        // Normal registration = USER
        user.setRole("USER");

        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()
                )
        );        
        return repo.save(user);
    }


    // =========================
    // CREATE ADMIN
    // =========================

    public Users createAdmin(Users user) {

        if (repo.findByEmail(user.getEmail()).isPresent()) {

            throw new RuntimeException(
                    "Email Already Exist"
            );
        }

        if (repo.findByPhone(user.getPhone()).isPresent()) {

            throw new RuntimeException(
                    "Phone Already Exist"
            );
        }

        user.setCreatedAt(LocalDateTime.now());

        user.setRole("ADMIN");

        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()
                )
        );

        return repo.save(user);
    }


    // =========================
    // LOGIN
    // =========================

    public String login(
            String email,
            String password) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        email,
                        password
                )
        );

        Users user = repo.findByEmail(email)
                .orElseThrow(
                        () -> new RuntimeException(
                                "User not found"
                        )
                );

        System.out.println(
                "Login Email: " + user.getEmail()
        );

        System.out.println(
                "Login Role: " + user.getRole()
        );

        return jwtUtil.generateToken(
                user.getEmail(),
                user.getRole()
        );
    }


    // =========================
    // GET PROFILE
    // =========================

    public Users getProfile(String email) {

        return repo.findByEmail(email)
                .orElseThrow(
                        () -> new RuntimeException(
                                "User not found"
                        )
                );
    }


    // =========================
    // UPDATE PROFILE
    // =========================

    public Users updateProfile(
            String email,
            Users user) {

        Users existingUser =
                repo.findByEmail(email)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "User not found"
                                )
                        );

        existingUser.setUsername(
                user.getUsername()
        );

        existingUser.setPhone(
                user.getPhone()
        );
        existingUser.setAddress(user.getAddress());

        return repo.save(existingUser);
    }


    // =========================
    // CHANGE PASSWORD
    // =========================

    public Users changePassword(
            String email,
            String oldPassword,
            String newPassword) {

        Users user =
                repo.findByEmail(email)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "User not found"
                                )
                        );

        if (!passwordEncoder.matches(
                oldPassword,
                user.getPassword())) {

            throw new RuntimeException(
                    "Old password is incorrect"
            );
        }

        user.setPassword(
                passwordEncoder.encode(
                        newPassword
                )
        );

        return repo.save(user);
    }
}