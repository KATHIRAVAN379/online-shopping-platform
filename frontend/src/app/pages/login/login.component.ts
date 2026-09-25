import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  AuthService
} from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  email = '';
  password = '';

  loading = false;
  error = '';

  returnUrl = '/';

  constructor(
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {

    const returnUrl =
      this.activatedRoute.snapshot.queryParamMap
        .get('returnUrl');

    if (returnUrl) {
      this.returnUrl = returnUrl;
    }
  }

  login(): void {

    this.error = '';

    if (!this.email.trim()) {

      this.error =
        'Please enter your email.';

      return;
    }

    if (!this.password) {

      this.error =
        'Please enter your password.';

      return;
    }

    this.loading = true;

    this.authService
      .login(
        this.email.trim(),
        this.password
      )
      .subscribe({

        next: (token: string) => {

          console.log('LOGIN SUCCESS');

          localStorage.setItem(
            'kcart_token',
            token
          );

          this.loading = false;

          this.router.navigateByUrl(
            this.returnUrl
          );
        },

        error: (err: unknown) => {

          console.error(
            'LOGIN ERROR:',
            err
          );

          this.loading = false;

          const status =
            this.getErrorStatus(err);

          if (status === 401) {

            this.error =
              'Invalid email or password.';

          } else if (status === 400) {

            this.error =
              'Invalid login request.';

          } else {

            this.error =
              'Unable to login. Please try again.';
          }
        }
      });
  }

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