import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../services/mock-data.service';
import { AuthService } from '../../services/auth.service';
import { Review } from '../../models';
import { SellerSidebarComponent } from '../../shared/components/seller-sidebar.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-seller-reviews',
  standalone: true,
  imports: [CommonModule, SellerSidebarComponent, IconComponent],
  template: `
    <div class="seller-layout">
      <app-seller-sidebar></app-seller-sidebar>

      <main class="seller-main-content">
        <div class="seller-container container-narrow">
          <div class="page-header mb-6">
            <span class="text-xs font-bold uppercase text-primary">Customer Feedback</span>
            <h1>Customer Reviews & Ratings</h1>
            <p class="text-xs text-secondary">Verified feedback submitted by customers after order completion (View-Only).</p>
          </div>

          <!-- Overall Rating Summary Card -->
          <div class="card rating-summary-card mb-6">
            <div class="flex items-center gap-6">
              <div class="big-score text-center">
                <span class="score-num font-bold">{{ averageRating | number:'1.1-1' }}</span>
                <div class="stars-row">
                  <app-icon name="star" [size]="16" color="#F59E0B"></app-icon>
                  <app-icon name="star" [size]="16" color="#F59E0B"></app-icon>
                  <app-icon name="star" [size]="16" color="#F59E0B"></app-icon>
                  <app-icon name="star" [size]="16" color="#F59E0B"></app-icon>
                  <app-icon name="star" [size]="16" color="#F59E0B"></app-icon>
                </div>
                <small class="text-xs text-secondary mt-1 block">Based on {{ reviews.length }} reviews</small>
              </div>
              <div class="flex-1">
                <p class="text-xs text-secondary leading-relaxed">
                  Reviews are strictly submitted by customers who have successfully collected and completed an order with your kitchen. High ratings boost marketplace ranking.
                </p>
              </div>
            </div>
          </div>

          <!-- Reviews List -->
          <div class="reviews-list">
            <div class="card review-card" *ngFor="let r of reviews">
              <div class="review-header">
                <div class="customer-order-info">
                  <strong class="customer-name">{{ r.customerName }}</strong>
                  <span class="meta-dot" aria-hidden="true">&bull;</span>
                  <div class="order-info">
                    <span class="order-label">Ordered:</span>
                    <span class="order-dish">{{ r.productName }}</span>
                  </div>
                </div>

                <div class="review-stars">
                  <span class="star-pill font-bold">{{ r.rating }} &starf;</span>
                </div>
              </div>

              <p class="review-comment">{{ r.comment }}</p>

              <div class="review-footer">
                <span class="review-date">{{ r.createdAt | date:'mediumDate' }}</span>
              </div>
            </div>

            <div class="empty-state card text-center py-8" *ngIf="reviews.length === 0">
              <app-icon name="star" [size]="32" color="var(--color-text-tertiary)"></app-icon>
              <p class="text-xs text-secondary mt-2">No reviews recorded yet for your kitchen.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .seller-layout {
      display: flex;
      min-height: 100vh;
      background: var(--color-bg-secondary);
    }
    .seller-main-content {
      flex: 1;
      margin-left: var(--sidebar-width);
      padding: var(--space-8) var(--space-6);
    }
    .seller-container {
      max-width: var(--container-narrow);
      margin: 0 auto;
    }
    .rating-summary-card {
      padding: var(--space-6);
      border: 1px solid var(--color-border);
      background: white;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
    }
    .score-num {
      font-size: 2.5rem;
      color: var(--color-text);
      display: block;
      line-height: 1;
    }
    .stars-row {
      display: flex;
      gap: 2px;
      justify-content: center;
      margin-top: 4px;
    }

    /* Review Card Layout & Spacing */
    .review-card {
      padding: 16px 20px;
      border: 1px solid var(--color-border);
      background: white;
      border-radius: var(--radius-md);
      margin-bottom: var(--space-3);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: border-color var(--transition-fast);
    }
    .review-card:hover {
      border-color: #CBD5E1;
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    /* Customer Name & Order Info Row with Flex Gap */
    .customer-order-info {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      min-width: 0;
    }

    .customer-name {
      font-size: 13.5px;
      font-weight: 700;
      color: var(--color-text);
      letter-spacing: -0.01em;
      white-space: nowrap;
    }

    .meta-dot {
      color: var(--color-text-tertiary);
      font-size: 12px;
      user-select: none;
    }

    .order-info {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12.5px;
      line-height: 1.4;
    }

    .order-label {
      color: var(--color-text-tertiary);
      font-weight: 500;
    }

    .order-dish {
      color: var(--color-text-secondary);
      font-weight: 600;
      background: var(--color-bg-secondary);
      padding: 2px 8px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-border);
    }

    /* Rating Badge Aligned to Right */
    .review-stars {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      margin-left: auto;
    }

    .star-pill {
      background: #FEF3C7;
      color: #92400E;
      font-size: 11.5px;
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      border: 1px solid #FDE68A;
      line-height: 1;
      display: inline-flex;
      align-items: center;
      gap: 2px;
    }

    .review-comment {
      font-size: 13px;
      color: var(--color-text);
      line-height: 1.55;
      margin: 0;
    }

    .review-footer {
      display: flex;
      align-items: center;
      padding-top: 6px;
      border-top: 1px solid #F1F5F9;
    }

    .review-date {
      font-size: 11.5px;
      color: var(--color-text-tertiary);
      font-weight: 500;
    }

    @media (max-width: 900px) {
      .seller-main-content {
        margin-left: 0;
        padding: var(--space-4);
      }
    }

    @media (max-width: 600px) {
      .rating-summary-card > .flex {
        flex-direction: column;
        text-align: center;
        gap: var(--space-4);
      }
      .review-header {
        align-items: flex-start;
      }
      .customer-order-info {
        gap: 6px;
      }
      .meta-dot {
        display: none;
      }
      .order-info {
        width: 100%;
      }
    }
  `]
})
export class SellerReviewsComponent implements OnInit {
  reviews: Review[] = [];
  averageRating = 5.0;

  constructor(
    private authService: AuthService,
    private mockData: MockDataService
  ) {}

  ngOnInit() {
    const user = this.authService.user();
    if (user) {
      this.reviews = this.mockData.getReviewsBySellerId(user.id);
      if (this.reviews.length > 0) {
        const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
        this.averageRating = sum / this.reviews.length;
      }
    }
  }
}
