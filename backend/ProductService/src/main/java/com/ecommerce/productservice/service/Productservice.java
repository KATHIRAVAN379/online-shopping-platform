package com.ecommerce.productservice.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ecommerce.productservice.entity.Product;
import com.ecommerce.productservice.repository.Productrepository;

@Service
public class Productservice {

    @Autowired
    private Productrepository repo;


    // Add Product
    public Product addProduct(Product product) {
        return repo.save(product);
    }


    // Get All Products
    public List<Product> getAllProducts() {
        return repo.findAll();
    }


    // Get Product By ID
    public Product getProductById(int id) {

        return repo.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Product not found"));
    }


    // Update Product
    public Product updateProduct(int id, Product product) {

        Product existingProduct = repo.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Product not found"));

        existingProduct.setName(product.getName());
        existingProduct.setDescription(product.getDescription());
        existingProduct.setPrice(product.getPrice());
        existingProduct.setQuantity(product.getQuantity());
        existingProduct.setCategory(product.getCategory());
        existingProduct.setBrand(product.getBrand());
        existingProduct.setImageUrl(product.getImageUrl());

        return repo.save(existingProduct);
    }


    // Delete Product
    public String deleteProduct(int id) {

        Product product = repo.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Product not found"));

        repo.delete(product);

        return "Product deleted successfully";
    }


    // Find Products By Category
    public List<Product> getByCategory(String category) {

        return repo.findByCategory(category);
    }


    // Find Products By Brand
    public List<Product> getByBrand(String brand) {

        return repo.findByBrand(brand);
    }


    // Find Products By Maximum Price
    public List<Product> getByMaxPrice(double price) {

        return repo.findByPriceLessThanEqual(price);
    }
}