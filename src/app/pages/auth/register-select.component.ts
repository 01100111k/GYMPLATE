import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PublicNavComponent } from '../../shared/components/public-nav.component';
import { PublicFooterComponent } from '../../shared/components/public-footer.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-register-select',
  standalone: true,
  imports: [CommonModule, RouterLink, PublicNavComponent, PublicFooterComponent, IconComponent],
  template: `
    <app-public-nav></app-public-nav>

    <main class="page-content register-select-page">
      <div class="container container-narrow">
        <!-- Header -->
        <div class="select-header text-center">
          <div class="brand-badge">
            <app-icon name="utensils" [size]="16" color="var(--color-primary)"></app-icon>
            <span>GymPlate Membership</span>
          </div>
          <h1>Create Your Account</h1>
          <p class="select-sub">
            Join the nutrition-first food ordering ecosystem. Choose how you would like to participate.
          </p>
        </div>

        <!-- Choice Cards Grid -->
        <div class="cards-grid">
          <!-- Customer Card -->
          <div class="choice-card card">
            <div class="card-icon-wrap customer-icon-wrap">
              <app-icon name="user" [size]="28" color="var(--color-primary)"></app-icon>
            </div>
            <span class="role-chip chip-customer">For Fitness Enthusiasts</span>
            <h2>Customer Registration</h2>
            <p class="choice-desc">
              Discover and order chef-prepared meals calculated for your specific protein, calorie, and macro targets. Eat better with zero nutritional guesswork.
            </p>

            <ul class="choice-features">
              <li>
                <app-icon name="check-circle" [size]="16" color="var(--color-primary)"></app-icon>
                <span>Filter meals by high-protein (25g+), low-calorie, and custom macro ranges</span>
              </li>
              <li>
                <app-icon name="check-circle" [size]="16" color="var(--color-primary)"></app-icon>
                <span>Order from verified commercial kitchens with strict macro transparency</span>
              </li>
              <li>
                <app-icon name="check-circle" [size]="16" color="var(--color-primary)"></app-icon>
                <span>Automatically log cumulative calories and macros in your Nutrition Summary</span>
              </li>
              <li>
                <app-icon name="check-circle" [size]="16" color="var(--color-primary)"></app-icon>
                <span>Real-time order tracking, single-seller freshness carts, and digital receipts</span>
              </li>
            </ul>

            <div class="choice-action">
              <a routerLink="/auth/customer-register" class="btn btn-primary btn-lg w-full">
                <span>Register as Customer</span>
                <app-icon name="arrow-right" [size]="16"></app-icon>
              </a>
            </div>
          </div>

          <!-- Seller Card -->
          <div class="choice-card card">
            <div class="card-icon-wrap seller-icon-wrap">
              <app-icon name="store" [size]="28" color="#B45309"></app-icon>
            </div>
            <span class="role-chip chip-seller">For Food Businesses & Kitchens</span>
            <h2>Seller Registration</h2>
            <p class="choice-desc">
              Partner your commercial kitchen, fitness catering, or meal prep business with GymPlate. Reach health-focused diners and manage verified menus.
            </p>

            <ul class="choice-features">
              <li>
                <app-icon name="check-circle" [size]="16" color="#B45309"></app-icon>
                <span>Guided 5-step onboarding wizard with business permit and sanitation review</span>
              </li>
              <li>
                <app-icon name="check-circle" [size]="16" color="#B45309"></app-icon>
                <span>Nutritional product management with designated serving sizes and macro logs</span>
              </li>
              <li>
                <app-icon name="check-circle" [size]="16" color="#B45309"></app-icon>
                <span>Live order fulfillment pipeline (Pending &rarr; Kitchen Prep &rarr; Delivered)</span>
              </li>
              <li>
                <app-icon name="check-circle" [size]="16" color="#B45309"></app-icon>
                <span>Real-time inventory deduction, low-stock warnings, and sales analytics</span>
              </li>
            </ul>

            <div class="choice-action">
              <a routerLink="/auth/seller-register" class="btn btn-outline btn-lg w-full seller-btn">
                <span>Apply as Seller Partner</span>
                <app-icon name="arrow-right" [size]="16"></app-icon>
              </a>
            </div>
          </div>
        </div>

        <!-- Footer Callout -->
        <div class="existing-account text-center">
          <p>
            Already have an account?
            <a routerLink="/auth/login" class="signin-link font-medium">Sign in to your account</a>
          </p>
        </div>
      </div>
    </main>

    <app-public-footer></app-public-footer>
  `,
  styles: [`
    .register-select-page {
      padding: var(--space-12) 0 var(--space-16);
      background-color: var(--color-bg-secondary);
      min-height: calc(100vh - var(--nav-height));
    }
    .select-header {
      margin-bottom: var(--space-10);
    }
    .brand-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-1) var(--space-3);
      background-color: var(--color-primary-light);
      color: var(--color-primary);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: 600;
      margin-bottom: var(--space-3);
    }
    .select-header h1 {
      font-size: var(--font-size-4xl);
      color: var(--color-text);
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: var(--space-2);
    }
    .select-sub {
      color: var(--color-text-secondary);
      font-size: var(--font-size-base);
      max-width: 540px;
      margin: 0 auto;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-8);
      margin-bottom: var(--space-10);
    }
    .choice-card {
      padding: var(--space-8);
      display: flex;
      flex-direction: column;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      background: var(--color-surface);
      transition: transform var(--transition), box-shadow var(--transition), border-color var(--transition);
      position: relative;
    }
    .choice-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
      border-color: var(--color-primary);
    }
    .card-icon-wrap {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-4);
    }
    .customer-icon-wrap {
      background-color: var(--color-primary-light);
    }
    .seller-icon-wrap {
      background-color: #FEF3C7;
    }
    .role-chip {
      display: inline-block;
      align-self: flex-start;
      font-size: var(--font-size-xs);
      font-weight: 600;
      padding: 3px 10px;
      border-radius: var(--radius-full);
      margin-bottom: var(--space-3);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .chip-customer {
      background-color: var(--color-primary-lighter);
      color: var(--color-primary);
    }
    .chip-seller {
      background-color: #FEF3C7;
      color: #92400E;
    }
    .choice-card h2 {
      font-size: var(--font-size-2xl);
      font-weight: 700;
      margin-bottom: var(--space-2);
      color: var(--color-text);
    }
    .choice-desc {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      line-height: 1.6;
      margin-bottom: var(--space-6);
    }
    .choice-features {
      list-style: none;
      padding: 0;
      margin: 0 0 var(--space-8) 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      flex: 1;
    }
    .choice-features li {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      font-size: var(--font-size-sm);
      color: var(--color-text);
      line-height: 1.5;
    }
    .choice-features li app-icon {
      margin-top: 2px;
      flex-shrink: 0;
    }
    .choice-action {
      margin-top: auto;
    }
    .choice-action .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
    }
    .seller-btn {
      border-color: #D97706;
      color: #92400E;
    }
    .seller-btn:hover {
      background-color: #FEF3C7;
      border-color: #B45309;
      color: #78350F;
    }
    .existing-account {
      padding: var(--space-4);
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
    }
    .signin-link {
      color: var(--color-primary);
      text-decoration: none;
      margin-left: var(--space-1);
    }
    .signin-link:hover {
      text-decoration: underline;
    }
    @media (max-width: 840px) {
      .cards-grid {
        grid-template-columns: 1fr;
        gap: var(--space-6);
      }
      .choice-card {
        padding: var(--space-6);
      }
    }
  `]
})
export class RegisterSelectComponent {}
