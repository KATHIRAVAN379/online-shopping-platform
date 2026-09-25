import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

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
  selector: 'app-order-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css'
})
export class OrderDetailsComponent implements OnInit {

  order: Order | null = null;

  loading = true;
  error = '';

  orderId = 0;

  paying = false;
  cancelling = false;
  refunding = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      const id = params.get('id');

      if (!id) {
        this.error = 'Invalid order ID.';
        this.loading = false;
        return;
      }

      this.orderId = Number(id);

      this.loadOrder();
    });
  }

  loadOrder(): void {

    this.loading = true;
    this.error = '';

    this.orderService.getOrderById(this.orderId).subscribe({

      next: (data: Order) => {

        console.log('ORDER DETAILS:', data);

        this.order = data;
        this.loading = false;
      },

      error: (err) => {

        console.error('ORDER DETAILS ERROR:', err);

        this.error =
          'Unable to load order details. Please try again.';

        this.loading = false;
      }
    });
  }

  canPay(): boolean {

    if (!this.order) {
      return false;
    }

    return (
      this.order.status === 'PLACED' &&
      this.order.paymentStatus === 'PENDING'
    );
  }

  canCancel(): boolean {

    if (!this.order) {
      return false;
    }

    return (
      this.order.status !== 'CANCELLED' &&
      this.order.status !== 'DELIVERED'
    );
  }

  canRefund(): boolean {

    if (!this.order) {
      return false;
    }

    return (
      this.order.status === 'CANCELLED' &&
      this.order.paymentStatus === 'REFUND_PENDING'
    );
  }

  isRefunded(): boolean {

    if (!this.order) {
      return false;
    }

    return (
      this.order.status === 'CANCELLED' &&
      this.order.paymentStatus === 'REFUNDED'
    );
  }

  payOrder(): void {

    if (!this.order || !this.canPay()) {
      return;
    }

    if (this.paying || this.cancelling || this.refunding) {
      return;
    }

    this.paying = true;
    this.error = '';

    this.paymentService
      .createRazorpayOrder(this.order.id)
      .subscribe({

        next: (razorpayOrder: RazorpayOrderResponse) => {

          console.log(
            'RAZORPAY ORDER CREATED:',
            razorpayOrder
          );

          this.openRazorpayCheckout(
            this.order!,
            razorpayOrder
          );
        },

        error: (err) => {

          console.error(
            'CREATE RAZORPAY ORDER ERROR:',
            err
          );

          this.paying = false;

          this.error =
            'Unable to start payment. Please try again.';
        }
      });
  }

  private openRazorpayCheckout(
    order: Order,
    razorpayOrder: RazorpayOrderResponse
  ): void {

    if (typeof Razorpay === 'undefined') {

      console.error('Razorpay SDK not loaded.');

      this.paying = false;

      this.error =
        'Payment system is not loaded. Please refresh the page.';

      return;
    }

    const options = {

      key: razorpayOrder.keyId,

      amount: razorpayOrder.amount,

      currency: razorpayOrder.currency,

      name: 'KCart',

      description: `Payment for Order #${order.id}`,

      order_id: razorpayOrder.razorpayOrderId,

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

          this.paying = false;
        }
      }
    };

    const razorpay = new Razorpay(options);

    razorpay.on(
      'payment.failed',
      (response: any) => {

        console.error(
          'RAZORPAY PAYMENT FAILED:',
          response
        );

        this.paying = false;

        this.error =
          'Payment failed. Please try again.';
      }
    );

    razorpay.open();
  }

  private verifyPayment(response: any): void {

    const request: PaymentVerificationRequest = {

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

          this.paying = false;

          alert(
            'Payment successful! Your order is confirmed.'
          );

          this.loadOrder();
        },

        error: (err) => {

          console.error(
            'PAYMENT VERIFICATION ERROR:',
            err
          );

          this.paying = false;

          this.error =
            'Payment was completed, but verification failed. Please contact support.';
        }
      });
  }

  cancelOrder(): void {

    if (!this.order || !this.canCancel()) {
      return;
    }

    if (
      this.paying ||
      this.cancelling ||
      this.refunding
    ) {
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to cancel Order #${this.order.id}?`
    );

    if (!confirmed) {
      return;
    }

    this.cancelling = true;
    this.error = '';

    this.orderService
      .cancelOrder(this.order.id)
      .subscribe({

        next: (updatedOrder: Order) => {

          console.log(
            'ORDER CANCELLED:',
            updatedOrder
          );

          this.order = updatedOrder;

          this.cancelling = false;

          if (
            updatedOrder.paymentStatus ===
            'REFUND_PENDING'
          ) {

            alert(
              `Order #${updatedOrder.id} cancelled. Refund is pending.`
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

          this.cancelling = false;

          this.error =
            'Unable to cancel this order. Please try again.';
        }
      });
  }

  refundOrder(): void {

    if (!this.order || !this.canRefund()) {
      return;
    }

    if (
      this.paying ||
      this.cancelling ||
      this.refunding
    ) {
      return;
    }

    const confirmed = confirm(
      `Process refund for Order #${this.order.id}?\n\nAmount: ₹${this.order.totalAmount}`
    );

    if (!confirmed) {
      return;
    }

    this.refunding = true;
    this.error = '';

    this.paymentService
      .refundPayment(this.order.id)
      .subscribe({

        next: (payment: Payment) => {

          console.log(
            'REFUND SUCCESS:',
            payment
          );

          this.refunding = false;

          alert(
            `Refunded successfully!\n\nOrder #${this.order?.id}\nRefund Amount: ₹${this.order?.totalAmount}`
          );

          this.loadOrder();
        },

        error: (err) => {

          console.error(
            'REFUND ERROR:',
            err
          );

          this.refunding = false;

          this.error =
            'Unable to process refund. Please try again.';
        }
      });
  }

  goBack(): void {

    this.router.navigate(['/orders']);
  }
}