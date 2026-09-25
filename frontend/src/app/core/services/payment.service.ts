import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RazorpayOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface PaymentVerificationRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface Payment {
  id: number;
  orderId: number;
  userEmail: string;
  amount: number;
  status: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  paymentDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private readonly API_URL =
    'http://localhost:8080/payments';

  constructor(
    private http: HttpClient
  ) {}


  // =========================================================
  // CREATE RAZORPAY ORDER
  // =========================================================

  createRazorpayOrder(
    orderId: number
  ): Observable<RazorpayOrderResponse> {

    return this.http.post<RazorpayOrderResponse>(
      `${this.API_URL}/create-order/${orderId}`,
      {}
    );
  }


  // =========================================================
  // VERIFY PAYMENT
  // =========================================================

  verifyPayment(
    request: PaymentVerificationRequest
  ): Observable<Payment> {

    return this.http.post<Payment>(
      `${this.API_URL}/verify`,
      request
    );
  }


  // =========================================================
  // REFUND PAYMENT
  // =========================================================

  refundPayment(
    orderId: number
  ): Observable<Payment> {

    return this.http.post<Payment>(
      `${this.API_URL}/refund/${orderId}`,
      {}
    );
  }
}