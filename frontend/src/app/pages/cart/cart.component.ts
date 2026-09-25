import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterLink
} from '@angular/router';

import { Cart } from '../../core/models/cart';
import { Product } from '../../core/models/product';

import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';

interface CartItem {
  cart: Cart;
  product: Product | null;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {

  cartItems: CartItem[] = [];

  loading = true;
  error = '';

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }


  // ==========================================
  // LOAD CART
  // ==========================================

  loadCart(): void {

    this.loading = true;
    this.error = '';

    this.cartService.getCart().subscribe({

      next: (cart: Cart[]) => {

        if (cart.length === 0) {

          this.cartItems = [];
          this.loading = false;

          return;
        }

        this.cartItems = cart.map(item => ({
          cart: item,
          product: null
        }));

        this.loadProducts();

      },

      error: (err) => {

        console.error(
          'GET CART ERROR:',
          err
        );

        this.error =
          'Unable to load your cart.';

        this.loading = false;

      }

    });
  }


  // ==========================================
  // LOAD PRODUCT DETAILS
  // ==========================================

  private loadProducts(): void {

    let completed = 0;

    const total =
      this.cartItems.length;

    this.cartItems.forEach(
      (item, index) => {

        this.productService
          .getProductById(
            item.cart.productId
          )
          .subscribe({

            next: (product: Product) => {

              this.cartItems[index].product =
                product;

              completed++;

              if (completed === total) {
                this.loading = false;
              }

            },

            error: (err) => {

              console.error(
                'PRODUCT LOAD ERROR:',
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
  // INCREASE QUANTITY
  // ==========================================

  increaseQuantity(
    item: CartItem
  ): void {

    const newQuantity =
      item.cart.quantity + 1;

    if (
      item.product &&
      newQuantity > item.product.quantity
    ) {

      alert(
        `Only ${item.product.quantity} units available.`
      );

      return;
    }

    this.updateQuantity(
      item.cart.productId,
      newQuantity
    );
  }


  // ==========================================
  // DECREASE QUANTITY
  // ==========================================

  decreaseQuantity(
    item: CartItem
  ): void {

    const newQuantity =
      item.cart.quantity - 1;

    if (newQuantity < 1) {
      return;
    }

    this.updateQuantity(
      item.cart.productId,
      newQuantity
    );
  }


  // ==========================================
  // UPDATE QUANTITY
  // ==========================================

  updateQuantity(
    productId: number,
    quantity: number
  ): void {

    this.cartService
      .updateQuantity(
        productId,
        quantity
      )
      .subscribe({

        next: (updatedCart: Cart) => {

          const item =
            this.cartItems.find(
              x =>
                x.cart.productId === productId
            );

          if (item) {

            item.cart.quantity =
              updatedCart.quantity;

          }

        },

        error: (err) => {

          console.error(
            'UPDATE QUANTITY ERROR:',
            err
          );

          alert(
            'Unable to update quantity.'
          );

        }

      });
  }


  // ==========================================
  // REMOVE PRODUCT
  // ==========================================

  removeItem(
    productId: number
  ): void {

    this.cartService
      .removeFromCart(productId)
      .subscribe({

        next: () => {

          this.cartItems =
            this.cartItems.filter(
              item =>
                item.cart.productId !== productId
            );

        },

        error: (err) => {

          console.error(
            'REMOVE CART ERROR:',
            err
          );

          alert(
            'Unable to remove product.'
          );

        }

      });
  }


  // ==========================================
  // CLEAR CART
  // ==========================================

  clearCart(): void {

    if (this.cartItems.length === 0) {
      return;
    }

    const confirmed =
      confirm(
        'Are you sure you want to clear your cart?'
      );

    if (!confirmed) {
      return;
    }

    this.cartService
      .clearCart()
      .subscribe({

        next: () => {

          this.cartItems = [];

        },

        error: (err) => {

          console.error(
            'CLEAR CART ERROR:',
            err
          );

          alert(
            'Unable to clear cart.'
          );

        }

      });
  }


  // ==========================================
  // PROCEED TO CHECKOUT
  // ==========================================

  proceedToCheckout(): void {

    if (this.cartItems.length === 0) {

      alert(
        'Your cart is empty.'
      );

      return;
    }

    this.router.navigate([
      '/checkout'
    ]);
  }


  // ==========================================
  // ITEM TOTAL
  // ==========================================

  getItemTotal(
    item: CartItem
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

    return this.cartItems.reduce(
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
  // CART ITEM COUNT
  // ==========================================

  getTotalItems(): number {

    return this.cartItems.reduce(
      (total, item) =>
        total + item.cart.quantity,
      0
    );
  }
}