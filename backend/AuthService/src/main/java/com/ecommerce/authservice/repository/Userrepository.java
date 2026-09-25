package com.ecommerce.authservice.repository;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.authservice.entity.Users;
@Repository
public interface Userrepository extends JpaRepository<Users,Integer>{
	Optional<Users> findByEmail(String email);
	Optional<Users> findByPhone(String phone);
	

}
