package com.ecommerce.productservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ecommerce.productservice.entity.Product;

@Repository
public interface Productrepository
        extends JpaRepository<Product, Integer> {

    List<Product> findByCategory(String category);

    List<Product> findByBrand(String brand);

    List<Product> findByPriceLessThanEqual(double price);
}