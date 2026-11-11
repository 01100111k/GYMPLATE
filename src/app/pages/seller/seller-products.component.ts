import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { SellerService } from '../../services/seller.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models';
import { SellerSidebarComponent } from '../../shared/components/seller-sidebar.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-seller-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SellerSidebarComponent, IconComponent],
  template: `
    <div class="seller-layout">
      <app-seller-sidebar></app-seller-sidebar>

      <main class="seller-main-content">
        <div class="seller-container">
          <!-- Page Header -->
          <div class="page-header flex justify-between items-center flex-wrap gap-4 mb-6">
            <div>
              <span class="text-xs font-bold uppercase text-primary">Catalog Management</span>
              <h1>My Fitness Meals & Dishes</h1>
              <p class="text-xs text-secondary">Manage recipes, verify macro figures, and adjust live marketplace availability.</p>
            </div>
            <a routerLink="/seller/products/add" class="btn btn-primary btn-sm" [class.disabled-btn]="!isApproved()">
              <app-icon name="plus" [size]="14"></app-icon>
              Add New Meal
            </a>
          </div>

          <!-- Pending Alert if Seller Not Approved -->
          <div class="alert alert-warning mb-6" *ngIf="!isApproved()">
            <app-icon name="alert-circle" [size]="18"></app-icon>
            <div>
              <strong>Kitchen Verification Required</strong>
              <p class="text-xs mt-1">Product catalog publishing is locked until an Administrator reviews your permit.</p>
            </div>
          </div>

          <!-- Search & Filter Controls -->
          <div class="filter-bar card mb-6">
            <div class="search-input-wrap">
              <app-icon name="search" [size]="16" class="search-icon"></app-icon>
              <input
                type="text"
                class="form-control"
                placeholder="Filter by meal name, category, or macro..."
                [(ngModel)]="searchQuery"
                (ngModelChange)="filterProducts()"
              />
            </div>
            <select class="form-control category-select" [(ngModel)]="selectedCategory" (ngModelChange)="filterProducts()">
              <option value="all">All Categories</option>
              <option *ngFor="let cat of categories" [value]="cat.name">{{ cat.name }}</option>
            </select>
          </div>

          <!-- Product Table -->
          <div class="card table-panel">
            <div class="table-container" *ngIf="filteredProducts.length > 0">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Meal Details</th>
                    <th>Category</th>
                    <th>Serving Size</th>
                    <th class="text-center">Macros (P / C / F / kcal)</th>
                    <th class="text-center">Stock</th>
                    <th class="text-center">Live Status</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let p of filteredProducts">
                    <td>
                      <div class="meal-row-info">
                        <img [src]="p.imageUrl" [alt]="p.name" class="meal-thumb" />
                        <div class="meal-details-wrap">
                          <strong class="meal-name">{{ p.name }}</strong>
                          <div class="meal-meta-row">
                            <span class="meal-price">{{ p.price | currency:'PHP':'symbol' }}</span>
                            <span class="moderation-alert text-xs text-danger" *ngIf="p.isDisabled">
                              &bull; Disabled by Admin ({{ p.disableReason || 'Compliance' }})
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="text-xs">{{ p.category }}</td>
                    <td class="text-xs text-secondary">{{ p.nutrition.servingSize }}</td>
                    <td class="text-center">
                      <div class="macro-cell-group">
                        <span class="p-val font-bold text-primary">{{ p.nutrition.protein }}g P</span>
                        <span class="sub-val text-xs text-secondary">{{ p.nutrition.carbs }}C / {{ p.nutrition.fat }}F &bull; {{ p.nutrition.calories }} kcal</span>
                      </div>
                    </td>
                    <td class="text-center">
                      <span class="stock-badge" [class.badge-warning]="p.stock > 0 && p.stock <= 5" [class.badge-danger]="p.stock === 0" [class.badge-neutral]="p.stock > 5">
                        {{ p.stock }} units
                      </span>
                    </td>
                    <td class="text-center">
                      <button
                        class="toggle-avail-btn"
                        [class.active]="p.isAvailable && !p.isDisabled"
                        [disabled]="p.isDisabled"
                        (click)="toggleAvailability(p)"
                      >
                        {{ p.isAvailable && !p.isDisabled ? 'Available' : 'Paused' }}
                      </button>
                    </td>
                    <td class="text-right">
                      <div class="actions-group">
                        <a [routerLink]="['/seller/products/edit', p.id]" class="btn btn-ghost btn-sm" title="Edit Meal">
                          <app-icon name="edit" [size]="14"></app-icon>
                        </a>
                        <button class="btn btn-ghost btn-sm text-danger" (click)="deleteProduct(p)" title="Delete Meal">
                          <app-icon name="trash" [size]="14"></app-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Empty state -->
            <div class="empty-state py-12 text-center" *ngIf="filteredProducts.length === 0">
              <app-icon name="package" [size]="48" color="var(--color-text-tertiary)"></app-icon>
              <h3>No Meals In Catalog</h3>
              <p class="text-xs text-secondary mt-1">No products match your search query or your kitchen has not published any recipes yet.</p>
              <a routerLink="/seller/products/add" class="btn btn-primary btn-sm mt-4" [class.disabled-btn]="!isApproved()">
                Add Your First Meal
              </a>
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
      max-width: var(--container-max);
      margin: 0 auto;
    }

    .filter-bar {
      display: flex;
      gap: var(--space-4);
      padding: var(--space-3) var(--space-4);
      border: 1px solid var(--color-border);
      background: white;
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
    }
    .search-input-wrap .form-control {
      padding-left: 36px;
    }
    .category-select {
      width: 200px;
    }

    .table-panel {
      border: 1px solid var(--color-border);
      background: white;
    }
    .meal-row-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .meal-thumb {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-sm);
      object-fit: cover;
      border: 1px solid var(--color-border);
      flex-shrink: 0;
    }
    .meal-details-wrap {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .meal-meta-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .meal-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text);
      display: block;
    }
    .meal-price {
      font-size: 12px;
      font-weight: 700;
      color: var(--color-primary);
    }
    .macro-cell-group {
      display: flex;
      flex-direction: column;
    }
    .p-val {
      font-size: var(--font-size-xs);
    }
    .stock-badge {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: var(--radius-full);
    }
    .toggle-avail-btn {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      height: 22px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-full);
      border: 1px solid var(--color-border);
      background: var(--color-bg-secondary);
      cursor: pointer;
      color: var(--color-text-secondary);
    }
    .toggle-avail-btn.active {
      background: var(--color-success-bg);
      color: #166534;
      border-color: rgba(40, 167, 69, 0.3);
    }
    .actions-group {
      display: flex;
      justify-content: flex-end;
      gap: 4px;
    }

    .alert-warning {
      background: #FFFBEB;
      color: #92400E;
      border: 1px solid #FCD34D;
      padding: 12px 14px;
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }
    .disabled-btn {
      opacity: 0.5;
      pointer-events: none;
    }

    @media (max-width: 900px) {
      .seller-main-content {
        margin-left: 0;
        padding: var(--space-4);
      }
      .filter-bar {
        flex-direction: column;
      }
      .category-select {
        width: 100%;
      }
    }
  `]
})
export class SellerProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: any[] = [];
  searchQuery = '';
  selectedCategory = 'all';

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private sellerService: SellerService
  ) {}

  ngOnInit() {
    this.categories = this.productService.getCategories();
    this.loadProducts();
  }

  isApproved(): boolean {
    const user = this.authService.user();
    return user ? this.sellerService.isApproved(user.id) : false;
  }

  loadProducts() {
    const user = this.authService.user();
    if (user) {
      this.products = this.productService.getProductsBySeller(user.id);
      this.filterProducts();
    }
  }

  filterProducts() {
    this.filteredProducts = this.products.filter(p => {
      const matchSearch = !this.searchQuery ||
        p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchCategory = this.selectedCategory === 'all' || p.category === this.selectedCategory;
      return matchSearch && matchCategory;
    });
  }

  toggleAvailability(product: Product) {
    const updated = { ...product, isAvailable: !product.isAvailable, updatedAt: new Date() };
    this.productService.updateProduct(updated);
    this.loadProducts();
  }

  deleteProduct(product: Product) {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.productService.deleteProduct(product.id);
      this.loadProducts();
    }
  }
}
