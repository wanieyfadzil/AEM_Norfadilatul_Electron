import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent {

  signInForm: FormGroup;

  isLoading = false;
  loginError = '';
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signInForm = this.formBuilder.group({
      username: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],
      password: [
        '',
        Validators.required
      ]
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {

    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.loginError = '';

    const {
      username,
      password
    } = this.signInForm.value;

    this.authService
      .login(username, password)
      .subscribe({
        next: () => {
          this.isLoading = false;

          this.router.navigate(['/dashboard']);
        },

        error: error => {
          this.isLoading = false;

          console.error('Login failed:', error);

          this.loginError =
            'Invalid username or password.';
        }
      });
  }
}