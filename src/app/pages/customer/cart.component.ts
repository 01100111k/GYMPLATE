import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { CustomerNavComponent } from '../../shared/components/customer-nav.component';
import { PublicFooterComponent } from '../../shared/components/public-footer.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, CustomerNavComponent, PublicFooterComponent, IconComponent],
  template: `
    <app-customer-nav></app-customer-nav>

    <main class="page-content cart-page">
      <div class="container container-narrow">
        <div class="page-header mb-6">
          <h1>Your Meal Cart</h1>
          <p>Review items, adjust quantities, and proceed to fulfillment selection.</p>
        </div>

        <!-- Single Seller Notice Banner -->
        <div class="seller-policy-notice card" *ngIf="!cartService.isEmpty()">
          <app-icon name="info" [size]="18" color="var(--color-primary)"></app-icon>
          <div class="notice-body">
            <span class="font-semibold text-xs">Ordering From: {{ currentKitchenName() }}</span>
            <p class="text-xs text-secondary mt-1">
              GymPlate bundles items per commercial kitchen partner to ensure fresh, synchronized preparation.
            </p>
          </div>
        </div>

        <!-- Cart Items List -->
        <div class="cart-layout" *ngIf="!cartService.isEmpty()">
          <div class="items-panel">
            <div class="card item-card" *ngFor="let item of cartService.cartItems()">
              <div class="item-img">
                <img [src]="item.product.imageUrl" [alt]="item.product.name" />
              </div>

              <div class="item-details">
                <div class="flex justify-between items-start">
                  <h3 class="item-name">{{ item.product.name }}</h3>
                  <span class="item-subtotal">{{ (item.product.price * item.quantity) | currency:'PHP':'symbol' }}</span>
                </div>

                <div class="macro-snippet">
                  <span>{{ item.product.nutrition.calories * item.quantity }} kcal</span> &bull;
                  <span>{{ item.product.nutrition.protein * item.quantity }}g protein</span> &bull;
                  <span>{{ item.product.nutrition.carbs * item.quantity }}g carbs</span>
                </div>

                <div class="item-controls-row">
                  <div class="qty-stepper">
                    <button class="stepper-btn" (click)="updateQuantity(item.productId, item.quantity - 1)" title="Decrease">
                      <app-icon name="minus" [size]="12"></app-icon>
                    </button>
                    <span class="qty-display">{{ item.quantity }}</span>
                    <button class="stepper-btn" (click)="updateQuantity(item.productId, item.quantity + 1)" [disabled]="item.quantity >= item.product.stock" title="Increase">
                      <app-icon name="plus" [size]="12"></app-icon>
                    </button>
                  </div>

                  <span class="unit-price text-xs text-secondary">&#64; {{ item.product.price | currency:'PHP':'symbol' }} each</span>

                  <button class="btn btn-ghost btn-sm remove-btn text-danger" (click)="removeItem(item.productId)">
                    <app-icon name="trash" [size]="14"></app-icon>
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <!-- Clear Cart Action -->
            <div class="flex justify-between items-center mt-3">
              <a routerLink="/customer/explore" class="btn btn-ghost btn-sm">
                &larr; Add more meals
              </a>
              <button class="btn btn-ghost btn-sm text-secondary" (click)="clearCart()">
                Clear Entire Cart
              </button>
            </div>
          </div>

          <!-- Order Summary Sidebar -->
          <div class="summary-panel">
            <div class="card summary-card">
              <h3>Order Summary</h3>

              <div class="summary-line">
                <span>Subtotal ({{ cartService.itemCount() }} items):</span>
                <span>{{ cartService.subtotal() | currency:'PHP':'symbol' }}</span>
              </div>

              <div class="summary-line">
                <span>Estimated Delivery Fee:</span>
                <span>{{ cartService.deliveryFee() | currency:'PHP':'symbol' }}</span>
              </div>

              <div class="summary-line">
                <span>Platform Service Fee (5%):</span>
                <span>{{ cartService.serviceFee() | currency:'PHP':'symbol' }}</span>
              </div>

              <div class="divider"></div>

              <div class="summary-line total-line">
                <span>Estimated Total:</span>
                <span class="text-primary">{{ cartService.total() | currency:'PHP':'symbol' }}</span>
              </div>

              <!-- Estimated Cumulative Macros -->
              <div class="macro-breakdown-box">
                <span class="macro-box-title">Cart Macro Total</span>
                <div class="macro-mini-grid">
                  <div class="mcell">
                    <strong>{{ totalCartMacros().calories }}</strong>
                    <small>Calories</small>
                  </div>
                  <div class="mcell highlight">
                    <strong>{{ totalCartMacros().protein }}g</strong>
                    <small>Protein</small>
                  </div>
                  <div class="mcell">
                    <strong>{{ totalCartMacros().carbs }}g</strong>
                    <small>Carbs</small>
                  </div>
                  <div class="mcell">
                    <strong>{{ totalCartMacros().fat }}g</strong>
                    <small>Fat</small>
                  </div>
                </div>
              </div>

              <a routerLink="/customer/checkout" class="btn btn-primary btn-lg w-full mt-4">
                Proceed to Checkout
                <app-icon name="arrow-right" [size]="16"></app-icon>
              </a>

              <p class="summary-footer-note">
                Pickup options and delivery address confirmation occur on the next step.
              </p>
            </div>
          </div>
        </div>

        <!-- Empty Cart State -->
        <div class="card empty-cart-state text-center" *ngIf="cartService.isEmpty()">
          <app-icon name="shopping-bag" [size]="56" color="var(--color-text-tertiary)"></app-icon>
          <h2>Your Cart is Empty</h2>
          <p class="text-secondary mt-2">You haven't added any high-protein meals to your cart yet.</p>
          <a routerLink="/customer/explore" class="btn btn-primary btn-lg mt-6">
            <app-icon name="compass" [size]="18"></app-icon>
            Explore Fresh Meals
          </a>
        </div>
      </div>
    </main>

    <app-public-footer></app-public-footer>
  `,
  styles: [`
    .cart-page {
      background: var(--color-bg-secondary);
      min-height: 85vh;
    }
    .seller-policy-notice {
      display: flex;
      gap: var(--space-3);
      align-items: center;
      padding: var(--space-3) var(--space-4);
      background: var(--color-primary-lighter);
      border: 1px solid rgba(45, 90, 61, 0.2);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-6);
    }
    .cart-layout {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: var(--space-8);
      align-items: flex-start;
    }
    .items-panel {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
    .item-card {
      display: flex;
      gap: var(--space-4);
      padding: var(--space-4);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
    }
    .item-img {
      width: 90px;
      height: 90px;
      border-radius: var(--radius);
      overflow: hidden;
      flex-shrink: 0;
      background: var(--color-bg-secondary);
    }
    .item-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .item-details {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .item-name {
      font-size: var(--font-size-sm);
      font-weight: 600;
    }
    .item-subtotal {
      font-size: var(--font-size-sm);
      font-weight: 700;
      color: var(--color-primary);
    }
    .macro-snippet {
      font-size: 11px;
      color: var(--color-text-secondary);
      margin: 2px 0 var(--space-3);
    }
    .item-controls-row {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-top: auto;
    }
    .qty-stepper {
      display: flex;
      align-items: center;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
    }
    .stepper-btn {
      width: 26px;
      height: 26px;
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .qty-display {
      font-size: 12px;
      font-weight: 700;
      min-width: 24px;
      text-align: center;
    }
    .remove-btn {
      margin-left: auto;
    }

    .summary-card {
      padding: var(--space-6);
      border: 1px solid var(--color-border);
    }
    .summary-card h3 {
      font-size: var(--font-size-base);
      margin-bottom: var(--space-4);
      padding-bottom: var(--space-2);
      border-bottom: 1px solid var(--color-border);
    }
    .summary-line {
      display: flex;
      justify-content: space-between;
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin-bottom: var(--space-2);
    }
    .divider {
      height: 1px;
      background: var(--color-border);
      margin: var(--space-3) 0;
    }
    .total-line {
      font-size: var(--font-size-base);
      font-weight: 700;
      color: var(--color-text);
    }
    .macro-breakdown-box {
      background: var(--color-bg-secondary);
      padding: var(--space-3);
      border-radius: var(--radius);
      margin-top: var(--space-4);
    }
    .macro-box-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-text-secondary);
      display: block;
      margin-bottom: 6px;
    }
    .macro-mini-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 4px;
      text-align: center;
    }
    .mcell strong {
      display: block;
      font-size: 11px;
    }
    .mcell.highlight strong {
      color: var(--color-primary);
    }
    .mcell small {
      font-size: 9px;
      color: var(--color-text-secondary);
    }
    .summary-footer-note {
      font-size: 10px;
      color: var(--color-text-tertiary);
      margin-top: var(--space-3);
      text-align: center;
      line-height: 1.4;
    }

    .empty-cart-state {
      padding: var(--space-16) var(--space-6);
      border: 1px solid var(--color-border);
    }

    @media (max-width: 800px) {
      .cart-layout {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CartComponent {
  constructor(public cartService: CartService) {}

  currentKitchenName(): string {
    return this.cartService.currentBusinessName() || 'FitFuel Kitchen';
  }

  updateQuantity(productId: string, quantity: number) {
    this.cartService.updateQuantity(productId, quantity);
  }

  removeItem(productId: string) {
    this.cartService.removeItem(productId);
  }

  clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart();
    }
  }

  totalCartMacros() {
    return this.cartService.cartItems().reduce((acc, item) => ({
      calories: acc.calories + (item.product.nutrition.calories * item.quantity),
      protein: acc.protein + (item.product.nutrition.protein * item.quantity),
      carbs: acc.carbs + (item.product.nutrition.carbs * item.quantity),
      fat: acc.fat + (item.product.nutrition.fat * item.quantity)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }
}
