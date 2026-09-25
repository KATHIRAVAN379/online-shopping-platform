import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { User } from '../models/user';

export interface RegisterRequest {
  username: string;
  email: string;
  phone: string;
  password: string;
  address: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API_URL =
    'http://localhost:8080/auth';

  constructor(
    private http: HttpClient
  ) {}

  // =========================
  // REGISTER
  // =========================

  register(
    request: RegisterRequest
  ): Observable<User> {

    return this.http.post<User>(
      `${this.API_URL}/register`,
      request
    );
  }


  // =========================
  // LOGIN
  // =========================

  login(
    email: string,
    password: string
  ): Observable<string> {

    const params = new HttpParams()
      .set('email', email)
      .set('password', password);

    return this.http.post(
      `${this.API_URL}/login`,
      null,
      {
        params,
        responseType: 'text'
      }
    );
  }


  // =========================
  // GET PROFILE
  // =========================

  getProfile(
    email: string
  ): Observable<User> {

    const params = new HttpParams()
      .set('email', email);

    return this.http.get<User>(
      `${this.API_URL}/profile`,
      {
        params
      }
    );
  }


  // =========================
  // UPDATE PROFILE
  // =========================

  updateProfile(
    email: string,
    user: User
  ): Observable<User> {

    const params = new HttpParams()
      .set('email', email);

    return this.http.put<User>(
      `${this.API_URL}/updateprofile`,
      user,
      {
        params
      }
    );
  }


  // =========================
  // LOGIN STATUS
  // =========================

  isLoggedIn(): boolean {

    return !!localStorage.getItem(
      'kcart_token'
    );
  }


  // =========================
  // GET TOKEN
  // =========================

  getToken(): string | null {

    return localStorage.getItem(
      'kcart_token'
    );
  }


  // =========================
  // LOGOUT
  // =========================

  logout(): void {

    localStorage.removeItem(
      'kcart_token'
    );
  }
}