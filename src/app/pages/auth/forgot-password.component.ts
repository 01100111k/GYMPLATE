import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-forgot-password',
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
          <h2>Reset Password</h2>
          <p class="auth-sub">Enter your email and we'll dispatch a simulated recovery link</p>
        </div>

        <div class="alert alert-success" *ngIf="isSubmitted">
          <app-icon name="check-circle" [size]="16"></app-icon>
          <span>If an account exists for {{ email }}, a password reset token has been dispatched.</span>
        </div>

        <form *ngIf="!isSubmitted" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label class="form-label" for="resetEmail">Registered Account Email</label>
            <input
              id="resetEmail"
              type="email"
              class="form-control"
              placeholder="name@example.com"
              [(ngModel)]="email"
              name="email"
              required
            />
          </div>

          <button type="submit" class="btn btn-primary btn-lg w-full" [disabled]="!email || isLoading">
            <span *ngIf="!isLoading">Send Recovery Email</span>
            <span *ngIf="isLoading" class="flex items-center justify-center gap-2">
              <span class="loading-spinner"></span> Sending...
            </span>
          </button>
        </form>

        <div class="auth-links text-center mt-6">
          <a routerLink="/auth/login">&larr; Back to Sign In</a>
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
      max-width: 440px;
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
    .alert {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: 12px 14px;
      border-radius: var(--radius);
      font-size: var(--font-size-xs);
      margin-bottom: var(--space-4);
      background: var(--color-success-bg);
      color: #166534;
      border: 1px solid rgba(40, 167, 69, 0.2);
    }
  `]
})
export class ForgotPasswordComponent {
  email = '';
  isLoading = false;
  isSubmitted = false;

  onSubmit() {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.isSubmitted = true;
    }, 500);
  }
}
