import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  Router,
  RouterLink
} from '@angular/router';

import { Cart } from '../../core/models/cart';
import { Product } from '../../core/models/product';
import { User } from '../../core/models/user';

import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';

import {
  OrderService,
  Order
} from '../../core/services/order.service';

import {
  PaymentService,
  RazorpayOrderResponse,
  PaymentVerificationRequest
} from '../../core/services/payment.service';

interface CheckoutItem {
  cart: Cart;
  product: Product | null;
}

declare var Razorpay: any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {

  user: User | null = null;

  checkoutItems: CheckoutItem[] = [];

  loading = true;

  error = '';

  paymentLoading = false;


  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private authService: AuthService,
    private orderService: OrderService,
    private paymentService: PaymentService,
    private router: Router
  ) {}


  ngOnInit(): void {
    this.checkLogin();
  }


  // ==========================================
  // CHECK LOGIN
  // ==========================================

  private checkLogin(): void {

    if (!this.authService.isLoggedIn()) {

      this.router.navigate(
        ['/login'],
        {
          queryParams: {
            returnUrl: '/checkout'
          }
        }
      );

      return;
    }

    this.loadUser();
  }


  // ==========================================
  // LOAD USER
  // ==========================================

  private loadUser(): void {

    const token =
      this.authService.getToken();

    if (!token) {

      this.router.navigate(['/login']);

      return;
    }

    try {

      const parts =
        token.split('.');

      if (parts.length !== 3) {

        throw new Error(
          'Invalid JWT token'
        );
      }

      const payload =
        JSON.parse(
          atob(parts[1])
        );

      const email =
        payload.sub;

      if (!email) {

        throw new Error(
          'Email not found in token'
        );
      }

      this.authService
        .getProfile(email)
        .subscribe({

          next: (user: User) => {

            this.user = user;

            this.loadCart();
          },

          error: (err) => {

            console.error(
              'PROFILE LOAD ERROR:',
              err
            );

            this.error =
              'Unable to load your profile.';

            this.loading = false;
          }

        });

    } catch (error) {

      console.error(
        'JWT ERROR:',
        error
      );

      this.router.navigate(['/login']);
    }
  }


  // ==========================================
  // LOAD CART
  // ==========================================

  private loadCart(): void {

    this.cartService
      .getCart()
      .subscribe({

        next: (cart: Cart[]) => {

          if (cart.length === 0) {

            this.checkoutItems = [];

            this.loading = false;

            return;
          }

          this.checkoutItems =
            cart.map(item => ({
              cart: item,
              product: null
            }));

          this.loadProducts();
        },

        error: (err) => {

          console.error(
            'CHECKOUT CART ERROR:',
            err
          );

          this.error =
            'Unable to load your cart.';

          this.loading = false;
        }

      });
  }


  // ==========================================
  // LOAD PRODUCTS
  // ==========================================

  private loadProducts(): void {

    let completed = 0;

    const total =
      this.checkoutItems.length;

    this.checkoutItems.forEach(
      (item, index) => {

        this.productService
          .getProductById(
            item.cart.productId
          )
          .subscribe({

            next: (product: Product) => {

              this.checkoutItems[index]
                .product = product;

              completed++;

              if (completed === total) {

                this.loading = false;
              }
            },

            error: (err) => {

              console.error(
                'CHECKOUT PRODUCT ERROR:',
                err
              );

              completed++;

              if (completed === total) {

                this.loading = false;
              }
            }

          });

      }
    );
  }


  // ==========================================
  // ITEM TOTAL
  // ==========================================

  getItemTotal(
    item: CheckoutItem
  ): number {

    if (!item.product) {
      return 0;
    }

    return (
      item.product.price *
      item.cart.quantity
    );
  }


  // ==========================================
  // SUBTOTAL
  // ==========================================

  getSubtotal(): number {

    return this.checkoutItems.reduce(
      (total, item) =>
        total +
        this.getItemTotal(item),
      0
    );
  }


  // ==========================================
  // DELIVERY
  // ==========================================

  getDeliveryCharge(): number {

    const subtotal =
      this.getSubtotal();

    if (subtotal === 0) {
      return 0;
    }

    if (subtotal >= 500) {
      return 0;
    }

    return 40;
  }


  // ==========================================
  // GRAND TOTAL
  // ==========================================

  getGrandTotal(): number {

    return (
      this.getSubtotal() +
      this.getDeliveryCharge()
    );
  }


  // ==========================================
  // TOTAL ITEMS
  // ==========================================

  getTotalItems(): number {

    return this.checkoutItems.reduce(
      (total, item) =>
        total + item.cart.quantity,
      0
    );
  }


  // ==========================================
  // CONTINUE SHOPPING
  // ==========================================

  continueShopping(): void {

    this.router.navigate(['/']);
  }


  // ==========================================
  // CONTINUE TO PAYMENT
  // ==========================================

  continueToPayment(): void {

    if (this.checkoutItems.length === 0) {

      alert(
        'Your cart is empty.'
      );

      return;
    }

    if (this.paymentLoading) {
      return;
    }

    const totalAmount =
      this.getGrandTotal();

    if (totalAmount <= 0) {

      alert(
        'Invalid order amount.'
      );

      return;
    }

    this.paymentLoading = true;

    this.error = '';


    // ========================================
    // STEP 1
    // CREATE ORDER
    // ========================================

    this.orderService
      .createOrder(totalAmount)
      .subscribe({

        next: (order: Order) => {

          console.log(
            'ORDER CREATED:',
            order
          );


          // ==================================
          // STEP 2
          // CREATE RAZORPAY ORDER
          // ==================================

          this.paymentService
            .createRazorpayOrder(order.id)
            .subscribe({

              next: (
                razorpayOrder:
                RazorpayOrderResponse
              ) => {

                console.log(
                  'RAZORPAY ORDER CREATED:',
                  razorpayOrder
                );

                this.openRazorpayCheckout(
                  order.id,
                  razorpayOrder
                );
              },

              error: (err) => {

                console.error(
                  'RAZORPAY ORDER ERROR:',
                  err
                );

                this.paymentLoading = false;

                this.error =
                  'Unable to start payment. Please try again.';
              }

            });
        },

        error: (err) => {

          console.error(
            'CREATE ORDER ERROR:',
            err
          );

          this.paymentLoading = false;

          this.error =
            'Unable to create your order. Please try again.';
        }

      });
  }


  // ==========================================
  // OPEN RAZORPAY CHECKOUT
  // ==========================================

  private openRazorpayCheckout(
    orderId: number,
    razorpayOrder: RazorpayOrderResponse
  ): void {

    if (typeof Razorpay === 'undefined') {

      console.error(
        'Razorpay SDK not loaded.'
      );

      this.paymentLoading = false;

      this.error =
        'Payment system is not loaded. Please refresh the page.';

      return;
    }


    const options = {

      key:
        razorpayOrder.keyId,

      amount:
        razorpayOrder.amount,

      currency:
        razorpayOrder.currency,

      name:
        'KCart',

      description:
        `Payment for Order #${orderId}`,

      order_id:
        razorpayOrder.razorpayOrderId,


      // ======================================
      // PAYMENT SUCCESS
      // ======================================

      handler: (response: any) => {

        console.log(
          'RAZORPAY PAYMENT SUCCESS:',
          response
        );

        this.verifyPayment(
          response
        );
      },


      // ======================================
      // CUSTOMER DETAILS
      // ======================================

      prefill: {

        name:
          this.user?.username || '',

        email:
          this.user?.email || '',

        contact:
          this.user?.phone || ''
      },


      // ======================================
      // NOTES
      // ======================================

      notes: {

        orderId:
          orderId.toString()
      },


      // ======================================
      // THEME
      // ======================================

      theme: {

        color:
          '#ff9900'
      },


      // ======================================
      // MODAL CLOSED
      // ======================================

      modal: {

        ondismiss: () => {

          console.log(
            'Razorpay checkout closed'
          );

          this.paymentLoading = false;
        }
      }
    };


    // ========================================
    // CREATE RAZORPAY INSTANCE
    // ========================================

    const razorpay =
      new Razorpay(options);


    // ========================================
    // PAYMENT FAILED
    // ========================================

    razorpay.on(
      'payment.failed',
      (response: any) => {

        console.error(
          'RAZORPAY PAYMENT FAILED:',
          response
        );

        this.paymentLoading = false;

        this.error =
          'Payment failed. Please try again.';
      }
    );


    // ========================================
    // OPEN PAYMENT WINDOW
    // ========================================

    razorpay.open();
  }


  // ==========================================
  // VERIFY PAYMENT
  // ==========================================

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

        next: (payment) => {

          console.log(
            'PAYMENT VERIFIED:',
            payment
          );

          this.paymentLoading = false;


          alert(
            'Payment successful! Your order has been confirmed.'
          );


          this.router.navigate(
            ['/orders']
          );
        },

        error: (err) => {

          console.error(
            'PAYMENT VERIFICATION ERROR:',
            err
          );

          this.paymentLoading = false;

          this.error =
            'Payment was completed, but verification failed. Please contact support.';
        }

      });
  }

}