import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, ProductFilters } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Product, Category } from '../../models';
import { PublicNavComponent } from '../../shared/components/public-nav.component';
import { PublicFooterComponent } from '../../shared/components/public-footer.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PublicNavComponent, PublicFooterComponent, IconComponent],
  template: `
    <app-public-nav></app-public-nav>

    <main class="page-content explore-page">
      <div class="container">
        <!-- Page Header -->
        <div class="explore-header">
          <div>
            <h1>Explore Nutrition-Focused Meals</h1>
            <p>Every dish includes transparent macro breakdowns verified for athletic and fitness dietary regimes.</p>
          </div>
          <div *ngIf="!authService.isLoggedIn()" class="auth-callout">
            <app-icon name="info" [size]="16" color="var(--color-primary)"></app-icon>
            <span>Sign in as a Customer to build a meal cart and place orders.</span>
            <a routerLink="/auth/login" class="btn btn-primary btn-sm">Sign In</a>
          </div>
        </div>

        <!-- Filter and Search Bar -->
        <div class="filter-panel card">
          <div class="filter-top-row">
            <div class="search-input-wrap">
              <app-icon name="search" [size]="18" class="search-icon"></app-icon>
              <input
                type="text"
                class="form-control search-input"
                placeholder="Search meals, ingredients, protein bowls..."
                [(ngModel)]="filters.search"
                (ngModelChange)="applyFilters()"
              />
              <button *ngIf="filters.search" class="clear-btn" (click)="filters.search = ''; applyFilters()">
                <app-icon name="x" [size]="14"></app-icon>
              </button>
            </div>

            <div class="sort-wrap">
              <label class="sort-label">Sort by:</label>
              <select class="form-control sort-select" [(ngModel)]="filters.sortBy" (ngModelChange)="applyFilters()">
                <option value="protein_desc">Highest Protein</option>
                <option value="calories_asc">Lowest Calories</option>
                <option value="calories_desc">Highest Calories</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          <!-- Quick Macro Pills -->
          <div class="quick-filters-row">
            <span class="quick-label">Macro Focus:</span>
            <div class="quick-pills">
              <button
                class="pill-btn"
                [class.active]="filters.quickFilter === 'all'"
                (click)="setQuickFilter('all')"
              >
                All Meals
              </button>
              <button
                class="pill-btn"
                [class.active]="filters.quickFilter === 'high_protein'"
                (click)="setQuickFilter('high_protein')"
              >
                <app-icon name="target" [size]="12"></app-icon>
                High Protein (25g+)
              </button>
              <button
                class="pill-btn"
                [class.active]="filters.quickFilter === 'low_calorie'"
                (click)="setQuickFilter('low_calorie')"
              >
                Low Calorie (&le; 350 kcal)
              </button>
              <button
                class="pill-btn"
                [class.active]="filters.quickFilter === 'under_500'"
                (click)="setQuickFilter('under_500')"
              >
                Under 500 kcal
              </button>
            </div>
          </div>

          <!-- Categories & Calorie Range Filter -->
          <div class="filter-bottom-row">
            <div class="category-pills">
              <button
                class="cat-chip"
                [class.active]="filters.category === 'all'"
                (click)="setCategory('all')"
              >
                All Categories
              </button>
              <button
                *ngFor="let cat of categories"
                class="cat-chip"
                [class.active]="filters.category === cat.name"
                (click)="setCategory(cat.name)"
              >
                {{ cat.name }}
              </button>
            </div>

            <div class="calorie-range-wrap">
              <span class="range-label">Max Cal: <strong>{{ filters.maxCalories || 1000 }}</strong></span>
              <input
                type="range"
                min="200"
                max="1000"
                step="50"
                [(ngModel)]="filters.maxCalories"
                (ngModelChange)="applyFilters()"
                class="range-slider"
              />
              <button *ngIf="filters.maxCalories" class="btn btn-ghost btn-sm" (click)="resetCalorieRange()">Reset</button>
            </div>
          </div>
        </div>

        <!-- Results Count & Active Filters Summary -->
        <div class="results-header">
          <p class="results-count">Showing <strong>{{ filteredProducts.length }}</strong> meals</p>
          <button class="btn btn-ghost btn-sm" *ngIf="hasActiveFilters()" (click)="resetAllFilters()">
            Clear All Filters
          </button>
        </div>

        <!-- Product Grid -->
        <div class="grid-3 product-grid" *ngIf="filteredProducts.length > 0">
          <div class="card product-card" *ngFor="let p of filteredProducts">
            <div class="product-img-box">
              <img [src]="p.imageUrl" [alt]="p.name" loading="lazy" />
              <span class="category-tag">{{ p.category }}</span>
              <span class="out-of-stock-pill" *ngIf="p.stock <= 0 || !p.isAvailable">Sold Out</span>
              <span class="low-stock-pill" *ngIf="p.stock > 0 && p.stock <= 5">Only {{ p.stock }} left</span>
            </div>

            <div class="card-body product-card-body">
              <div class="title-row">
                <h3 class="product-title">{{ p.name }}</h3>
                <span class="product-price">{{ p.price | currency:'PHP':'symbol' }}</span>
              </div>
              <p class="product-desc">{{ p.description }}</p>

              <!-- Nutrition Facts Box -->
              <div class="macros-box">
                <div class="macro-cell highlight-protein">
                  <span class="macro-val">{{ p.nutrition.protein }}g</span>
                  <span class="macro-tag">Protein</span>
                </div>
                <div class="macro-cell">
                  <span class="macro-val">{{ p.nutrition.calories }}</span>
                  <span class="macro-tag">Calories</span>
                </div>
                <div class="macro-cell">
                  <span class="macro-val">{{ p.nutrition.carbs }}g</span>
                  <span class="macro-tag">Carbs</span>
                </div>
                <div class="macro-cell">
                  <span class="macro-val">{{ p.nutrition.fat }}g</span>
                  <span class="macro-tag">Fat</span>
                </div>
              </div>

              <!-- Footer Actions -->
              <div class="card-actions-row">
                <span class="serving-size-text">Serving: {{ p.nutrition.servingSize }}</span>
                <button
                  class="btn btn-primary btn-sm"
                  [disabled]="!p.isAvailable || p.stock <= 0"
                  (click)="handleOrderClick(p)"
                >
                  <app-icon name="shopping-bag" [size]="14"></app-icon>
                  {{ p.isAvailable && p.stock > 0 ? 'Order Meal' : 'Sold Out' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state card" *ngIf="filteredProducts.length === 0">
          <app-icon name="search" [size]="48" color="var(--color-text-tertiary)"></app-icon>
          <h3>No Meals Match Your Criteria</h3>
          <p>Try widening your calorie range, clearing macro filters, or searching for other ingredients.</p>
          <button class="btn btn-outline" (click)="resetAllFilters()">Reset All Filters</button>
        </div>
      </div>
    </main>

    <app-public-footer></app-public-footer>
  `,
  styles: [`
    .explore-page {
      background: var(--color-bg-secondary);
      min-height: 80vh;
    }
    .explore-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-6);
      flex-wrap: wrap;
      gap: var(--space-4);
    }
    .explore-header h1 {
      font-size: var(--font-size-2xl);
      margin-bottom: 4px;
    }
    .explore-header p {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }
    .auth-callout {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      background: var(--color-primary-light);
      border: 1px solid rgba(45, 90, 61, 0.2);
      padding: 8px 14px;
      border-radius: var(--radius-md);
      font-size: var(--font-size-xs);
      color: var(--color-primary);
    }

    .filter-panel {
      padding: var(--space-5);
      margin-bottom: var(--space-6);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      border: 1px solid var(--color-border);
    }
    .filter-top-row {
      display: flex;
      gap: var(--space-4);
      align-items: center;
    }
    .search-input-wrap {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-icon {
      position: absolute;
      left: 12px;
      color: var(--color-text-secondary);
      pointer-events: none;
    }
    .search-input {
      padding-left: 38px;
      padding-right: 32px;
      height: 42px;
    }
    .clear-btn {
      position: absolute;
      right: 10px;
      background: none;
      border: none;
      color: var(--color-text-tertiary);
      cursor: pointer;
    }
    .sort-wrap {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      white-space: nowrap;
    }
    .sort-label {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      font-weight: 500;
    }
    .sort-select {
      width: auto;
      min-width: 170px;
      height: 42px;
    }

    .quick-filters-row {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      flex-wrap: wrap;
      padding-top: var(--space-2);
      border-top: 1px solid var(--color-border);
    }
    .quick-label {
      font-size: var(--font-size-xs);
      font-weight: 600;
      color: var(--color-text-secondary);
    }
    .quick-pills {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
    }
    .pill-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 5px 12px;
      font-size: var(--font-size-xs);
      font-weight: 500;
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-full);
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .pill-btn:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
    }
    .pill-btn.active {
      background: var(--color-primary);
      color: white;
      border-color: var(--color-primary);
    }

    .filter-bottom-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-4);
      flex-wrap: wrap;
    }
    .category-pills {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .cat-chip {
      background: none;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      padding: 4px 10px;
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .cat-chip:hover {
      background: var(--color-bg-secondary);
      color: var(--color-text);
    }
    .cat-chip.active {
      background: var(--color-primary-light);
      border-color: var(--color-primary);
      color: var(--color-primary);
      font-weight: 600;
    }

    .calorie-range-wrap {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    .range-label {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      white-space: nowrap;
    }
    .range-slider {
      width: 120px;
      accent-color: var(--color-primary);
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-4);
    }
    .results-count {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .product-grid {
      gap: var(--space-6);
    }
    .product-card {
      display: flex;
      flex-direction: column;
      border: 1px solid var(--color-border);
      transition: transform var(--transition), box-shadow var(--transition);
    }
    .product-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .product-img-box {
      position: relative;
      height: 200px;
      background: var(--color-bg-secondary);
      overflow: hidden;
    }
    .product-img-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .category-tag {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(26, 26, 26, 0.75);
      backdrop-filter: blur(4px);
      color: white;
      font-size: 10px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: var(--radius-full);
    }
    .out-of-stock-pill {
      position: absolute;
      top: 10px;
      right: 10px;
      background: var(--color-danger);
      color: white;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: var(--radius-full);
    }
    .low-stock-pill {
      position: absolute;
      bottom: 10px;
      right: 10px;
      background: rgba(240, 173, 78, 0.95);
      color: #78350F;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: var(--radius-full);
    }
    .product-card-body {
      display: flex;
      flex-direction: column;
      flex: 1;
      padding: var(--space-4);
    }
    .title-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 6px;
      gap: var(--space-2);
    }
    .product-title {
      font-size: var(--font-size-base);
      font-weight: 600;
      line-height: 1.3;
    }
    .product-price {
      font-size: var(--font-size-base);
      font-weight: 700;
      color: var(--color-primary);
      white-space: nowrap;
    }
    .product-desc {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      line-height: 1.5;
      margin-bottom: var(--space-4);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .macros-box {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 4px;
      background: var(--color-bg-secondary);
      padding: 8px 4px;
      border-radius: var(--radius-sm);
      margin-bottom: var(--space-4);
    }
    .macro-cell {
      text-align: center;
    }
    .macro-cell.highlight-protein .macro-val {
      color: var(--color-primary);
      font-weight: 700;
    }
    .macro-val {
      display: block;
      font-size: var(--font-size-xs);
      font-weight: 600;
    }
    .macro-tag {
      font-size: 9px;
      color: var(--color-text-secondary);
      text-transform: uppercase;
    }
    .card-actions-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: auto;
      padding-top: var(--space-3);
      border-top: 1px solid var(--color-border);
    }
    .serving-size-text {
      font-size: 11px;
      color: var(--color-text-tertiary);
    }

    @media (max-width: 768px) {
      .filter-top-row {
        flex-direction: column;
        align-items: stretch;
      }
      .filter-bottom-row {
        flex-direction: column;
        align-items: stretch;
      }
      .calorie-range-wrap {
        justify-content: space-between;
      }
    }
  `]
})
export class ExploreComponent implements OnInit {
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];

  filters: ProductFilters = {
    search: '',
    category: 'all',
    sortBy: 'protein_desc',
    quickFilter: 'all',
    maxCalories: undefined
  };

  constructor(
    private productService: ProductService,
    public authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.allProducts = this.productService.getProducts();
    this.categories = this.productService.getCategories();
    this.applyFilters();
  }

  applyFilters() {
    this.filteredProducts = this.productService.filterProducts(this.allProducts, this.filters);
  }

  setQuickFilter(q: 'all' | 'high_protein' | 'low_calorie' | 'under_500') {
    this.filters.quickFilter = q;
    this.applyFilters();
  }

  setCategory(cat: string) {
    this.filters.category = cat;
    this.applyFilters();
  }

  resetCalorieRange() {
    this.filters.maxCalories = undefined;
    this.applyFilters();
  }

  resetAllFilters() {
    this.filters = {
      search: '',
      category: 'all',
      sortBy: 'protein_desc',
      quickFilter: 'all',
      maxCalories: undefined
    };
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!this.filters.search ||
      this.filters.category !== 'all' ||
      this.filters.quickFilter !== 'all' ||
      this.filters.maxCalories !== undefined;
  }

  handleOrderClick(product: Product) {
    if (this.authService.isLoggedIn() && this.authService.isCustomer()) {
      const res = this.cartService.addItem(product, 1);
      if (res.success) {
        this.router.navigate(['/customer/cart']);
      } else {
        alert(res.message);
      }
    } else if (this.authService.isLoggedIn()) {
      alert('You are logged in as a seller or admin. Please switch to a customer account to order food.');
    } else {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/customer/explore' } });
    }
  }
}
