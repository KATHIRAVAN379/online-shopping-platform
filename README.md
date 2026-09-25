# 🛒 Online Shopping Platform

A full-stack e-commerce platform built using **Angular** and **Spring Boot Microservices**.

The application provides product browsing, authentication, cart management, order processing, Razorpay payment integration, refunds, notifications, and an admin service.

---

## 🚀 Features

### 👤 User Management
- User registration
- User login
- JWT-based authentication
- User profile management
- Password change
- Role-based access

### 🛍️ Product Management
- View all products
- View product details
- Search products
- Filter products by category
- Filter products by brand
- Filter products by price
- Product stock management

### 🛒 Shopping Cart
- Add products to cart
- View cart
- Update product quantity
- Remove products from cart
- Clear cart
- Dynamic cart item count

### 📦 Order Management
- Place orders
- View orders
- View order details
- Cancel orders
- Order status tracking
- Payment status tracking

### 💳 Payment
- Razorpay payment integration
- Razorpay test-mode payments
- Payment verification
- Payment status management
- Refund processing

### 🔔 Notifications
- Order-related notifications
- Payment-related notifications
- Refund notifications

### 🔐 Security
- JWT authentication
- Spring Security
- Password encryption using BCrypt
- Environment-based configuration for sensitive credentials
- Service-level authentication

### ⚙️ Microservices
The backend is divided into independent Spring Boot services:

- Eureka Server
- API Gateway
- Auth Service
- Product Service
- Cart Service
- Order Service
- Payment Service
- Notification Service
- Admin Service

---

# 🏗️ System Architecture

```text
                         ┌─────────────────────┐
                         │   Angular Frontend  │
                         │      Port 4200      │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    API Gateway      │
                         │      Port 8080      │
                         └──────────┬──────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
      ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
      │ Auth Service│       │   Product   │       │ Cart Service│
      │    :8081    │       │   Service   │       │    :8083    │
      └─────────────┘       │    :8082    │       └─────────────┘
                            └─────────────┘
             │
             │
             ▼
      ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
      │Order Service│       │   Payment   │       │ Notification│
      │    :8084    │──────▶│   Service   │──────▶│   Service   │
      └─────────────┘       │    :8085    │       │    :8086    │
                            └─────────────┘       └─────────────┘

                         ┌─────────────────────┐
                         │    Admin Service    │
                         │       :8087         │
                         └─────────────────────┘

                         ┌─────────────────────┐
                         │   Eureka Server     │
                         │       :8761         │
                         └─────────────────────┘
