import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card card">
        <!-- Brand Header -->
        <div class="auth-header text-center">
          <a routerLink="/" class="auth-logo">
            <app-icon name="utensils" [size]="28" color="var(--color-primary)"></app-icon>
            <span class="logo-text">Gym<span class="logo-accent">Plate</span></span>
          </a>
          <h2>Welcome Back</h2>
          <p class="auth-sub">Sign in to your GymPlate customer or seller account</p>
        </div>

        <!-- Alert messages -->
        <div class="alert alert-danger" *ngIf="errorMessage">
          <app-icon name="alert-circle" [size]="16"></app-icon>
          <span>{{ errorMessage }}</span>
        </div>

        <div class="alert alert-success" *ngIf="successMessage">
          <app-icon name="check-circle" [size]="16"></app-icon>
          <span>{{ successMessage }}</span>
        </div>

        <!-- Login Form -->
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="auth-form">
          <div class="form-group">
            <label class="form-label" for="email">Email Address</label>
            <div class="input-wrap">
              <app-icon name="mail" [size]="16" class="input-icon"></app-icon>
              <input
                id="email"
                type="email"
                name="email"
                class="form-control with-icon"
                placeholder="name@example.com"
                [(ngModel)]="email"
                required
                email
                #emailInput="ngModel"
              />
            </div>
            <div class="form-error" *ngIf="emailInput.invalid && emailInput.touched">
              Please enter a valid email address.
            </div>
          </div>

          <div class="form-group">
            <div class="flex justify-between items-center mb-1">
              <label class="form-label" for="password">Password</label>
              <a routerLink="/auth/forgot-password" class="forgot-link">Forgot password?</a>
            </div>
            <div class="input-wrap">
              <app-icon name="lock" [size]="16" class="input-icon"></app-icon>
              <input
                id="password"
                [type]="showPassword ? 'text' : 'password'"
                name="password"
                class="form-control with-icon with-action"
                placeholder="Enter password"
                [(ngModel)]="password"
                required
                #passwordInput="ngModel"
              />
              <button type="button" class="password-toggle" (click)="showPassword = !showPassword" aria-label="Toggle password visibility">
                <app-icon [name]="showPassword ? 'eye-off' : 'eye'" [size]="16"></app-icon>
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-lg w-full" [disabled]="loginForm.invalid || isLoading">
            <span *ngIf="!isLoading">Sign In</span>
            <span *ngIf="isLoading" class="flex items-center gap-2">
              <span class="loading-spinner"></span>
              Authenticating...
            </span>
          </button>
        </form>

        <!-- Social / Demo Google Option -->
        <div class="social-divider">
          <span>Or continue with</span>
        </div>

        <button type="button" class="btn btn-secondary w-full google-btn" (click)="handleDemoGoogleLogin()">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continue with Google <small class="text-tertiary">(Demo Flow)</small></span>
        </button>

        <!-- Fast Demo Credentials Switcher -->
        <div class="demo-box">
          <div class="demo-box-title">
            <app-icon name="zap" [size]="14" color="var(--color-primary)"></app-icon>
            <strong>One-Click Demo Accounts</strong>
          </div>
          <div class="demo-buttons-grid">
            <button class="btn btn-ghost btn-sm demo-acc-btn" (click)="fillCredentials('customer@gymplate.com', 'Customer123!')">
              <span class="acc-role">Customer</span>
              <span class="acc-name">Alex Rivera</span>
            </button>
            <button class="btn btn-ghost btn-sm demo-acc-btn" (click)="fillCredentials('seller@gymplate.com', 'Seller123!')">
              <span class="acc-role approved">Approved Seller</span>
              <span class="acc-name">Maria Santos</span>
            </button>
            <button class="btn btn-ghost btn-sm demo-acc-btn" (click)="fillCredentials('pending@gymplate.com', 'Pending123!')">
              <span class="acc-role pending">Pending Seller</span>
              <span class="acc-name">David Kim</span>
            </button>
            <button class="btn btn-ghost btn-sm demo-acc-btn" (click)="fillCredentials('rejected@gymplate.com', 'Rejected123!')">
              <span class="acc-role rejected">Rejected Seller</span>
              <span class="acc-name">Sarah Johnson</span>
            </button>
          </div>
        </div>

        <!-- Auth Footer Links -->
        <div class="auth-links text-center">
          <p>Don't have an account? <a routerLink="/auth/register" class="font-medium">Sign up as customer</a></p>
          <p class="mt-1">Want to sell healthy food? <a routerLink="/auth/seller-register" class="font-medium">Register kitchen</a></p>
          <div class="admin-portal-link mt-3 pt-3">
            <a routerLink="/auth/admin-login">System Administrator Portal &rarr;</a>
          </div>
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
    .auth-header h2 {
      font-size: var(--font-size-xl);
      margin-bottom: 4px;
    }
    .auth-sub {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
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
      border: 1px solid rgba(220, 53, 69, 0.2);
    }
    .alert-success {
      background: var(--color-success-bg);
      color: #166534;
      border: 1px solid rgba(40, 167, 69, 0.2);
    }

    .input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-icon {
      position: absolute;
      left: 12px;
      color: var(--color-text-tertiary);
      pointer-events: none;
    }
    .with-icon {
      padding-left: 36px;
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
    .forgot-link {
      font-size: var(--font-size-xs);
      color: var(--color-primary);
    }

    .w-full {
      width: 100%;
    }

    .social-divider {
      display: flex;
      align-items: center;
      text-align: center;
      margin: var(--space-5) 0;
      color: var(--color-text-tertiary);
      font-size: var(--font-size-xs);
    }
    .social-divider::before, .social-divider::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid var(--color-border);
    }
    .social-divider span {
      padding: 0 var(--space-3);
    }

    .google-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      font-weight: 500;
      background: white;
    }

    .demo-box {
      margin-top: var(--space-6);
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      padding: var(--space-3);
    }
    .demo-box-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: var(--color-primary);
      margin-bottom: 8px;
    }
    .demo-buttons-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }
    .demo-acc-btn {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 6px 8px;
      border: 1px solid var(--color-border);
      background: white;
      text-align: left;
      height: auto;
      border-radius: var(--radius-sm);
    }
    .demo-acc-btn:hover {
      border-color: var(--color-primary);
      background: var(--color-primary-lighter);
    }
    .acc-role {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--color-text-secondary);
    }
    .acc-role.approved { color: var(--color-success); }
    .acc-role.pending { color: var(--color-warning); }
    .acc-role.rejected { color: var(--color-danger); }
    .acc-name {
      font-size: 11px;
      font-weight: 600;
      color: var(--color-text);
    }

    .auth-links {
      margin-top: var(--space-6);
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }
    .admin-portal-link {
      border-top: 1px solid var(--color-border);
    }
    .admin-portal-link a {
      color: var(--color-text-tertiary);
      font-weight: 500;
    }
    .admin-portal-link a:hover {
      color: var(--color-primary);
    }
  `]
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  returnUrl = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
  }

  fillCredentials(e: string, p: string) {
    this.email = e;
    this.password = p;
    this.errorMessage = '';
  }

  onSubmit() {
    this.errorMessage = '';
    this.isLoading = true;

    setTimeout(() => {
      const res = this.authService.login(this.email, this.password);
      this.isLoading = false;

      if (res.success && res.user) {
        if (this.returnUrl) {
          this.router.navigateByUrl(this.returnUrl);
          return;
        }

        if (res.user.role === 'customer') {
          this.router.navigate(['/customer']);
        } else if (res.user.role === 'seller') {
          this.router.navigate(['/seller']);
        } else if (res.user.role === 'admin') {
          this.router.navigate(['/admin']);
        }
      } else {
        this.errorMessage = res.message;
      }
    }, 400);
  }

  handleDemoGoogleLogin() {
    this.fillCredentials('customer@gymplate.com', 'Customer123!');
    this.onSubmit();
  }
}
