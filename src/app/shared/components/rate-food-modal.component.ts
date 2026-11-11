import { Component, Input, Output, EventEmitter, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Order, OrderItem, Review } from '../../models';
import { MockDataService } from '../../services/mock-data.service';
import { AuthService } from '../../services/auth.service';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-rate-food-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="onBackdropClick($event)">
      <div class="modal-content rate-modal-card" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-title">
            <app-icon name="star" [size]="20" color="var(--color-primary)"></app-icon>
            <h3>Rate Your Meal</h3>
          </div>
          <button class="modal-close" (click)="close()" aria-label="Close modal">
            <app-icon name="x" [size]="20"></app-icon>
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <!-- Food preview item snippet -->
          <div class="food-preview-box mb-5" *ngIf="item">
            <div class="food-img-wrap">
              <img [src]="item.productImageUrl" [alt]="item.productName" />
            </div>
            <div class="food-preview-info">
              <h4 class="food-name">{{ item.productName }}</h4>
              <p class="food-meta">
                <span>{{ order?.businessName }}</span> &bull;
                <span>Order #{{ order?.orderNumber }}</span>
              </p>
              <div class="food-macros">
                <span>{{ item.nutrition.calories }} kcal</span> &bull;
                <span>{{ item.nutrition.protein }}g protein</span>
              </div>
            </div>
          </div>

          <!-- Rating Stars Section -->
          <div class="rating-selector-area mb-5 text-center">
            <span class="rating-label-head">Select Your Food Rating</span>
            <div class="stars-row" (mouseleave)="hoverRating = 0">
              <button
                type="button"
                class="star-btn"
                *ngFor="let star of [1, 2, 3, 4, 5]"
                (mouseenter)="hoverRating = star"
                (click)="selectedRating = star"
                [class.filled]="(hoverRating || selectedRating) >= star"
                [attr.aria-label]="'Rate ' + star + ' stars'"
              >
                &starf;
              </button>
            </div>
            <div class="rating-feedback-text">
              <span class="rating-badge" *ngIf="activeRating > 0">
                {{ getRatingLabel(activeRating) }}
              </span>
              <span class="text-xs text-secondary" *ngIf="activeRating === 0">
                Click a star to rate from 1 (Very Poor) to 5 (Excellent)
              </span>
            </div>
          </div>

          <!-- Written Review Textarea -->
          <div class="form-group mb-4">
            <label class="form-label" for="reviewComment">
              Written Review <span class="text-secondary text-xs">(Verified Customer Feedback)</span>
            </label>
            <textarea
              id="reviewComment"
              class="form-control review-textarea"
              rows="4"
              [(ngModel)]="comment"
              placeholder="Tell others about the food quality, taste, freshness, portion size, and accuracy of nutrition macros..."
            ></textarea>
            <div class="flex justify-between text-xs text-secondary mt-1">
              <span>Help others on their fitness journey.</span>
              <span>{{ comment.length }} characters</span>
            </div>
          </div>

          <!-- Validation Alert if Any -->
          <div class="alert alert-danger mb-4" *ngIf="errorMessage">
            <app-icon name="alert-circle" [size]="16"></app-icon>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Success Alert if Submitted -->
          <div class="alert alert-success mb-4" *ngIf="successMessage">
            <app-icon name="check-circle" [size]="16"></app-icon>
            <span>{{ successMessage }}</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="close()" [disabled]="isSubmitting">
            Cancel
          </button>
          <button
            class="btn btn-primary"
            (click)="submitReview()"
            [disabled]="isSubmitting || selectedRating === 0"
          >
            <app-icon name="check" [size]="16" *ngIf="!isSubmitting"></app-icon>
            <span *ngIf="!isSubmitting">Submit Review</span>
            <span *ngIf="isSubmitting">Saving Review...</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .rate-modal-card {
      max-width: 520px;
    }
    .header-title {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    .food-preview-box {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 14px;
      background: var(--color-bg-secondary);
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
    }
    .food-img-wrap {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      flex-shrink: 0;
      background: #E2E8F0;
    }
    .food-img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .food-preview-info {
      flex: 1;
      min-width: 0;
    }
    .food-name {
      font-size: 14px;
      font-weight: 700;
      color: var(--color-text);
      margin: 0 0 2px 0;
    }
    .food-meta {
      font-size: 11.5px;
      color: var(--color-text-secondary);
      margin: 0 0 4px 0;
    }
    .food-macros {
      font-size: 11px;
      font-weight: 600;
      color: var(--color-primary);
    }

    .rating-selector-area {
      background: white;
      padding: 14px;
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-md);
    }
    .rating-label-head {
      display: block;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-text-secondary);
      margin-bottom: 6px;
    }
    .stars-row {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin: 8px 0;
    }
    .star-btn {
      background: none;
      border: none;
      font-size: 34px;
      line-height: 1;
      color: #D1D5DB;
      cursor: pointer;
      padding: 2px 4px;
      transition: transform 0.15s ease, color 0.15s ease;
      user-select: none;
    }
    .star-btn:hover {
      transform: scale(1.15);
    }
    .star-btn.filled {
      color: #F59E0B;
    }
    .rating-feedback-text {
      min-height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .rating-badge {
      display: inline-block;
      font-size: 12px;
      font-weight: 700;
      color: #92400E;
      background: #FEF3C7;
      padding: 3px 12px;
      border-radius: 9999px;
      border: 1px solid #FDE68A;
    }

    .review-textarea {
      resize: vertical;
      min-height: 95px;
      font-size: 13px;
      line-height: 1.5;
    }
  `]
})
export class RateFoodModalComponent {
  private mockData = inject(MockDataService);
  private authService = inject(AuthService);

  @Input() isOpen = false;
  @Input() order: Order | null | undefined = null;
  @Input() item: OrderItem | null | undefined = null;

  @Output() closeEvent = new EventEmitter<void>();
  @Output() reviewSubmitted = new EventEmitter<Review>();

  selectedRating = 0;
  hoverRating = 0;
  comment = '';
  errorMessage = '';
  successMessage = '';
  isSubmitting = false;

  get activeRating(): number {
    return this.hoverRating || this.selectedRating;
  }

  getRatingLabel(rating: number): string {
    switch (rating) {
      case 1: return '1 - Very Poor';
      case 2: return '2 - Poor';
      case 3: return '3 - Average';
      case 4: return '4 - Good';
      case 5: return '5 - Excellent';
      default: return '';
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isOpen) {
      this.close();
    }
  }

  onBackdropClick(event: MouseEvent) {
    this.close();
  }

  close() {
    this.resetForm();
    this.closeEvent.emit();
  }

  resetForm() {
    this.selectedRating = 0;
    this.hoverRating = 0;
    this.comment = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.isSubmitting = false;
  }

  submitReview() {
    this.errorMessage = '';
    if (!this.order || !this.item) {
      this.errorMessage = 'Missing order or item details.';
      return;
    }

    if (this.selectedRating === 0) {
      this.errorMessage = 'Please choose a rating between 1 and 5 stars.';
      return;
    }

    if (!this.comment || this.comment.trim().length < 5) {
      this.errorMessage = 'Please enter a review comment (minimum 5 characters).';
      return;
    }

    const user = this.authService.user();
    if (!user) {
      this.errorMessage = 'Please log in to submit a review.';
      return;
    }

    // Check duplicate
    if (this.mockData.hasReviewedItem(this.order.id, this.item.productId)) {
      this.errorMessage = 'You have already reviewed this meal for this order.';
      return;
    }

    this.isSubmitting = true;

    const review: Review = {
      id: 'rev-' + Date.now(),
      orderId: this.order.id,
      customerId: user.id,
      customerName: `${user.firstName} ${user.lastName}`,
      sellerId: this.order.sellerId,
      productId: this.item.productId,
      productName: this.item.productName,
      productImageUrl: this.item.productImageUrl,
      rating: this.selectedRating,
      ratingLabel: this.getRatingLabel(this.selectedRating).split(' - ')[1],
      comment: this.comment.trim(),
      createdAt: new Date()
    };

    setTimeout(() => {
      this.mockData.addReview(review);
      this.isSubmitting = false;
      this.successMessage = 'Your review has been verified and published! Thank you.';
      this.reviewSubmitted.emit(review);

      setTimeout(() => {
        this.close();
      }, 1000);
    }, 400);
  }
}
