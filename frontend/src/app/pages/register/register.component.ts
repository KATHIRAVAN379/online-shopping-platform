import { Component } from '@angular/core';
import {
  FormsModule
} from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  AuthService,
  RegisterRequest
} from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  name = '';
  email = '';
  phone = '';
  address = '';
  password = '';
  confirmPassword = '';

  loading = false;

  error = '';

  success = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}


  // =========================
  // REGISTER
  // =========================

  register(): void {

    this.error = '';
    this.success = '';


    // NAME

    if (!this.name.trim()) {

      this.error =
        'Please enter your name.';

      return;
    }


    // EMAIL

    if (!this.email.trim()) {

      this.error =
        'Please enter your email.';

      return;
    }


    // PHONE

    if (!this.phone.trim()) {

      this.error =
        'Please enter your phone number.';

      return;
    }

    if (
      !/^[0-9]{10}$/.test(
        this.phone.trim()
      )
    ) {

      this.error =
        'Please enter a valid 10-digit phone number.';

      return;
    }


    // ADDRESS

    if (!this.address.trim()) {

      this.error =
        'Please enter your address.';

      return;
    }


    // PASSWORD

    if (!this.password) {

      this.error =
        'Please enter a password.';

      return;
    }

    if (this.password.length < 6) {

      this.error =
        'Password must contain at least 6 characters.';

      return;
    }


    // CONFIRM PASSWORD

    if (
      this.password !==
      this.confirmPassword
    ) {

      this.error =
        'Passwords do not match.';

      return;
    }


    // REQUEST

    const request: RegisterRequest = {

      username:
        this.name.trim(),

      email:
        this.email.trim(),

      phone:
        this.phone.trim(),

      password:
        this.password,

      address:
        this.address.trim()
    };


    console.log(
      'REGISTER REQUEST:',
      request
    );


    this.loading = true;


    // API CALL

    this.authService
      .register(request)
      .subscribe({

        next: (response) => {

          console.log(
            'REGISTRATION SUCCESS:',
            response
          );

          this.loading = false;

          this.success =
            'Registration successful. Please login.';


          setTimeout(() => {

            this.router.navigate([
              '/login'
            ]);

          }, 1200);
        },


        error: (err: unknown) => {

          console.error(
            'REGISTRATION ERROR:',
            err
          );

          this.loading = false;


          const status =
            this.getErrorStatus(err);


          if (status === 409) {

            this.error =
              'Email or phone number already exists.';

          }

          else if (status === 400) {

            this.error =
              'Invalid registration details.';

          }

          else {

            this.error =
              'Unable to create account. Please try again.';
          }
        }
      });
  }


  // =========================
  // ERROR STATUS
  // =========================

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