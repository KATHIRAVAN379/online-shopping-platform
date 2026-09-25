package com.ecommerce.authservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.ecommerce.authservice.entity.Users;
import com.ecommerce.authservice.service.Userservice;

@RequestMapping("/auth")
@RestController
public class Usercontroller {

    @Autowired
    private Userservice service;

    @PostMapping("/register")
    public Users register(@RequestBody Users user) {
        return this.service.register(user);
    }

    @PostMapping("/login")
    public String login(
            @RequestParam String email,
            @RequestParam String password) {

        return this.service.login(email, password);
    }


    @GetMapping("/profile")
    public Users getProfile(@RequestParam String email) {
        return this.service.getProfile(email);
    }

    @PutMapping("/updateprofile")
    public Users updateProfile(
            @RequestParam String email,
            @RequestBody Users user) {

        return this.service.updateProfile(email, user);
    }

    @PutMapping("/changePassword")
    public Users changePassword(
            @RequestParam String email,
            @RequestParam String oldPassword,
            @RequestParam String newPassword) {

        return this.service.changePassword(
                email,
                oldPassword,
                newPassword
        );
    }
}