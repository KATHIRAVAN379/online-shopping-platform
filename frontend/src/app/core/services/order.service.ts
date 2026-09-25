import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateOrderRequest {
  totalAmount: number;
}

export interface Order {
  id: number;
  userEmail: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  orderDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private readonly API_URL =
    'http://localhost:8080/orders';

  constructor(
    private http: HttpClient
  ) {}


  // ==========================================
  // CREATE ORDER
  // ==========================================

  createOrder(
    totalAmount: number
  ): Observable<Order> {

    const request: CreateOrderRequest = {
      totalAmount: totalAmount
    };

    return this.http.post<Order>(
      this.API_URL,
      request
    );
  }


  // ==========================================
  // GET MY ORDERS
  // ==========================================

  getOrders(): Observable<Order[]> {

    return this.http.get<Order[]>(
      this.API_URL
    );
  }


  // ==========================================
  // GET ORDER BY ID
  // ==========================================

  getOrderById(
    orderId: number
  ): Observable<Order> {

    return this.http.get<Order>(
      `${this.API_URL}/${orderId}`
    );
  }


  // ==========================================
  // CANCEL ORDER
  // ==========================================

  cancelOrder(
    orderId: number
  ): Observable<Order> {

    return this.http.put<Order>(
      `${this.API_URL}/${orderId}/cancel`,
      {}
    );
  }

}