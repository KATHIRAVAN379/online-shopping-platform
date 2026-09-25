package com.ecommerce.authservice.security;

import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import com.ecommerce.authservice.entity.Users;
import com.ecommerce.authservice.repository.Userrepository;

@Service
public class CustomUserDetailsService
        implements UserDetailsService {

    @Autowired
    private Userrepository repo;

    @Override
    public UserDetails loadUserByUsername(
            String email)
            throws UsernameNotFoundException {

        Users user =
                repo.findByEmail(email)
                        .orElseThrow(
                                () -> new UsernameNotFoundException(
                                        "User Not Found"
                                )
                        );

        return new User(
                user.getEmail(),
                user.getPassword(),
                Collections.singleton(
                        new SimpleGrantedAuthority(
                                "ROLE_" + user.getRole()
                        )
                )
        );
    }
}