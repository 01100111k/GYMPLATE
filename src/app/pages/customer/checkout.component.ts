import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { FulfillmentType, PaymentMethod } from '../../models';
import { CustomerNavComponent } from '../../shared/components/customer-nav.component';
import { PublicFooterComponent } from '../../shared/components/public-footer.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CustomerNavComponent, PublicFooterComponent, IconComponent],
  template: `
    <app-customer-nav></app-customer-nav>

    <main class="page-content checkout-page">
      <div class="container container-narrow">
        <div class="page-header mb-6">
          <div class="flex items-center gap-2 mb-1">
            <a routerLink="/customer/cart" class="text-xs text-secondary">&larr; Return to Cart</a>
          </div>
          <h1>Fulfillment & Checkout</h1>
          <p>Complete your delivery or pickup details to place your order with {{ kitchenName() }}.</p>
        </div>

        <div class="alert alert-danger" *ngIf="errorMessage">
          <app-icon name="alert-circle" [size]="16"></app-icon>
          <span>{{ errorMessage }}</span>
        </div>

        <div class="checkout-grid" *ngIf="!cartService.isEmpty()">
          <!-- Form Steps Column -->
          <div class="checkout-forms">
            <!-- Step 1: Fulfillment Type -->
            <div class="card checkout-card">
              <div class="card-step-header">
                <span class="step-badge">1</span>
                <h3>Choose Fulfillment Method</h3>
              </div>

              <div class="fulfillment-options-grid">
                <label class="fulfillment-box" [class.selected]="fulfillmentType === 'pickup'">
                  <input
                    type="radio"
                    name="fulfillment"
                    value="pickup"
                    [(ngModel)]="fulfillmentType"
                    (ngModelChange)="onFulfillmentChange()"
                  />
                  <div class="f-icon">
                    <app-icon name="store" [size]="20"></app-icon>
                  </div>
                  <div class="f-info">
                    <strong>Self Pickup</strong>
                    <span>Direct pickup at kitchen counter</span>
                    <small class="text-success font-semibold mt-1">Free &bull; Ready in ~25 mins</small>
                  </div>
                </label>

                <label class="fulfillment-box" [class.selected]="fulfillmentType === 'delivery'">
                  <input
                    type="radio"
                    name="fulfillment"
                    value="delivery"
                    [(ngModel)]="fulfillmentType"
                    (ngModelChange)="onFulfillmentChange()"
                  />
                  <div class="f-icon">
                    <app-icon name="truck" [size]="20"></app-icon>
                  </div>
                  <div class="f-info">
                    <strong>Contact Delivery</strong>
                    <span>Direct to home, gym, or office</span>
                    <small class="text-secondary mt-1">₱49.00 flat delivery fee</small>
                  </div>
                </label>
              </div>

              <!-- Delivery Address Input if Delivery chosen -->
              <div class="delivery-address-section mt-4" *ngIf="fulfillmentType === 'delivery'">
                <div class="form-group">
                  <label class="form-label" for="address">Delivery Street Address</label>
                  <input
                    id="address"
                    type="text"
                    class="form-control"
                    placeholder="Enter street, apartment, floor..."
                    [(ngModel)]="deliveryAddress"
                    required
                  />
                </div>
                <div class="form-group">
                  <label class="form-label" for="phone">Delivery Contact Phone</label>
                  <input
                    id="phone"
                    type="tel"
                    class="form-control"
                    placeholder="(555) 000-0000"
                    [(ngModel)]="contactPhone"
                    required
                  />
                </div>
              </div>
            </div>

            <!-- Step 2: Payment Method (Demo Cash Only) -->
            <div class="card checkout-card mt-4">
              <div class="card-step-header">
                <span class="step-badge">2</span>
                <h3>Payment Method</h3>
              </div>

              <div class="demo-payment-warning">
                <app-icon name="info" [size]="16" color="var(--color-primary)"></app-icon>
                <span>Demonstration Mode: GymPlate never stores or charges credit cards or bank accounts. Payment is transacted directly upon physical pickup or delivery handover.</span>
              </div>

              <div class="payment-options-grid mt-3">
                <label class="payment-box" [class.selected]="paymentMethod === 'cash_on_pickup'" *ngIf="fulfillmentType === 'pickup'">
                  <input
                    type="radio"
                    name="payment"
                    value="cash_on_pickup"
                    [(ngModel)]="paymentMethod"
                  />
                  <app-icon name="dollar-sign" [size]="20"></app-icon>
                  <div>
                    <strong>Cash on Pickup</strong>
                    <span>Pay in cash at the store counter upon meal collection</span>
                  </div>
                </label>

                <label class="payment-box" [class.selected]="paymentMethod === 'cash_on_delivery'" *ngIf="fulfillmentType === 'delivery'">
                  <input
                    type="radio"
                    name="payment"
                    value="cash_on_delivery"
                    [(ngModel)]="paymentMethod"
                  />
                  <app-icon name="dollar-sign" [size]="20"></app-icon>
                  <div>
                    <strong>Cash on Delivery (COD)</strong>
                    <span>Pay courier upon arrival with exact cash</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Step 3: Special Kitchen Instructions -->
            <div class="card checkout-card mt-4">
              <div class="card-step-header">
                <span class="step-badge">3</span>
                <h3>Special Instructions & Dietary Notes</h3>
              </div>
              <textarea
                class="form-control"
                rows="2"
                placeholder="Any special requests for the kitchen or delivery courier? (e.g., leave at front desk, call upon arrival)..."
                [(ngModel)]="specialInstructions"
              ></textarea>
            </div>
          </div>

          <!-- Order Summary Column -->
          <div class="checkout-summary">
            <div class="card summary-box">
              <h3>Final Order Review</h3>

              <div class="summary-items-list">
                <div class="s-item" *ngFor="let item of cartService.cartItems()">
                  <div class="s-qty font-medium">{{ item.quantity }}x</div>
                  <div class="s-name">
                    <span>{{ item.product.name }}</span>
                    <small class="text-tertiary block">{{ item.product.nutrition.calories * item.quantity }} kcal | {{ item.product.nutrition.protein * item.quantity }}g P</small>
                  </div>
                  <div class="s-price">{{ (item.product.price * item.quantity) | currency:'PHP':'symbol' }}</div>
                </div>
              </div>

              <div class="divider"></div>

              <div class="calc-row">
                <span>Items Subtotal:</span>
                <span>{{ cartService.subtotal() | currency:'PHP':'symbol' }}</span>
              </div>
              <div class="calc-row">
                <span>Fulfillment ({{ fulfillmentType }}):</span>
                <span>{{ (fulfillmentType === 'delivery' ? 49 : 0) | currency:'PHP':'symbol' }}</span>
              </div>
              <div class="calc-row">
                <span>Platform Service Fee:</span>
                <span>{{ cartService.serviceFee() | currency:'PHP':'symbol' }}</span>
              </div>

              <div class="divider"></div>

              <div class="calc-row grand-total">
                <span>Total Due:</span>
                <span class="text-primary">{{ calculateTotal() | currency:'PHP':'symbol' }}</span>
              </div>

              <!-- Order Submit Button -->
              <button
                type="button"
                class="btn btn-primary btn-lg w-full mt-4 submit-btn"
                [disabled]="isSubmitting || (fulfillmentType === 'delivery' && !deliveryAddress)"
                (click)="placeOrder()"
              >
                <span *ngIf="!isSubmitting">Place Order &bull; {{ calculateTotal() | currency:'PHP':'symbol' }}</span>
                <span *ngIf="isSubmitting" class="flex items-center justify-center gap-2">
                  <span class="loading-spinner"></span> Creating Order...
                </span>
              </button>

              <p class="notice-text">
                By placing this order you commit to fulfill the cash payment upon meal collection. An official printable receipt will be generated.
              </p>
            </div>
          </div>
        </div>

        <!-- If cart emptied during checkout -->
        <div class="card empty-state text-center" *ngIf="cartService.isEmpty()">
          <app-icon name="check-circle" [size]="48" color="var(--color-primary)"></app-icon>
          <h3>Your Order is in Progress</h3>
          <p>Visit your order tracking page to view status updates and receipts.</p>
          <a routerLink="/customer/orders" class="btn btn-primary mt-4">View My Orders</a>
        </div>
      </div>
    </main>

    <app-public-footer></app-public-footer>
  `,
  styles: [`
    .checkout-page {
      background: var(--color-bg-secondary);
      min-height: 85vh;
    }
    .checkout-grid {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: var(--space-8);
      align-items: flex-start;
    }
    .checkout-card {
      padding: var(--space-6);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
    }
    .card-step-header {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-4);
      padding-bottom: var(--space-2);
      border-bottom: 1px solid var(--color-border);
    }
    .step-badge {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--color-primary);
      color: white;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card-step-header h3 {
      font-size: var(--font-size-base);
    }

    .fulfillment-options-grid, .payment-options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-3);
    }
    .fulfillment-box, .payment-box {
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      padding: var(--space-4);
      display: flex;
      gap: var(--space-3);
      cursor: pointer;
      position: relative;
      background: white;
      transition: all var(--transition-fast);
    }
    .fulfillment-box.selected, .payment-box.selected {
      border-color: var(--color-primary);
      background: var(--color-primary-lighter);
    }
    .fulfillment-box input, .payment-box input {
      position: absolute;
      top: 12px;
      right: 12px;
    }
    .f-info, .payment-box div {
      display: flex;
      flex-direction: column;
    }
    .f-info strong, .payment-box strong {
      font-size: var(--font-size-xs);
    }
    .f-info span, .payment-box span {
      font-size: 11px;
      color: var(--color-text-secondary);
    }

    .demo-payment-warning {
      display: flex;
      gap: var(--space-2);
      align-items: flex-start;
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border);
      padding: var(--space-3);
      border-radius: var(--radius);
      font-size: 11px;
      color: var(--color-text-secondary);
      line-height: 1.4;
    }

    .summary-box {
      padding: var(--space-6);
      border: 1px solid var(--color-border);
    }
    .summary-box h3 {
      font-size: var(--font-size-base);
      margin-bottom: var(--space-3);
      padding-bottom: var(--space-2);
      border-bottom: 1px solid var(--color-border);
    }
    .summary-items-list {
      max-height: 220px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin-bottom: var(--space-3);
    }
    .s-item {
      display: flex;
      align-items: flex-start;
      gap: var(--space-2);
      font-size: var(--font-size-xs);
    }
    .s-name {
      flex: 1;
    }
    .s-price {
      font-weight: 600;
    }
    .calc-row {
      display: flex;
      justify-content: space-between;
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin-bottom: 4px;
    }
    .calc-row.grand-total {
      font-size: var(--font-size-base);
      font-weight: 700;
      color: var(--color-text);
      margin-top: 4px;
    }
    .divider {
      height: 1px;
      background: var(--color-border);
      margin: var(--space-3) 0;
    }
    .notice-text {
      font-size: 10px;
      color: var(--color-text-tertiary);
      text-align: center;
      margin-top: var(--space-3);
      line-height: 1.4;
    }

    .alert-danger {
      background: var(--color-danger-bg);
      color: #991B1B;
      padding: 10px 14px;
      border-radius: var(--radius);
      margin-bottom: var(--space-4);
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-xs);
    }

    @media (max-width: 800px) {
      .checkout-grid {
        grid-template-columns: 1fr;
      }
      .fulfillment-options-grid, .payment-options-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  fulfillmentType: FulfillmentType = 'pickup';
  paymentMethod: PaymentMethod = 'cash_on_pickup';
  deliveryAddress = '';
  contactPhone = '';
  specialInstructions = '';
  isSubmitting = false;
  errorMessage = '';

  constructor(
    public cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.user();
    if (user) {
      this.deliveryAddress = user.address ? `${user.address}, ${user.city || ''} ${user.state || ''}`.trim() : '123 Market St, Suite 400';
      this.contactPhone = user.phone || '(555) 123-4567';
    }
  }

  kitchenName(): string {
    return this.cartService.currentBusinessName() || 'Kitchen';
  }

  onFulfillmentChange() {
    if (this.fulfillmentType === 'pickup') {
      this.paymentMethod = 'cash_on_pickup';
    } else {
      this.paymentMethod = 'cash_on_delivery';
    }
  }

  calculateTotal(): number {
    const subtotal = this.cartService.subtotal();
    const delivery = this.fulfillmentType === 'delivery' ? 49 : 0;
    const service = this.cartService.serviceFee();
    return subtotal + delivery + service;
  }

  placeOrder() {
    if (this.fulfillmentType === 'delivery' && !this.deliveryAddress.trim()) {
      this.errorMessage = 'Please provide a valid delivery address.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    setTimeout(() => {
      const res = this.orderService.createOrder({
        fulfillmentType: this.fulfillmentType,
        paymentMethod: this.paymentMethod,
        specialInstructions: this.specialInstructions,
        deliveryAddress: this.fulfillmentType === 'delivery' ? this.deliveryAddress : undefined
      });

      this.isSubmitting = false;

      if (res.success && res.order) {
        // Redirect to order detail view with confirmation
        this.router.navigate(['/customer/orders', res.order.id], {
          queryParams: { newOrder: 'true' }
        });
      } else {
        this.errorMessage = res.message;
      }
    }, 600);
  }
}
