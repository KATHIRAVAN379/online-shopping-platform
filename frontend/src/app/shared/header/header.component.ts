import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink
} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter, Subscription } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {

  // =====================================================
  // USER
  // =====================================================

  user: User | null = null;


  // =====================================================
  // SEARCH
  // =====================================================

  searchText = '';

  selectedCategory = 'All Categories';


  // =====================================================
  // DELIVERY LOCATION
  // =====================================================

  deliveryLocation =
    localStorage.getItem('kcart_delivery_location')
    || 'Chennai 600001';

  /*
   * Temporary value used inside
   * the location popup.
   */
  locationInput = this.deliveryLocation;


  /*
   * Controls the location popup.
   */
  showLocationModal = false;


  // =====================================================
  // CART COUNT
  // =====================================================

  /*
   * This is currently kept as a UI value.
   * We can connect it to CartService next.
   */
  cartCount = 0;


  // =====================================================
  // ROUTER SUBSCRIPTION
  // =====================================================

  private routerSubscription?: Subscription;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.loadUser();


    /*
     * Reload user whenever navigation happens.
     */
    this.routerSubscription =
      this.router.events
        .pipe(
          filter(
            event =>
              event instanceof NavigationEnd
          )
        )
        .subscribe(() => {

          this.loadUser();

        });

  }


  // =====================================================
  // CHECK LOGIN
  // =====================================================

  isLoggedIn(): boolean {

    return !!localStorage.getItem(
      'kcart_token'
    );

  }


  // =====================================================
  // LOAD USER
  // =====================================================

  private loadUser(): void {

    /*
     * If user is not logged in,
     * clear user information.
     */

    if (!this.isLoggedIn()) {

      this.user = null;

      return;
    }


    /*
     * Get JWT token.
     */

    const token =
      this.authService.getToken();


    if (!token) {

      this.user = null;

      return;
    }


    try {

      /*
       * JWT format:
       *
       * header.payload.signature
       */

      const parts =
        token.split('.');


      if (parts.length !== 3) {

        this.user = null;

        return;
      }


      /*
       * Decode JWT payload.
       */

      const payload =
        JSON.parse(
          atob(parts[1])
        );


      /*
       * Our JWT uses email as subject.
       */

      const email =
        payload.sub;


      if (!email) {

        this.user = null;

        return;
      }


      /*
       * Get complete user information
       * from Auth Service.
       */

      this.authService
        .getProfile(email)
        .subscribe({

          next: (user: User) => {

            this.user = user;

          },

          error: (error) => {

            console.error(
              'PROFILE LOAD ERROR:',
              error
            );

            this.user = null;

          }

        });

    }
    catch (error) {

      console.error(
        'JWT DECODE ERROR:',
        error
      );

      this.user = null;

    }

  }


  // =====================================================
  // SEARCH
  // =====================================================

  searchProducts(): void {

    const search =
      this.searchText.trim();


    /*
     * If search box is empty,
     * go back to home.
     */

    if (!search) {

      this.router.navigate(['/']);

      return;
    }


    /*
     * HomeComponent reads
     * the "search" query parameter.
     */

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
  // SEARCH ENTER KEY
  // =====================================================

  onSearchKeydown(
    event: KeyboardEvent
  ): void {

    if (event.key === 'Enter') {

      event.preventDefault();

      this.searchProducts();

    }

  }


  // =====================================================
  // CATEGORY SELECT
  // =====================================================

  selectCategory(): void {

    /*
     * All Categories means
     * remove category filtering.
     */

    if (
      !this.selectedCategory ||
      this.selectedCategory ===
        'All Categories'
    ) {

      this.router.navigate(['/']);

      return;
    }


    /*
     * Send category to HomeComponent.
     */

    this.router.navigate(
      ['/'],
      {
        queryParams: {
          category:
            this.selectedCategory
        }
      }
    );

  }


  // =====================================================
  // CATEGORY NAVIGATION
  // =====================================================

  goToCategory(
    category: string
  ): void {

    /*
     * Update selected category
     * in search dropdown.
     */

    this.selectedCategory =
      category || 'All Categories';


    /*
     * All Categories.
     */

    if (!category) {

      this.router.navigate(['/']);

      return;
    }


    /*
     * Navigate to HomeComponent
     * with category filter.
     */

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
  // TODAY'S DEALS
  // =====================================================

  goToDeals(): void {

    /*
     * For now Today's Deals
     * displays all products.
     *
     * We can create a dedicated
     * deals filter later.
     */

    this.router.navigate(['/']);

  }


  // =====================================================
  // OPEN LOCATION MODAL
  // =====================================================

  changeDeliveryLocation(): void {

    /*
     * Load current saved location
     * into the temporary input.
     */

    this.locationInput =
      this.deliveryLocation;


    /*
     * Show our custom UI.
     */

    this.showLocationModal = true;

  }


  // =====================================================
  // CLOSE LOCATION MODAL
  // =====================================================

  closeLocationModal(): void {

    /*
     * Restore the current saved
     * location when cancelling.
     */

    this.locationInput =
      this.deliveryLocation;


    /*
     * Hide modal.
     */

    this.showLocationModal = false;

  }


  // =====================================================
  // SAVE DELIVERY LOCATION
  // =====================================================

  saveDeliveryLocation(): void {

    /*
     * Remove unnecessary spaces.
     */

    const location =
      this.locationInput.trim();


    /*
     * Don't save an empty location.
     */

    if (!location) {

      return;
    }


    /*
     * Update displayed location.
     */

    this.deliveryLocation =
      location;


    /*
     * Persist location in browser.
     */

    localStorage.setItem(
      'kcart_delivery_location',
      location
    );


    /*
     * Close modal.
     */

    this.showLocationModal = false;

  }


  // =====================================================
  // LOGOUT
  // =====================================================

  logout(): void {

    /*
     * Clear authentication information.
     */

    this.authService.logout();


    /*
     * Clear user from header immediately.
     */

    this.user = null;


    /*
     * Go back to home.
     */

    this.router.navigate(['/']);

  }


  // =====================================================
  // DESTROY
  // =====================================================

  ngOnDestroy(): void {

    /*
     * Prevent memory leaks from
     * router event subscription.
     */

    this.routerSubscription?.unsubscribe();

  }

}