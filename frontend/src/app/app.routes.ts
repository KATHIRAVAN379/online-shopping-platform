import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';

import { LoginComponent } from './pages/login/login.component';

import { RegisterComponent } from './pages/register/register.component';

import { CartComponent } from './pages/cart/cart.component';

import { FavouritesComponent } from './pages/favourites/favourites.component';

import { OrdersComponent } from './pages/orders/orders.component';

import { OrderDetailsComponent } from './pages/order-details/order-details.component';

import { ProductDetailsComponent } from './pages/product-details/product-details.component';

import { CheckoutComponent } from './pages/checkout/checkout.component';

export const routes: Routes = [

  // Home
  {
    path: '',
    component: HomeComponent
  },

  // Login
  {
    path: 'login',
    component: LoginComponent
  },

  // Register
  {
    path: 'register',
    component: RegisterComponent
  },

  // Cart
  {
    path: 'cart',
    component: CartComponent
  },

  // Checkout
  {
    path: 'checkout',
    component: CheckoutComponent
  },

  // Favourites
  {
    path: 'favourites',
    component: FavouritesComponent
  },

  // Orders
  {
    path: 'orders',
    component: OrdersComponent
  },

  // Order Details
  {
    path: 'orders/:id',
    component: OrderDetailsComponent
  },

  // Product Details
  {
    path: 'product/:id',
    component: ProductDetailsComponent
  },

  // Unknown route
  {
    path: '**',
    redirectTo: ''
  }

];