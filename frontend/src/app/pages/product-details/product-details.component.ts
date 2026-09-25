import { Component, OnInit } from '@angular/core';
import {
  CommonModule,
  DecimalPipe
} from '@angular/common';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { Product } from '../../core/models/product';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    RouterLink
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent
  implements OnInit {

  product: Product | null = null;

  loading = true;

  error = '';

  quantity = 1;

  addingToCart = false;

  buyingNow = false;

  isFavourite = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {

    const id =
      Number(
        this.route.snapshot.paramMap.get('id')
      );

    if (!id) {

      this.error =
        'Invalid product.';

      this.loading = false;

      return;
    }

    this.loadProduct(id);
  }

  // ==========================================
  // LOAD PRODUCT
  // ==========================================

  loadProduct(id: number): void {

    this.loading = true;

    this.productService
      .getProductById(id)
      .subscribe({

        next: (product: Product) => {

          this.product = product;

          this.quantity = 1;

          this.loading = false;

          this.loadFavourite();
        },

        error: (err: unknown) => {

          console.error(
            'PRODUCT DETAILS ERROR:',
            err
          );

          this.error =
            'Unable to load product.';

          this.loading = false;
        }
      });
  }

  // ==========================================
  // INCREASE QUANTITY
  // ==========================================

  increaseQuantity(): void {

    if (!this.product) {
      return;
    }

    if (
      this.quantity <
      this.product.quantity
    ) {

      this.quantity++;
    }
  }

  // ==========================================
  // DECREASE QUANTITY
  // ==========================================

  decreaseQuantity(): void {

    if (this.quantity > 1) {

      this.quantity--;
    }
  }

  // ==========================================
  // ADD TO CART
  // ==========================================

  addToCart(): void {

    if (!this.product) {
      return;
    }

    // Login check
    if (!this.isLoggedIn()) {

      this.goToLogin();

      return;
    }

    // Stock check
    if (this.product.quantity <= 0) {

      alert(
        'This product is out of stock.'
      );

      return;
    }

    if (
      this.quantity >
      this.product.quantity
    ) {

      alert(
        `Only ${this.product.quantity} items are available.`
      );

      return;
    }

    if (this.addingToCart) {
      return;
    }

    this.addingToCart = true;

    this.cartService
      .addToCart(
        this.product.id,
        this.quantity
      )
      .subscribe({

        next: (response) => {

          console.log(
            'PRODUCT ADDED TO CART:',
            response
          );

          this.addingToCart = false;

          alert(
            `${this.product?.name} added to cart successfully.`
          );
        },

        error: (err: unknown) => {

          console.error(
            'ADD TO CART ERROR:',
            err
          );

          this.addingToCart = false;

          this.handleCartError(err);
        }
      });
  }

  // ==========================================
  // BUY NOW
  // ==========================================

  buyNow(): void {

    if (!this.product) {
      return;
    }

    // Login check
    if (!this.isLoggedIn()) {

      this.goToLogin();

      return;
    }

    // Stock check
    if (this.product.quantity <= 0) {

      alert(
        'This product is out of stock.'
      );

      return;
    }

    if (
      this.quantity >
      this.product.quantity
    ) {

      alert(
        `Only ${this.product.quantity} items are available.`
      );

      return;
    }

    if (this.buyingNow) {
      return;
    }

    this.buyingNow = true;

    this.cartService
      .addToCart(
        this.product.id,
        this.quantity
      )
      .subscribe({

        next: (response) => {

          console.log(
            'BUY NOW CART RESPONSE:',
            response
          );

          this.buyingNow = false;

          // Go to cart after adding
          this.router.navigate([
            '/cart'
          ]);
        },

        error: (err: unknown) => {

          console.error(
            'BUY NOW ERROR:',
            err
          );

          this.buyingNow = false;

          this.handleCartError(err);
        }
      });
  }

  // ==========================================
  // LOGIN CHECK
  // ==========================================

  isLoggedIn(): boolean {

    return !!localStorage.getItem(
      'kcart_token'
    );
  }

  // ==========================================
  // GO TO LOGIN
  // ==========================================

  private goToLogin(): void {

    const returnUrl =
      this.router.url;

    this.router.navigate(
      ['/login'],
      {
        queryParams: {
          returnUrl: returnUrl
        }
      }
    );
  }

  // ==========================================
  // HANDLE CART ERROR
  // ==========================================

  private handleCartError(
    error: unknown
  ): void {

    const status =
      this.getErrorStatus(error);

    if (
      status === 401 ||
      status === 403
    ) {

      localStorage.removeItem(
        'kcart_token'
      );

      alert(
        'Your login session has expired. Please login again.'
      );

      this.goToLogin();

      return;
    }

    alert(
      'Unable to add product to cart.'
    );
  }

  // ==========================================
  // FAVOURITE
  // ==========================================

  loadFavourite(): void {

    if (!this.product) {
      return;
    }

    const saved =
      localStorage.getItem(
        'kcart_favourites'
      );

    if (!saved) {

      this.isFavourite = false;

      return;
    }

    try {

      const ids: number[] =
        JSON.parse(saved);

      this.isFavourite =
        ids.includes(
          this.product.id
        );

    } catch {

      this.isFavourite = false;
    }
  }

  toggleFavourite(): void {

    if (!this.product) {
      return;
    }

    let ids: number[] = [];

    const saved =
      localStorage.getItem(
        'kcart_favourites'
      );

    if (saved) {

      try {

        ids = JSON.parse(saved);

      } catch {

        ids = [];
      }
    }

    if (
      ids.includes(
        this.product.id
      )
    ) {

      ids =
        ids.filter(
          id => id !== this.product?.id
        );

      this.isFavourite = false;

    } else {

      ids.push(
        this.product.id
      );

      this.isFavourite = true;
    }

    localStorage.setItem(
      'kcart_favourites',
      JSON.stringify(ids)
    );
  }

  // ==========================================
  // IMAGE ERROR
  // ==========================================

  imageError(
    event: Event
  ): void {

    const image =
      event.target as HTMLImageElement;

    if (image) {

      image.style.display = 'none';
    }
  }

  // ==========================================
  // ERROR STATUS
  // ==========================================

  private getErrorStatus(
    error: unknown
  ): number | undefined {

    if (
      typeof error === 'object' &&
      error !== null &&
      'status' in error
    ) {

      return (
        error as {
          status?: number
        }
      ).status;
    }

    return undefined;
  }
}