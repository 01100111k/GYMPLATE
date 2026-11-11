import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  template: `
    <div class="admin-auth-wrapper">
      <div class="admin-login-container">
        <!-- Main Login Card -->
        <div class="admin-card card">
          <!-- Brand & Header -->
          <div class="admin-header text-center">
            <a routerLink="/" class="brand-logo" aria-label="GymPlate Home">
              <app-icon name="utensils" [size]="26" color="var(--color-primary)"></app-icon>
              <span class="logo-text">Gym<span class="logo-accent">Plate</span></span>
            </a>

            <div class="badge-row">
              <span class="admin-badge">
                <app-icon name="shield" [size]="12" color="var(--color-primary)"></app-icon>
                <span>Platform Governance</span>
              </span>
            </div>

            <h2>Administrator Sign In</h2>
            <p class="admin-sub">Sign in to manage and monitor the GymPlate platform.</p>
          </div>

          <!-- Alert message -->
          <div class="alert alert-danger" *ngIf="errorMessage">
            <app-icon name="alert-circle" [size]="16"></app-icon>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Login Form -->
          <form (ngSubmit)="onSubmit()" #adminForm="ngForm" class="admin-form" novalidate>
            <!-- Email -->
            <div class="form-group">
              <label class="form-label" for="adminEmail">Administrator Email</label>
              <div class="input-wrap">
                <app-icon name="mail" [size]="16" class="input-icon" color="var(--color-text-tertiary)"></app-icon>
                <input
                  id="adminEmail"
                  type="email"
                  name="email"
                  class="form-control with-icon"
                  placeholder="admin@gymplate.com"
                  [(ngModel)]="email"
                  required
                  email
                  #emailInput="ngModel"
                  autocomplete="username"
                />
              </div>
              <div class="form-error" *ngIf="emailInput.invalid && (emailInput.touched || submittedAttempt)">
                Please enter a valid administrator email address.
              </div>
            </div>

            <!-- Password -->
            <div class="form-group">
              <div class="flex justify-between items-center mb-1">
                <label class="form-label" for="adminPassword">Password</label>
                <a routerLink="/auth/forgot-password" class="forgot-link">Forgot password?</a>
              </div>
              <div class="input-wrap">
                <app-icon name="lock" [size]="16" class="input-icon" color="var(--color-text-tertiary)"></app-icon>
                <input
                  id="adminPassword"
                  [type]="showPassword ? 'text' : 'password'"
                  name="password"
                  class="form-control with-icon with-action"
                  placeholder="Enter your password"
                  [(ngModel)]="password"
                  required
                  #passwordInput="ngModel"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  class="password-toggle"
                  (click)="showPassword = !showPassword"
                  [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'"
                >
                  <app-icon [name]="showPassword ? 'eye-off' : 'eye'" [size]="16"></app-icon>
                </button>
              </div>
              <div class="form-error" *ngIf="passwordInput.invalid && (passwordInput.touched || submittedAttempt)">
                Password is required.
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="btn btn-primary btn-lg w-full submit-btn"
              [disabled]="isLoading || !email || !password"
            >
              <span *ngIf="!isLoading">Sign In</span>
              <span *ngIf="isLoading" class="flex items-center justify-center gap-2">
                <app-icon name="refresh-cw" [size]="16" class="spin-icon"></app-icon>
                <span>Signing In...</span>
              </span>
            </button>
          </form>

          <!-- Subtle Demo Credentials Auto-Fill Section -->
          <div class="demo-access-box">
            <div class="demo-access-inner">
              <span class="demo-label">Demo Account</span>
              <button
                type="button"
                class="btn btn-secondary btn-sm demo-autofill-btn"
                (click)="fillAdminCredentials()"
                title="Fill demo administrator credentials"
              >
                <app-icon name="user" [size]="13"></app-icon>
                <span>Auto-fill Demo Credentials</span>
              </button>
            </div>
          </div>

          <!-- Subtle Security Notice -->
          <div class="security-notice">
            <app-icon name="shield" [size]="13" color="var(--color-text-tertiary)"></app-icon>
            <span>Administrator access is restricted to authorized accounts.</span>
          </div>
        </div>

        <!-- Back to GymPlate Link -->
        <div class="nav-back text-center">
          <a routerLink="/" class="back-link">
            <app-icon name="arrow-left" [size]="14"></app-icon>
            <span>Back to GymPlate</span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-auth-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--color-bg-secondary);
      padding: var(--space-6);
    }

    .admin-login-container {
      width: 100%;
      max-width: 420px;
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .admin-card {
      padding: var(--space-8);
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }

    /* Brand & Header */
    .admin-header {
      margin-bottom: var(--space-6);
    }

    .brand-logo {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: var(--color-text);
      text-decoration: none;
      margin-bottom: var(--space-3);
    }

    .logo-accent {
      color: var(--color-primary);
    }

    .badge-row {
      display: flex;
      justify-content: center;
      margin-bottom: var(--space-3);
    }

    .admin-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 10px;
      background-color: var(--color-primary-light);
      color: var(--color-primary);
      border-radius: var(--radius-full);
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .admin-header h2 {
      font-size: var(--font-size-2xl);
      font-weight: 700;
      color: var(--color-text);
      letter-spacing: -0.015em;
      margin-bottom: var(--space-1);
    }

    .admin-sub {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      line-height: 1.5;
      margin: 0;
    }

    /* Form */
    .admin-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-label {
      font-size: var(--font-size-xs);
      font-weight: 600;
      color: var(--color-text);
      margin-bottom: 6px;
    }

    .forgot-link {
      font-size: var(--font-size-xs);
      color: var(--color-primary);
      text-decoration: none;
      transition: color var(--transition-fast);
    }

    .forgot-link:hover {
      text-decoration: underline;
      color: var(--color-primary-hover);
    }

    .input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 12px;
      pointer-events: none;
      line-height: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .form-control {
      width: 100%;
      padding: 10px 14px;
      font-size: var(--font-size-sm);
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      background-color: var(--color-surface);
      color: var(--color-text);
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
      font-family: inherit;
    }

    .form-control.with-icon {
      padding-left: 38px;
    }

    .form-control.with-action {
      padding-right: 40px;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(45, 90, 61, 0.12);
    }

    .password-toggle {
      position: absolute;
      right: 8px;
      background: none;
      border: none;
      padding: 6px;
      color: var(--color-text-secondary);
      cursor: pointer;
      line-height: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      transition: color var(--transition-fast);
    }

    .password-toggle:hover {
      color: var(--color-text);
    }

    .form-error {
      font-size: var(--font-size-xs);
      color: var(--color-danger);
      margin-top: 4px;
    }

    .submit-btn {
      margin-top: var(--space-2);
      font-weight: 600;
      box-shadow: 0 1px 2px rgba(45, 90, 61, 0.2);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spin-icon {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% {
        transform: rotate(360deg);
      }
    }

    /* Subtle Demo Access Section */
    .demo-access-box {
      margin-top: var(--space-5);
      padding-top: var(--space-4);
      border-top: 1px solid var(--color-border);
    }

    .demo-access-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2);
    }

    .demo-label {
      font-size: var(--font-size-xs);
      font-weight: 600;
      color: var(--color-text-secondary);
    }

    .demo-autofill-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      padding: 5px 12px;
      font-weight: 500;
      color: var(--color-text);
      background-color: var(--color-bg-secondary);
      border: 1px solid var(--color-border);
    }

    .demo-autofill-btn:hover {
      background-color: var(--color-bg-tertiary);
      border-color: #D1D5DB;
      color: var(--color-primary);
    }

    /* Security Notice */
    .security-notice {
      margin-top: var(--space-4);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 0.72rem;
      color: var(--color-text-tertiary);
      text-align: center;
      line-height: 1.4;
    }

    /* Navigation Back */
    .nav-back {
      padding: 0 var(--space-2);
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: var(--font-size-xs);
      font-weight: 500;
      color: var(--color-text-secondary);
      text-decoration: none;
      transition: color var(--transition-fast);
    }

    .back-link:hover {
      color: var(--color-primary);
      text-decoration: underline;
    }

    /* Alert */
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
      background-color: #FEF2F2;
      color: #991B1B;
      border: 1px solid #FCA5A5;
    }

    @media (max-width: 480px) {
      .admin-card {
        padding: var(--space-6);
      }
      .demo-access-inner {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-2);
      }
      .demo-autofill-btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class AdminLoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  showPassword = false;
  isLoading = false;
  submittedAttempt = false;
  errorMessage = '';

  fillAdminCredentials(): void {
    this.email = 'admin@gymplate.com';
    this.password = 'Admin123!';
    this.errorMessage = '';
    this.submittedAttempt = false;
  }

  onSubmit(): void {
    this.submittedAttempt = true;
    this.errorMessage = '';

    if (!this.email || !this.password) {
      return;
    }

    this.isLoading = true;

    setTimeout(() => {
      const res = this.authService.adminLogin(this.email, this.password);
      this.isLoading = false;

      if (res.success && res.user) {
        this.router.navigate(['/admin']);
      } else {
        this.errorMessage = res.message || 'Invalid administrator credentials.';
      }
    }, 400);
  }
}
