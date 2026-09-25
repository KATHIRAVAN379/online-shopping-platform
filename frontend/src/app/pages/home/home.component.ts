import { Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { Product } from '../../core/models/product';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';


@Component({
  selector: 'app-home',
  standalone: true,

  imports: [
    DecimalPipe,
    RouterLink
  ],

  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {


  // =====================================================
  // PRODUCTS
  // =====================================================

  products: Product[] = [];

  private allProducts: Product[] = [];


  // =====================================================
  // PAGE STATUS
  // =====================================================

  loading = true;

  error = '';


  // =====================================================
  // FAVOURITES
  // =====================================================

  favouriteIds: Set<number> =
    new Set<number>();


  // =====================================================
  // ADD TO CART STATUS
  // =====================================================

  addingToCart: Set<number> =
    new Set<number>();


  // =====================================================
  // SEARCH / CATEGORY
  // =====================================================

  currentSearch = '';

  currentCategory = '';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute
  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    /*
     * Load all products from backend.
     */
    this.loadProducts();


    /*
     * Load favourites saved in browser.
     */
    this.loadFavourites();


    /*
     * Watch URL query parameters.
     *
     * Example:
     *
     * /?search=iphone
     *
     * /?category=Mobiles
     */
    this.route.queryParams.subscribe(
      params => {

        this.currentSearch =
          (
            params['search'] || ''
          ).trim();


        this.currentCategory =
          (
            params['category'] || ''
          ).trim();


        /*
         * Apply search/category
         * whenever URL changes.
         */
        this.applyFilters();

      }
    );
  }


  // =====================================================
  // LOAD PRODUCTS
  // =====================================================

  loadProducts(): void {

    this.loading = true;

    this.error = '';


    this.productService
      .getAllProducts()
      .subscribe({

        next: (data: Product[]) => {

          console.log(
            'REAL PRODUCTS:',
            data
          );


          /*
           * Keep original products.
           */
          this.allProducts = data;


          /*
           * Apply search/category.
           */
          this.applyFilters();


          this.loading = false;

        },


        error: (err: unknown) => {

          console.error(
            'PRODUCT API ERROR:',
            err
          );


          this.error =
            'Unable to load products.';


          this.loading = false;

        }

      });
  }


  // =====================================================
  // APPLY SEARCH + CATEGORY
  // =====================================================

  private applyFilters(): void {

    /*
     * If backend hasn't returned
     * products yet, don't filter.
     */
    if (!this.allProducts.length) {

      this.products = [];

      return;
    }


    /*
     * Start with all products.
     */
    let filtered =
      [...this.allProducts];


    // ===================================================
    // CATEGORY FILTER
    // ===================================================

    if (this.currentCategory) {

      const category =
        this.currentCategory.toLowerCase();


      filtered =
        filtered.filter(
          product => {

            const productCategory =
              product.category
                ?.toLowerCase() || '';


            /*
             * Use includes() because
             * "Home & Kitchen" etc.
             * may have slightly different
             * backend values.
             */
            return productCategory
              .includes(category);

          }
        );
    }


    // ===================================================
    // SEARCH FILTER
    // ===================================================

    if (this.currentSearch) {

      const search =
        this.currentSearch.toLowerCase();


      filtered =
        filtered.filter(
          product => {

            const name =
              product.name
                ?.toLowerCase() || '';


            const brand =
              product.brand
                ?.toLowerCase() || '';


            const category =
              product.category
                ?.toLowerCase() || '';


            const description =
              product.description
                ?.toLowerCase() || '';


            return (
              name.includes(search) ||
              brand.includes(search) ||
              category.includes(search) ||
              description.includes(search)
            );

          }
        );
    }


    /*
     * Update UI.
     */
    this.products = filtered;


    console.log(
      'FILTERED PRODUCTS:',
      this.products
    );
  }


  // =====================================================
  // RETRY
  // =====================================================

  retry(): void {

    this.loadProducts();

  }


  // =====================================================
  // CATEGORY
  // =====================================================

  viewCategory(
    category: string
  ): void {

    this.router.navigate(
      ['/'],
      {
        queryParams: {
          category: category
        }
      }
    );

  }


  // =====================================================
  // SEARCH
  // =====================================================

  searchProducts(
    searchText: string
  ): void {

    const search =
      searchText.trim();


    /*
     * Empty search means
     * show all products.
     */
    if (!search) {

      this.router.navigate(
        ['/'],
        {
          queryParams: {}
        }
      );

      return;
    }


    this.router.navigate(
      ['/'],
      {
        queryParams: {
          search: search
        }
      }
    );

  }


  // =====================================================
  // ADD TO CART
  // =====================================================

  addToCart(
    product: Product
  ): void {

    console.log(
      'ADD TO CART CLICKED:',
      product
    );


    // ===================================================
    // LOGIN CHECK
    // ===================================================

    const token =
      localStorage.getItem(
        'kcart_token'
      );


    if (!token) {

      this.router.navigate(
        ['/login'],
        {
          queryParams: {
            returnUrl: '/'
          }
        }
      );

      return;
    }


    // ===================================================
    // STOCK CHECK
    // ===================================================

    if (product.quantity <= 0) {

      alert(
        'This product is out of stock.'
      );

      return;
    }


    // ===================================================
    // PREVENT DOUBLE CLICK
    // ===================================================

    if (
      this.addingToCart.has(
        product.id
      )
    ) {

      return;
    }


    this.addingToCart.add(
      product.id
    );


    // ===================================================
    // CALL BACKEND
    // ===================================================

    this.cartService
      .addToCart(
        product.id,
        1
      )
      .subscribe({

        next: (response) => {

          console.log(
            'ADDED TO CART:',
            response
          );


          this.addingToCart.delete(
            product.id
          );


          alert(
            `${product.name} added to cart successfully.`
          );

          /*
           * CartService now automatically
           * refreshes the header cart count.
           *
           * No navigation is required.
           */

        },


        error: (err: unknown) => {

          console.error(
            'ADD TO CART ERROR:',
            err
          );


          this.addingToCart.delete(
            product.id
          );


          const status =
            this.getErrorStatus(err);


          // =================================================
          // AUTH ERROR
          // =================================================

          if (
            status === 401 ||
            status === 403
          ) {

            localStorage.removeItem(
              'kcart_token'
            );


            this.router.navigate(
              ['/login'],
              {
                queryParams: {
                  returnUrl: '/'
                }
              }
            );


            return;
          }


          // =================================================
          // OTHER ERROR
          // =================================================

          alert(
            'Unable to add product to cart.'
          );

        }

      });
  }


  // =====================================================
  // ADDING TO CART CHECK
  // =====================================================

  isAddingToCart(
    productId: number
  ): boolean {

    return this.addingToCart.has(
      productId
    );

  }


  // =====================================================
  // LOAD FAVOURITES
  // =====================================================

  loadFavourites(): void {

    try {

      const saved =
        localStorage.getItem(
          'kcart_favourites'
        );


      if (!saved) {

        return;
      }


      const ids: number[] =
        JSON.parse(saved);


      this.favouriteIds =
        new Set<number>(ids);

    }
    catch (error) {

      console.error(
        'Unable to load favourites:',
        error
      );


      this.favouriteIds =
        new Set<number>();

    }
  }


  // =====================================================
  // TOGGLE FAVOURITE
  // =====================================================

  toggleFavourite(
    product: Product
  ): void {

    if (
      this.favouriteIds.has(
        product.id
      )
    ) {

      this.favouriteIds.delete(
        product.id
      );

    }
    else {

      this.favouriteIds.add(
        product.id
      );

    }


    this.saveFavourites();

  }


  // =====================================================
  // CHECK FAVOURITE
  // =====================================================

  isFavourite(
    product: Product
  ): boolean {

    return this.favouriteIds.has(
      product.id
    );

  }


  // =====================================================
  // SAVE FAVOURITES
  // =====================================================

  private saveFavourites(): void {

    const ids =
      Array.from(
        this.favouriteIds
      );


    localStorage.setItem(
      'kcart_favourites',
      JSON.stringify(ids)
    );

  }


  // =====================================================
  // PRODUCT IMAGE
  // =====================================================

  getProductImage(
    product: Product
  ): string {

    const category =
      product.category
        ?.toLowerCase() || '';


    // ===================================================
    // MOBILES
    // ===================================================

    if (
      category.includes('mobile') ||
      category.includes('phone')
    ) {

      return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80';

    }


    // ===================================================
    // ELECTRONICS
    // ===================================================

    if (
      category.includes('electronic') ||
      category.includes('laptop') ||
      category.includes('computer')
    ) {

      return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80';

    }


    // ===================================================
    // FASHION
    // ===================================================

    if (
      category.includes('fashion') ||
      category.includes('cloth')
    ) {

      return 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80';

    }


    // ===================================================
    // BOOKS
    // ===================================================

    if (
      category.includes('book')
    ) {

      return 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80';

    }


    // ===================================================
    // BEAUTY
    // ===================================================

    if (
      category.includes('beauty') ||
      category.includes('cosmetic')
    ) {

      return 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80';

    }


    // ===================================================
    // SPORTS
    // ===================================================

    if (
      category.includes('sport')
    ) {

      return 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=600&q=80';

    }


    // ===================================================
    // HOME
    // ===================================================

    if (
      category.includes('home') ||
      category.includes('kitchen')
    ) {

      return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80';

    }


    // ===================================================
    // DEFAULT
    // ===================================================

    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';

  }


  // =====================================================
  // IMAGE ERROR
  // =====================================================

  imageError(
    event: Event
  ): void {

    const image =
      event.target as HTMLImageElement;


    if (!image) {

      return;
    }


    /*
     * Instead of leaving a broken
     * image icon, hide it.
     */
    image.style.display = 'none';

  }


  // =====================================================
  // ERROR STATUS
  // =====================================================

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