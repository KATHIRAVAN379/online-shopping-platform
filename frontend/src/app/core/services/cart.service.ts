import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  tap
} from 'rxjs';

import { Cart } from '../models/cart';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private readonly API_URL =
    'http://localhost:8080/cart';


  // =====================================================
  // CART COUNT
  // =====================================================

  private cartCountSubject =
    new BehaviorSubject<number>(0);


  /*
   * Header subscribes to this.
   *
   * Whenever cart count changes,
   * the header receives the new value immediately.
   */
  cartCount$ =
    this.cartCountSubject.asObservable();


  constructor(
    private http: HttpClient
  ) {}


  // =====================================================
  // ADD TO CART
  // =====================================================

  addToCart(
    productId: number,
    quantity: number = 1
  ): Observable<Cart> {

    const cart: Cart = {
      productId: productId,
      quantity: quantity
    };


    return this.http
      .post<Cart>(
        this.API_URL,
        cart
      )
      .pipe(

        tap(() => {

          /*
           * Backend has successfully updated
           * the cart.
           *
           * Now refresh the count immediately.
           */
          this.refreshCartCount();

        })

      );
  }


  // =====================================================
  // GET CART
  // =====================================================

  getCart(): Observable<Cart[]> {

    return this.http
      .get<Cart[]>(
        this.API_URL
      )
      .pipe(

        tap((cartItems: Cart[]) => {

          /*
           * Calculate total quantity.
           *
           * Example:
           *
           * Product A = 2
           * Product B = 3
           *
           * Header count = 5
           */
          const count =
            cartItems.reduce(
              (
                total,
                item
              ) =>
                total +
                (item.quantity || 0),
              0
            );


          this.cartCountSubject.next(
            count
          );

        })

      );
  }


  // =====================================================
  // REFRESH CART COUNT
  // =====================================================

  refreshCartCount(): void {

    /*
     * Don't call backend if user is logged out.
     */
    const token =
      localStorage.getItem(
        'kcart_token'
      );


    if (!token) {

      this.cartCountSubject.next(0);

      return;
    }


    this.http
      .get<Cart[]>(
        this.API_URL
      )
      .subscribe({

        next: (cartItems: Cart[]) => {

          const count =
            cartItems.reduce(
              (
                total,
                item
              ) =>
                total +
                (item.quantity || 0),
              0
            );


          this.cartCountSubject.next(
            count
          );


          console.log(
            'CART COUNT UPDATED:',
            count
          );

        },

        error: (error) => {

          console.error(
            'CART COUNT REFRESH ERROR:',
            error
          );

          /*
           * Don't assume there are no items
           * if the request fails.
           *
           * Keep the previous count.
           */

        }

      });
  }


  // =====================================================
  // UPDATE QUANTITY
  // =====================================================

  updateQuantity(
    productId: number,
    quantity: number
  ): Observable<Cart> {

    return this.http
      .put<Cart>(
        `${this.API_URL}/${productId}?quantity=${quantity}`,
        {}
      )
      .pipe(

        tap(() => {

          /*
           * Quantity changed.
           * Immediately refresh header count.
           */
          this.refreshCartCount();

        })

      );
  }


  // =====================================================
  // REMOVE FROM CART
  // =====================================================

  removeFromCart(
    productId: number
  ): Observable<string> {

    return this.http
      .delete(
        `${this.API_URL}/${productId}`,
        {
          responseType: 'text'
        }
      )
      .pipe(

        tap(() => {

          /*
           * Item removed.
           * Immediately refresh header count.
           */
          this.refreshCartCount();

        })

      );
  }


  // =====================================================
  // CLEAR CART
  // =====================================================

  clearCart(): Observable<string> {

    return this.http
      .delete(
        this.API_URL,
        {
          responseType: 'text'
        }
      )
      .pipe(

        tap(() => {

          /*
           * Cart is completely empty.
           *
           * We can immediately show 0
           * without waiting for another GET.
           */
          this.cartCountSubject.next(0);

        })

      );
  }
}