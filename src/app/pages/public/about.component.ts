import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PublicNavComponent } from '../../shared/components/public-nav.component';
import { PublicFooterComponent } from '../../shared/components/public-footer.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink, PublicNavComponent, PublicFooterComponent, IconComponent],
  template: `
    <app-public-nav></app-public-nav>

    <main class="page-content about-page">
      <div class="container">
        <!-- Hero Header -->
        <div class="about-hero text-center">
          <span class="section-tag">About GymPlate</span>
          <h1>Precision Nutrition for Fitness Goals</h1>
          <p class="about-lead">
            GymPlate is a commercial web ordering platform engineered specifically for athletes, gym-goers, and health-minded individuals who treat their meals as workout fuel.
          </p>
        </div>

        <!-- Mission Cards -->
        <div class="grid-3 mission-grid">
          <div class="card mission-card">
            <div class="mission-icon">
              <app-icon name="target" [size]="24" color="var(--color-primary)"></app-icon>
            </div>
            <h3>Macro Transparency</h3>
            <p>
              Ordering takeout shouldn't derail your diet. Every single product lists exact calories, protein, carbs, and fat per designated serving size.
            </p>
          </div>

          <div class="card mission-card">
            <div class="mission-icon">
              <app-icon name="shield" [size]="24" color="var(--color-primary)"></app-icon>
            </div>
            <h3>Verified Kitchens</h3>
            <p>
              We don't allow unvetted sellers. System administrators review government IDs, business permits, and kitchen credentials before approving sellers to publish menus.
            </p>
          </div>

          <div class="card mission-card">
            <div class="mission-icon">
              <app-icon name="activity" [size]="24" color="var(--color-primary)"></app-icon>
            </div>
            <h3>Order-Based Nutrition Log</h3>
            <p>
              Your Customer account automatically aggregates the macros from every meal you order on GymPlate, giving you a tangible nutrition summary for any selected timeframe.
            </p>
          </div>
        </div>

        <!-- Ecosystem / 3 Connected Roles -->
        <div class="roles-section">
          <div class="section-header text-center">
            <span class="section-tag">Platform Architecture</span>
            <h2>Three Connected Roles in One Unified Ecosystem</h2>
            <p>GymPlate connects customers, commercial food kitchens, and compliance administrators in real time.</p>
          </div>

          <div class="roles-grid">
            <div class="role-box card">
              <div class="role-badge customer-badge">
                <app-icon name="user" [size]="16"></app-icon>
                <span>Customer</span>
              </div>
              <h3>Macro-Driven Ordering</h3>
              <ul class="role-points">
                <li>Search meals by strict protein & calorie targets</li>
                <li>Single-seller carts with clear fulfillment options</li>
                <li>Live order status tracking & itemized receipts</li>
                <li>Cumulative macro summaries from GymPlate orders</li>
              </ul>
            </div>

            <div class="role-box card">
              <div class="role-badge seller-badge">
                <app-icon name="store" [size]="16"></app-icon>
                <span>Seller</span>
              </div>
              <h3>Kitchen Operations</h3>
              <ul class="role-points">
                <li>Multi-step verified commercial registration</li>
                <li>Product & macro management with stock controls</li>
                <li>Order lifecycle updates (Pending to Delivered)</li>
                <li>Sales reporting & customer review analytics</li>
              </ul>
            </div>

            <div class="role-box card">
              <div class="role-badge admin-badge">
                <app-icon name="shield" [size]="16"></app-icon>
                <span>Administrator</span>
              </div>
              <h3>Governance & Compliance</h3>
              <ul class="role-points">
                <li>Review applicant IDs and commercial permits</li>
                <li>Moderate menu items and disable infractions</li>
                <li>Audit activity logs for platform security</li>
                <li>Oversee gross platform order metrics</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Transparency & Medical Disclaimer -->
        <div class="disclaimer-card card">
          <div class="flex items-start gap-4">
            <app-icon name="alert-triangle" [size]="28" color="var(--color-warning)"></app-icon>
            <div>
              <h4>Important Nutritional Information Disclaimer</h4>
              <p>
                Nutritional values displayed on GymPlate (calories, protein, carbohydrates, fats) are provided directly by registered sellers and calculated based on their recipes and serving portions. These figures are informational estimates and are not intended as medical, diagnostic, or clinical nutrition advice. If you have severe food allergies or medical dietary restrictions, please contact the kitchen directly.
              </p>
            </div>
          </div>
        </div>

        <!-- Call to Action Banner -->
        <div class="about-cta-banner card text-center">
          <h2>Ready to Take Control of Your Diet?</h2>
          <p>Join thousands of athletes who order with nutritional confidence.</p>
          <div class="flex justify-center gap-4 flex-wrap mt-4">
            <a routerLink="/explore" class="btn btn-primary btn-lg">Explore Meals</a>
            <a routerLink="/auth/seller-register" class="btn btn-secondary btn-lg">Register Kitchen</a>
          </div>
        </div>
      </div>
    </main>

    <app-public-footer></app-public-footer>
  `,
  styles: [`
    .about-page {
      background: var(--color-bg-secondary);
      padding-bottom: var(--space-20);
    }
    .about-hero {
      max-width: 720px;
      margin: 0 auto var(--space-16);
      padding-top: var(--space-8);
    }
    .about-hero h1 {
      font-size: 2.75rem;
      margin-bottom: var(--space-4);
    }
    .about-lead {
      font-size: var(--font-size-lg);
      line-height: 1.6;
      color: var(--color-text-secondary);
    }

    .mission-grid {
      gap: var(--space-8);
      margin-bottom: var(--space-20);
    }
    .mission-card {
      padding: var(--space-8);
      border: 1px solid var(--color-border);
    }
    .mission-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      background: var(--color-primary-light);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-4);
    }
    .mission-card h3 {
      font-size: var(--font-size-lg);
      margin-bottom: var(--space-2);
    }
    .mission-card p {
      font-size: var(--font-size-sm);
      line-height: 1.6;
    }

    .roles-section {
      margin-bottom: var(--space-20);
    }
    .roles-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-8);
    }
    .role-box {
      padding: var(--space-8);
      border: 1px solid var(--color-border);
    }
    .role-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 3px 10px;
      border-radius: var(--radius-full);
      margin-bottom: var(--space-4);
    }
    .customer-badge { background: var(--color-primary-light); color: var(--color-primary); }
    .seller-badge { background: #FEF3C7; color: #92400E; }
    .admin-badge { background: #E0E7FF; color: #3730A3; }
    .role-box h3 {
      font-size: var(--font-size-lg);
      margin-bottom: var(--space-4);
    }
    .role-points {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    .role-points li {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      position: relative;
      padding-left: 14px;
      line-height: 1.5;
    }
    .role-points li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: var(--color-primary);
      font-weight: bold;
    }

    .disclaimer-card {
      background: #FFFBEB;
      border: 1px solid #FCD34D;
      padding: var(--space-6);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-16);
    }
    .disclaimer-card h4 {
      font-size: var(--font-size-sm);
      font-weight: 700;
      color: #92400E;
      margin-bottom: 4px;
    }
    .disclaimer-card p {
      font-size: var(--font-size-xs);
      color: #78350F;
      line-height: 1.6;
    }

    .about-cta-banner {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      padding: var(--space-12);
      border-radius: var(--radius-lg);
    }
    .about-cta-banner h2 {
      font-size: 2rem;
      margin-bottom: var(--space-2);
    }

    @media (max-width: 900px) {
      .roles-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AboutComponent {}
