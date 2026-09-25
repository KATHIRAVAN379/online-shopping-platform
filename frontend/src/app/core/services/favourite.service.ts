import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class FavouriteService {

  private readonly STORAGE_KEY = 'kcart_favourites';

  private favouritesSubject =
    new BehaviorSubject<Product[]>(
      this.loadFavourites()
    );

  favourites$: Observable<Product[]> =
    this.favouritesSubject.asObservable();


  private loadFavourites(): Product[] {

    const saved =
      localStorage.getItem(this.STORAGE_KEY);

    if (!saved) {
      return [];
    }

    try {

      const products =
        JSON.parse(saved);

      return Array.isArray(products)
        ? products
        : [];

    } catch {

      return [];

    }
  }


  private saveFavourites(
    products: Product[]
  ): void {

    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(products)
    );

    this.favouritesSubject.next(
      products
    );
  }


  getFavourites(): Product[] {

    return this.favouritesSubject.value;

  }


  isFavourite(productId: number): boolean {

    return this.favouritesSubject.value.some(
      product => product.id === productId
    );

  }


  addFavourite(product: Product): void {

    const current =
      this.favouritesSubject.value;

    const alreadyExists =
      current.some(
        item => item.id === product.id
      );

    if (alreadyExists) {
      return;
    }

    this.saveFavourites([
      ...current,
      product
    ]);

  }


  removeFavourite(productId: number): void {

    const updated =
      this.favouritesSubject.value.filter(
        product => product.id !== productId
      );

    this.saveFavourites(updated);

  }


  toggleFavourite(product: Product): void {

    if (this.isFavourite(product.id)) {

      this.removeFavourite(product.id);

    } else {

      this.addFavourite(product);

    }

  }


  clearFavourites(): void {

    this.saveFavourites([]);

  }

}