package com.ecommerce.productservice.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.productservice.entity.Product;
import com.ecommerce.productservice.service.Productservice;


@RestController
@RequestMapping("/products")
public class Productcontroller {

    @Autowired
    private Productservice service;


    // Add Product
    @PostMapping
    public Product addProduct(@RequestBody Product product) {

        return service.addProduct(product);
    }


    // Get All Products
    @GetMapping
    public List<Product> getAllProducts() {

        return service.getAllProducts();
    }


    // Get Product By ID
    @GetMapping("/{id}")
    public Product getProductById(
            @PathVariable int id) {

        return service.getProductById(id);
    }


    // Update Product
    @PutMapping("/{id}")
    public Product updateProduct(
            @PathVariable int id,
            @RequestBody Product product) {

        return service.updateProduct(id, product);
    }


    // Delete Product
    @DeleteMapping("/{id}")
    public String deleteProduct(
            @PathVariable int id) {

        return service.deleteProduct(id);
    }


    // Find Products By Category
    @GetMapping("/category/{category}")
    public List<Product> getByCategory(
            @PathVariable String category) {

        return service.getByCategory(category);
    }


    // Find Products By Brand
    @GetMapping("/brand/{brand}")
    public List<Product> getByBrand(
            @PathVariable String brand) {

        return service.getByBrand(brand);
    }


    // Find Products By Maximum Price
    @GetMapping("/price/{price}")
    public List<Product> getByMaxPrice(
            @PathVariable double price) {

        return service.getByMaxPrice(price);
    }
}