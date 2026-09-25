import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private readonly API_URL = 'http://localhost:8080/products';

  constructor(
    private http: HttpClient
  ) {}

  getAllProducts(): Observable<Product[]> {

    return this.http.get<Product[]>(
      this.API_URL
    );

  }

  getProductById(id: number): Observable<Product> {

    return this.http.get<Product>(
      `${this.API_URL}/${id}`
    );

  }

  getProductsByCategory(
    category: string
  ): Observable<Product[]> {

    return this.http.get<Product[]>(
      `${this.API_URL}/category/${category}`
    );

  }

  getProductsByBrand(
    brand: string
  ): Observable<Product[]> {

    return this.http.get<Product[]>(
      `${this.API_URL}/brand/${brand}`
    );

  }

  getProductsByMaxPrice(
    price: number
  ): Observable<Product[]> {

    return this.http.get<Product[]>(
      `${this.API_URL}/price/${price}`
    );

  }

}