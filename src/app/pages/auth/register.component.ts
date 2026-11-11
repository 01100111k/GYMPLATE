import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card card">
        <div class="auth-header text-center">
          <a routerLink="/" class="auth-logo">
            <app-icon name="utensils" [size]="28" color="var(--color-primary)"></app-icon>
            <span class="logo-text">Gym<span class="logo-accent">Plate</span></span>
          </a>
          <h2>Create Customer Account</h2>
          <p class="auth-sub">Discover meals tailored to your personal fitness macros</p>
          <div class="account-switch-hint mt-2">
            <a routerLink="/auth/register" class="text-xs text-secondary hover-underline flex items-center justify-center gap-1">
              <app-icon name="arrow-left" [size]="12"></app-icon>
              <span>Back to account selection</span>
            </a>
          </div>
        </div>

        <div class="alert alert-danger" *ngIf="errorMessage">
          <app-icon name="alert-circle" [size]="16"></app-icon>
          <span>{{ errorMessage }}</span>
        </div>

        <form (ngSubmit)="onSubmit()" #registerForm="ngForm" class="auth-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                class="form-control"
                placeholder="Alex"
                [(ngModel)]="formData.firstName"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label" for="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                class="form-control"
                placeholder="Rivera"
                [(ngModel)]="formData.lastName"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              class="form-control"
              placeholder="alex@example.com"
              [(ngModel)]="formData.email"
              required
              email
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="phone">Phone Number</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              class="form-control"
              placeholder="(555) 000-0000"
              [(ngModel)]="formData.phone"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <div class="input-wrap">
              <input
                id="password"
                [type]="showPassword ? 'text' : 'password'"
                name="password"
                class="form-control with-action"
                placeholder="At least 6 characters"
                [(ngModel)]="formData.password"
                required
                minlength="6"
              />
              <button type="button" class="password-toggle" (click)="showPassword = !showPassword">
                <app-icon [name]="showPassword ? 'eye-off' : 'eye'" [size]="16"></app-icon>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              [type]="showPassword ? 'text' : 'password'"
              name="confirmPassword"
              class="form-control"
              placeholder="Repeat your password"
              [(ngModel)]="confirmPassword"
              required
            />
            <div class="form-error" *ngIf="confirmPassword && formData.password !== confirmPassword">
              Passwords do not match.
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-lg w-full"
            [disabled]="registerForm.invalid || formData.password !== confirmPassword || isLoading"
          >
            <span *ngIf="!isLoading">Register Account</span>
            <span *ngIf="isLoading" class="flex items-center justify-center gap-2">
              <span class="loading-spinner"></span> Creating account...
            </span>
          </button>
        </form>

        <div class="auth-links text-center">
          <p>Already have an account? <a routerLink="/auth/login" class="font-medium">Sign in</a></p>
          <p class="mt-2">Want to sell meals? <a routerLink="/auth/seller-register" class="font-medium">Kitchen Registration</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-bg-secondary);
      padding: var(--space-6);
    }
    .auth-card {
      max-width: 480px;
      width: 100%;
      padding: var(--space-8);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-md);
    }
    .auth-header {
      margin-bottom: var(--space-6);
    }
    .auth-logo {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: var(--color-text);
      text-decoration: none;
      margin-bottom: var(--space-3);
    }
    .logo-accent {
      color: var(--color-primary);
    }
    .auth-sub {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }
    .w-full {
      width: 100%;
    }
    .input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }
    .with-action {
      padding-right: 36px;
    }
    .password-toggle {
      position: absolute;
      right: 10px;
      background: none;
      border: none;
      color: var(--color-text-secondary);
      cursor: pointer;
    }
    .alert {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: 10px 14px;
      border-radius: var(--radius);
      font-size: var(--font-size-xs);
      margin-bottom: var(--space-4);
    }
    .alert-danger {
      background: var(--color-danger-bg);
      color: #991B1B;
    }
    .auth-links {
      margin-top: var(--space-6);
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }
  `]
})
export class RegisterComponent {
  formData = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'customer' as const
  };
  confirmPassword = '';
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (this.formData.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    setTimeout(() => {
      const res = this.authService.register(this.formData);
      this.isLoading = false;

      if (res.success) {
        this.router.navigate(['/customer']);
      } else {
        this.errorMessage = res.message;
      }
    }, 400);
  }
}
