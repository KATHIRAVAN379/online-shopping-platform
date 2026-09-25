import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  OrderService,
  Order
} from '../../core/services/order.service';

import {
  PaymentService,
  RazorpayOrderResponse,
  PaymentVerificationRequest,
  Payment
} from '../../core/services/payment.service';

declare var Razorpay: any;

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {

  orders: Order[] = [];

  loading = true;

  error = '';

  cancellingOrderId: number | null = null;

  payingOrderId: number | null = null;

  refundingOrderId: number | null = null;


  constructor(
    private orderService: OrderService,
    private paymentService: PaymentService
  ) {}


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.loadOrders();
  }


  // =========================================================
  // LOAD ORDERS
  // =========================================================

  loadOrders(): void {

    this.loading = true;

    this.error = '';

    this.orderService
      .getOrders()
      .subscribe({

        next: (data: Order[]) => {

          this.orders = data;

          this.loading = false;
        },

        error: (err) => {

          console.error(
            'ORDERS API ERROR:',
            err
          );

          this.error =
            'Unable to load your orders. Please login again.';

          this.loading = false;
        }
      });
  }


  // =========================================================
  // CHECK PAY
  // =========================================================

  canPay(order: Order): boolean {

    return (
      order.status === 'PLACED' &&
      order.paymentStatus === 'PENDING'
    );
  }


  // =========================================================
  // PAY ORDER
  // =========================================================

  payOrder(order: Order): void {

    if (!this.canPay(order)) {
      return;
    }

    if (
      this.payingOrderId !== null ||
      this.refundingOrderId !== null ||
      this.cancellingOrderId !== null
    ) {
      return;
    }


    this.payingOrderId = order.id;

    this.error = '';


    this.paymentService
      .createRazorpayOrder(order.id)
      .subscribe({

        next: (
          razorpayOrder: RazorpayOrderResponse
        ) => {

          console.log(
            'RAZORPAY ORDER CREATED:',
            razorpayOrder
          );

          this.openRazorpayCheckout(
            order,
            razorpayOrder
          );
        },

        error: (err) => {

          console.error(
            'CREATE RAZORPAY ORDER ERROR:',
            err
          );

          this.payingOrderId = null;

          this.error =
            'Unable to start payment. Please try again.';
        }
      });
  }


  // =========================================================
  // OPEN RAZORPAY
  // =========================================================

  private openRazorpayCheckout(
    order: Order,
    razorpayOrder: RazorpayOrderResponse
  ): void {

    if (typeof Razorpay === 'undefined') {

      console.error(
        'Razorpay SDK not loaded.'
      );

      this.payingOrderId = null;

      this.error =
        'Payment system is not loaded. Please refresh the page.';

      return;
    }


    const options = {

      key: razorpayOrder.keyId,

      amount: razorpayOrder.amount,

      currency: razorpayOrder.currency,

      name: 'KCart',

      description:
        `Payment for Order #${order.id}`,

      order_id:
        razorpayOrder.razorpayOrderId,

      handler: (response: any) => {

        console.log(
          'RAZORPAY PAYMENT SUCCESS:',
          response
        );

        this.verifyPayment(response);
      },

      theme: {
        color: '#ff9900'
      },

      modal: {

        ondismiss: () => {

          console.log(
            'Razorpay checkout closed'
          );

          this.payingOrderId = null;
        }
      }
    };


    const razorpay =
      new Razorpay(options);


    razorpay.on(
      'payment.failed',
      (response: any) => {

        console.error(
          'RAZORPAY PAYMENT FAILED:',
          response
        );

        this.payingOrderId = null;

        this.error =
          'Payment failed. Please try again.';
      }
    );


    razorpay.open();
  }


  // =========================================================
  // VERIFY PAYMENT
  // =========================================================

  private verifyPayment(
    response: any
  ): void {

    const request:
      PaymentVerificationRequest = {

      razorpayOrderId:
        response.razorpay_order_id,

      razorpayPaymentId:
        response.razorpay_payment_id,

      razorpaySignature:
        response.razorpay_signature
    };


    console.log(
      'VERIFY PAYMENT REQUEST:',
      request
    );


    this.paymentService
      .verifyPayment(request)
      .subscribe({

        next: (payment: Payment) => {

          console.log(
            'PAYMENT VERIFIED:',
            payment
          );

          this.payingOrderId = null;

          alert(
            'Payment successful! Your order is confirmed.'
          );

          this.loadOrders();
        },

        error: (err) => {

          console.error(
            'PAYMENT VERIFICATION ERROR:',
            err
          );

          this.payingOrderId = null;

          this.error =
            'Payment was completed, but verification failed. Please contact support.';
        }
      });
  }


  // =========================================================
  // CHECK CANCEL
  // =========================================================

  canCancel(order: Order): boolean {

    return (
      order.status !== 'CANCELLED' &&
      order.status !== 'DELIVERED'
    );
  }


  // =========================================================
  // CANCEL ORDER
  // =========================================================

  cancelOrder(order: Order): void {

    if (!this.canCancel(order)) {
      return;
    }


    if (
      this.payingOrderId !== null ||
      this.refundingOrderId !== null ||
      this.cancellingOrderId !== null
    ) {
      return;
    }


    const confirmed =
      confirm(
        `Are you sure you want to cancel Order #${order.id}?`
      );


    if (!confirmed) {
      return;
    }


    this.cancellingOrderId =
      order.id;


    this.orderService
      .cancelOrder(order.id)
      .subscribe({

        next: (updatedOrder: Order) => {

          console.log(
            'ORDER CANCELLED:',
            updatedOrder
          );


          const index =
            this.orders.findIndex(
              item => item.id === order.id
            );


          if (index !== -1) {

            this.orders[index] =
              updatedOrder;
          }


          this.cancellingOrderId =
            null;


          if (
            updatedOrder.paymentStatus ===
            'REFUND_PENDING'
          ) {

            alert(
              `Order #${updatedOrder.id} cancelled.\n\nRefund is pending.`
            );

          } else {

            alert(
              `Order #${updatedOrder.id} cancelled successfully.`
            );
          }
        },

        error: (err) => {

          console.error(
            'CANCEL ORDER ERROR:',
            err
          );

          this.cancellingOrderId = null;

          alert(
            'Unable to cancel this order. Please try again.'
          );
        }
      });
  }


  // =========================================================
  // CHECK REFUND
  // =========================================================

  canRefund(order: Order): boolean {

    return (
      order.status === 'CANCELLED' &&
      order.paymentStatus === 'REFUND_PENDING'
    );
  }


  // =========================================================
  // REFUND ORDER
  // =========================================================

  refundOrder(order: Order): void {

    if (!this.canRefund(order)) {
      return;
    }


    if (
      this.payingOrderId !== null ||
      this.refundingOrderId !== null ||
      this.cancellingOrderId !== null
    ) {
      return;
    }


    const confirmed =
      confirm(
        `Process refund for Order #${order.id}?\n\n` +
        `Refund Amount: ₹${order.totalAmount}`
      );


    if (!confirmed) {
      return;
    }


    this.refundingOrderId =
      order.id;


    this.error = '';


    this.paymentService
      .refundPayment(order.id)
      .subscribe({

        next: (payment: Payment) => {

          console.log(
            'REFUND SUCCESS:',
            payment
          );


          this.refundingOrderId =
            null;


          // Show amount in success message
          alert(
            `Refunded successfully!\n\n` +
            `Order #${order.id}\n` +
            `Refund Amount: ₹${order.totalAmount}`
          );


          // Reload orders.
          // Backend has already changed
          // paymentStatus to REFUNDED.
          this.loadOrders();
        },


        error: (err) => {

          console.error(
            'REFUND ERROR:',
            err
          );


          this.refundingOrderId =
            null;


          alert(
            'Unable to process refund. Please try again.'
          );
        }
      });
  }


  // =========================================================
  // CHECK REFUNDED
  // =========================================================

  isRefunded(order: Order): boolean {

    return (
      order.status === 'CANCELLED' &&
      order.paymentStatus === 'REFUNDED'
    );
  }
}