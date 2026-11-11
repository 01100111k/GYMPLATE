import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models';
import { SellerSidebarComponent } from '../../shared/components/seller-sidebar.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-seller-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, SellerSidebarComponent],
  template: `
    <div class="seller-layout">
      <app-seller-sidebar></app-seller-sidebar>

      <main class="seller-main-content">
        <div class="seller-container">
          <div class="page-header mb-6">
            <span class="text-xs font-bold uppercase text-primary">Stock Controls</span>
            <h1>Inventory Management</h1>
            <p class="text-xs text-secondary">Adjust prepared stock counts in real time to prevent overselling on the customer marketplace.</p>
          </div>

          <!-- Inventory Metrics -->
          <div class="grid-3 mb-6">
            <div class="card stat-card">
              <span class="lbl">Total Tracked Dishes</span>
              <strong class="val">{{ products.length }}</strong>
            </div>
            <div class="card stat-card highlight-warning">
              <span class="lbl">Low Stock (&le; 10 units)</span>
              <strong class="val text-warning">{{ lowStockCount() }}</strong>
            </div>
            <div class="card stat-card highlight-danger">
              <span class="lbl">Sold Out Meals</span>
              <strong class="val text-danger">{{ soldOutCount() }}</strong>
            </div>
          </div>

          <!-- Inventory Table -->
          <div class="card table-panel">
            <div class="table-container">
              <table class="inventory-table">
                <thead>
                  <tr>
                    <th class="col-meal">Meal</th>
                    <th class="col-category">Category</th>
                    <th class="col-current-stock text-center">Current Stock</th>
                    <th class="col-status text-center">Inventory Status</th>
                    <th class="col-exact-stock text-center">Set Exact Stock</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let p of products">
                    <td class="col-meal">
                      <div class="meal-cell">
                        <img [src]="p.imageUrl" [alt]="p.name" class="table-thumb" />
                        <div class="meal-info">
                          <strong class="meal-name">{{ p.name }}</strong>
                          <div class="meal-meta">
                            <span class="meal-price">{{ p.price | currency:'PHP':'symbol' }}</span>
                            <span class="meta-separator">&bull;</span>
                            <span class="meal-calories">{{ p.nutrition.calories }} kcal</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="col-category">
                      <span class="category-pill">{{ p.category }}</span>
                    </td>
                    <td class="col-current-stock text-center">
                      <span class="stock-number">{{ p.stock }}</span>
                    </td>
                    <td class="col-status text-center">
                      <span
                        class="status-badge"
                        [class.status-badge-soldout]="p.stock === 0"
                        [class.status-badge-low]="p.stock > 0 && p.stock <= 10"
                        [class.status-badge-optimal]="p.stock > 10"
                      >
                        {{ p.stock === 0 ? 'Sold Out' : (p.stock <= 10 ? 'Low Stock' : 'Optimal Stock') }}
                      </span>
                    </td>
                    <td class="col-exact-stock text-center">
                      <div class="stock-input-wrapper">
                        <input
                          type="number"
                          min="0"
                          class="stock-input"
                          [(ngModel)]="p.stock"
                          (ngModelChange)="onStockChange(p)"
                          aria-label="Set exact stock units"
                        />
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="products.length === 0">
                    <td colspan="5" class="empty-cell text-center py-8">
                      <p class="text-xs text-secondary">No products currently tracked in your inventory.</p>
                    </td>
                  </tr>
                </tbody>
              </table>
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

    /* Metric Cards */
    .stat-card {
      padding: var(--space-5);
      border: 1px solid var(--color-border);
      background: white;
      border-radius: var(--radius-md);
    }
    .stat-card .lbl {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--color-text-secondary);
      display: block;
    }
    .stat-card .val {
      font-size: 1.875rem;
      font-weight: 800;
      display: block;
      margin-top: 4px;
      line-height: 1.2;
    }
    .highlight-warning { background: var(--color-warning-bg); }
    .highlight-danger { background: var(--color-danger-bg); }

    /* Inventory Table Panel */
    .table-panel {
      border: 1px solid var(--color-border);
      background: white;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }
    .table-container {
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    .inventory-table {
      width: 100%;
      min-width: 760px;
      border-collapse: separate;
      border-spacing: 0;
      font-size: var(--font-size-sm);
    }

    /* Headers */
    .inventory-table th {
      background-color: #F8FAFC;
      color: var(--color-text-secondary);
      font-size: 11.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 14px 20px;
      border-bottom: 1px solid var(--color-border);
      white-space: nowrap;
      text-align: left;
    }
    .inventory-table th.text-center {
      text-align: center;
    }

    /* Table Rows & Cells */
    .inventory-table tbody tr {
      transition: background-color var(--transition-fast);
    }
    .inventory-table tbody tr:hover {
      background-color: #F8FAF9;
    }
    .inventory-table td {
      padding: 14px 20px;
      border-bottom: 1px solid var(--color-border);
      vertical-align: middle;
      color: var(--color-text);
    }
    .inventory-table tbody tr:last-child td {
      border-bottom: none;
    }

    /* Column Sizing & Alignment */
    .col-meal {
      min-width: 290px;
    }
    .col-category {
      min-width: 140px;
      white-space: nowrap;
    }
    .col-current-stock {
      min-width: 130px;
      text-align: center;
    }
    .col-status {
      min-width: 150px;
      text-align: center;
    }
    .col-exact-stock {
      min-width: 150px;
      text-align: center;
    }

    /* 1. Meal Column Spacing & Typography */
    .meal-cell {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .table-thumb {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-sm);
      object-fit: cover;
      flex-shrink: 0;
      border: 1px solid var(--color-border);
      background: var(--color-bg-secondary);
    }
    .meal-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }
    .meal-name {
      font-size: 13.5px;
      font-weight: 600;
      color: var(--color-text);
      line-height: 1.35;
      display: block;
      word-break: break-word;
    }
    .meal-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      line-height: 1.2;
    }
    .meal-price {
      font-size: 12.5px;
      font-weight: 700;
      color: var(--color-primary);
      display: inline-block;
    }
    .meta-separator {
      color: var(--color-text-tertiary);
      font-size: 12px;
      user-select: none;
    }
    .meal-calories {
      font-size: 12px;
      color: var(--color-text-secondary);
      font-weight: 500;
      display: inline-block;
    }

    /* Category Pill */
    .category-pill {
      display: inline-block;
      font-size: 12px;
      color: var(--color-text-secondary);
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border);
      padding: 3px 10px;
      border-radius: var(--radius-full);
      font-weight: 500;
    }

    /* 2. Current Stock Column (Horizontally Centered) */
    .stock-number {
      display: inline-block;
      font-size: 15px;
      font-weight: 700;
      color: var(--color-text);
      letter-spacing: -0.01em;
      min-width: 32px;
      text-align: center;
    }

    /* 3. Inventory Status Column (Horizontally Centered Badges) */
    .status-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 104px;
      height: 26px;
      padding: 0 12px;
      font-size: 11.5px;
      font-weight: 600;
      border-radius: var(--radius-full);
      letter-spacing: 0.01em;
      margin: 0 auto;
    }
    .status-badge-soldout {
      background-color: #FEE2E2;
      color: #991B1B;
      border: 1px solid #FECACA;
    }
    .status-badge-low {
      background-color: #FEF3C7;
      color: #92400E;
      border: 1px solid #FDE68A;
    }
    .status-badge-optimal {
      background-color: #DCFCE7;
      color: #166534;
      border: 1px solid #BBF7D0;
    }

    /* 4. Set Exact Stock Column (Horizontally Centered Input) */
    .stock-input-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
    }
    .stock-input {
      width: 78px;
      height: 34px;
      padding: 4px 8px;
      text-align: center;
      font-size: 13.5px;
      font-weight: 600;
      color: var(--color-text);
      background-color: white;
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
      outline: none;
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);
    }
    .stock-input:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(22, 101, 52, 0.12);
    }

    .empty-cell {
      padding: var(--space-8);
      color: var(--color-text-secondary);
    }

    /* 5. Responsive Behavior */
    @media (max-width: 900px) {
      .seller-main-content {
        margin-left: 0;
        padding: var(--space-4);
      }
      .grid-3 {
        grid-template-columns: 1fr;
        gap: var(--space-3);
      }
    }
  `]
})
export class SellerInventoryComponent implements OnInit {
  products: Product[] = [];

  constructor(
    private authService: AuthService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    const user = this.authService.user();
    if (user) {
      this.products = this.productService.getProductsBySeller(user.id);
    }
  }

  lowStockCount(): number {
    return this.products.filter(p => p.stock > 0 && p.stock <= 10).length;
  }

  soldOutCount(): number {
    return this.products.filter(p => p.stock === 0).length;
  }

  onStockChange(product: Product) {
    product.stock = Math.max(0, product.stock);
    product.isAvailable = product.stock > 0;
    this.productService.updateProduct(product);
  }
}
