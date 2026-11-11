import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { MockDataService } from '../../services/mock-data.service';
import { Product, Business, Review } from '../../models';
import { CustomerNavComponent } from '../../shared/components/customer-nav.component';
import { PublicFooterComponent } from '../../shared/components/public-footer.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CustomerNavComponent, PublicFooterComponent, IconComponent],
  template: `
    <app-customer-nav></app-customer-nav>

    <main class="page-content product-page" *ngIf="product">
      <div class="container container-narrow">
        <!-- Back Navigation -->
        <div class="back-link mb-4">
          <a routerLink="/customer/explore" class="btn btn-ghost btn-sm">
            <app-icon name="arrow-left" [size]="16"></app-icon>
            Back to Marketplace
          </a>
        </div>

        <!-- Product Hero Card -->
        <div class="product-detail-card card">
          <div class="product-layout">
            <!-- Left: Food Photography -->
            <div class="product-visual">
              <div class="img-wrapper">
                <img [src]="product.imageUrl" [alt]="product.name" />
                <span class="category-chip">{{ product.category }}</span>
              </div>
              <div class="macro-badge-row">
                <div class="badge-item primary">
                  <span class="v">{{ product.nutrition.protein }}g</span>
                  <span class="l">Protein</span>
                </div>
                <div class="badge-item">
                  <span class="v">{{ product.nutrition.calories }}</span>
                  <span class="l">Calories</span>
                </div>
                <div class="badge-item">
                  <span class="v">{{ product.nutrition.carbs }}g</span>
                  <span class="l">Carbs</span>
                </div>
                <div class="badge-item">
                  <span class="v">{{ product.nutrition.fat }}g</span>
                  <span class="l">Fat</span>
                </div>
              </div>
            </div>

            <!-- Right: Details & Order Form -->
            <div class="product-info-panel">
              <div class="seller-banner-pill" *ngIf="business">
                <app-icon name="store" [size]="14" color="var(--color-primary)"></app-icon>
                <span>Prepared by <strong>{{ business.businessName }}</strong></span>
              </div>

              <h1 class="product-name">{{ product.name }}</h1>
              <div class="price-stock-row">
                <span class="product-price">{{ product.price | currency:'PHP':'symbol' }}</span>
                <span class="stock-status" [class.in-stock]="product.stock > 5" [class.low-stock]="product.stock > 0 && product.stock <= 5" [class.out-of-stock]="product.stock <= 0">
                  {{ product.stock > 0 ? (product.stock <= 5 ? 'Only ' + product.stock + ' remaining' : 'In Stock (' + product.stock + ')') : 'Currently Sold Out' }}
                </span>
              </div>

              <p class="product-description">{{ product.description }}</p>

              <!-- Detailed Nutrition Breakdown -->
              <div class="nutrition-card">
                <div class="nutrition-header">
                  <span class="font-semibold text-xs uppercase">Macronutrient Facts</span>
                  <span class="text-xs text-secondary">Serving: {{ product.nutrition.servingSize }}</span>
                </div>
                <div class="nutrition-grid-detailed">
                  <div class="macro-metric">
                    <span class="num highlight">{{ product.nutrition.protein }}g</span>
                    <span class="label">Protein</span>
                  </div>
                  <div class="macro-metric">
                    <span class="num">{{ product.nutrition.calories }}</span>
                    <span class="label">Calories</span>
                  </div>
                  <div class="macro-metric">
                    <span class="num">{{ product.nutrition.carbs }}g</span>
                    <span class="label">Carbohydrates</span>
                  </div>
                  <div class="macro-metric">
                    <span class="num">{{ product.nutrition.fat }}g</span>
                    <span class="label">Total Fat</span>
                  </div>
                </div>
                <p class="nutrition-disclaimer">
                  * Nutrition calculated per listed serving size. Labeled seller-provided. Not medical or clinical advice.
                </p>
              </div>

              <!-- Feedback / Error alert if any -->
              <div class="alert alert-danger" *ngIf="errorMessage">
                <app-icon name="alert-circle" [size]="16"></app-icon>
                <span>{{ errorMessage }}</span>
              </div>
              <div class="alert alert-success" *ngIf="successMessage">
                <app-icon name="check-circle" [size]="16"></app-icon>
                <span>{{ successMessage }}</span>
              </div>

              <!-- Quantity & Special Instructions -->
              <div class="order-controls" *ngIf="product.stock > 0 && product.isAvailable">
                <div class="quantity-row">
                  <label class="form-label" for="quantity">Quantity:</label>
                  <div class="qty-stepper">
                    <button type="button" class="stepper-btn" (click)="decreaseQty()" [disabled]="quantity <= 1">
                      <app-icon name="minus" [size]="14"></app-icon>
                    </button>
                    <span class="qty-display">{{ quantity }}</span>
                    <button type="button" class="stepper-btn" (click)="increaseQty()" [disabled]="quantity >= product.stock">
                      <app-icon name="plus" [size]="14"></app-icon>
                    </button>
                  </div>
                  <span class="total-calc">{{ (product.price * quantity) | currency:'PHP':'symbol' }}</span>
                </div>

                <div class="form-group mt-3">
                  <label class="form-label" for="instructions">Preparation Instructions <small class="text-secondary">(Optional)</small></label>
                  <input
                    id="instructions"
                    type="text"
                    class="form-control"
                    placeholder="e.g. Dressing on side, no onions, extra lemon..."
                    [(ngModel)]="specialInstructions"
                  />
                </div>

                <div class="action-buttons mt-4">
                  <button class="btn btn-primary btn-lg w-full" (click)="addToCart()">
                    <app-icon name="shopping-bag" [size]="18"></app-icon>
                    Add to Cart &bull; {{ (product.price * quantity) | currency:'PHP':'symbol' }}
                  </button>
                </div>
              </div>

              <!-- Sold out disabled message -->
              <div class="sold-out-box" *ngIf="product.stock <= 0 || !product.isAvailable">
                <app-icon name="alert-triangle" [size]="20" color="var(--color-danger)"></app-icon>
                <div>
                  <strong>Item Temporarily Sold Out</strong>
                  <p class="text-xs text-secondary mt-1">This kitchen has exhausted today's prepared stock for this dish.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Fallback if not found -->
    <div class="page-content text-center" *ngIf="!product && !isLoading">
      <div class="container container-narrow">
        <h2>Meal Not Found</h2>
        <p class="text-secondary mt-2">The requested dish might have been removed or updated.</p>
        <a routerLink="/customer/explore" class="btn btn-primary mt-4">Return to Explore</a>
      </div>
    </div>

    <app-public-footer></app-public-footer>
  `,
  styles: [`
    .product-page {
      background: var(--color-bg-secondary);
      min-height: 85vh;
    }
    .product-detail-card {
      padding: var(--space-8);
      border: 1px solid var(--color-border);
      background: white;
      border-radius: var(--radius-lg);
    }
    .product-layout {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: var(--space-8);
    }
    .img-wrapper {
      position: relative;
      height: 340px;
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--color-bg-secondary);
    }
    .img-wrapper img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .category-chip {
      position: absolute;
      top: 12px;
      left: 12px;
      background: rgba(26, 26, 26, 0.8);
      color: white;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 11px;
      font-weight: 600;
      backdrop-filter: blur(4px);
    }
    .macro-badge-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      margin-top: var(--space-3);
    }
    .badge-item {
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border);
      padding: 8px 4px;
      border-radius: var(--radius);
      text-align: center;
    }
    .badge-item.primary {
      background: var(--color-primary-lighter);
      border-color: rgba(45, 90, 61, 0.2);
    }
    .badge-item.primary .v {
      color: var(--color-primary);
    }
    .badge-item .v {
      font-size: var(--font-size-sm);
      font-weight: 700;
      display: block;
    }
    .badge-item .l {
      font-size: 9px;
      color: var(--color-text-secondary);
      text-transform: uppercase;
    }

    .seller-banner-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: var(--font-size-xs);
      color: var(--color-text);
      background: var(--color-bg-secondary);
      padding: 4px 10px;
      border-radius: var(--radius-full);
      border: 1px solid var(--color-border);
      margin-bottom: var(--space-3);
    }
    .product-name {
      font-size: 1.875rem;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: var(--space-2);
    }
    .price-stock-row {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      margin-bottom: var(--space-4);
    }
    .product-price {
      font-size: var(--font-size-2xl);
      font-weight: 800;
      color: var(--color-primary);
    }
    .stock-status {
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: var(--radius-full);
    }
    .stock-status.in-stock { background: var(--color-success-bg); color: #166534; }
    .stock-status.low-stock { background: var(--color-warning-bg); color: #92400E; }
    .stock-status.out-of-stock { background: var(--color-danger-bg); color: #991B1B; }

    .product-description {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      line-height: 1.6;
      margin-bottom: var(--space-6);
    }

    .nutrition-card {
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--space-4);
      margin-bottom: var(--space-6);
    }
    .nutrition-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--color-border);
      padding-bottom: 6px;
      margin-bottom: 8px;
    }
    .nutrition-grid-detailed {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      margin-bottom: 8px;
    }
    .macro-metric {
      text-align: center;
    }
    .macro-metric .num {
      display: block;
      font-size: var(--font-size-base);
      font-weight: 700;
    }
    .macro-metric .num.highlight {
      color: var(--color-primary);
    }
    .macro-metric .label {
      font-size: 10px;
      color: var(--color-text-secondary);
    }
    .nutrition-disclaimer {
      font-size: 10px;
      color: var(--color-text-tertiary);
      line-height: 1.4;
      font-style: italic;
    }

    .quantity-row {
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }
    .qty-stepper {
      display: flex;
      align-items: center;
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      background: white;
    }
    .stepper-btn {
      width: 34px;
      height: 34px;
      background: none;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--color-text);
    }
    .stepper-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    .qty-display {
      font-weight: 700;
      font-size: var(--font-size-sm);
      min-width: 32px;
      text-align: center;
    }
    .total-calc {
      font-size: var(--font-size-base);
      font-weight: 700;
      color: var(--color-text);
      margin-left: auto;
    }
    .w-full {
      width: 100%;
    }

    .sold-out-box {
      display: flex;
      gap: var(--space-3);
      align-items: center;
      background: var(--color-danger-bg);
      border: 1px solid rgba(220, 53, 69, 0.3);
      padding: var(--space-4);
      border-radius: var(--radius);
      color: #991B1B;
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
      border: 1px solid rgba(220, 53, 69, 0.3);
    }
    .alert-success {
      background: var(--color-success-bg);
      color: #166534;
      border: 1px solid rgba(40, 167, 69, 0.3);
    }

    @media (max-width: 800px) {
      .product-layout {
        grid-template-columns: 1fr;
      }
      .img-wrapper {
        height: 240px;
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product: Product | undefined;
  business: Business | undefined;
  quantity = 1;
  specialInstructions = '';
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private mockData: MockDataService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.product = this.productService.getProduct(id);
      if (this.product) {
        this.business = this.mockData.getBusinessBySellerId(this.product.sellerId);
      }
    }
    this.isLoading = false;
  }

  increaseQty() {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decreaseQty() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {
    if (!this.product) return;
    this.errorMessage = '';
    this.successMessage = '';

    const res = this.cartService.addItem(this.product, this.quantity);
    if (!res.success) {
      this.errorMessage = res.message;
    } else {
      this.successMessage = `Added ${this.quantity}x ${this.product.name} to cart.`;
      setTimeout(() => {
        this.router.navigate(['/customer/cart']);
      }, 700);
    }
  }
}
