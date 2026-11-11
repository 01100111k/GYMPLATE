import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { AdminService } from '../../services/admin.service';
import { MockDataService } from '../../services/mock-data.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models';
import { AdminSidebarComponent } from '../../shared/components/admin-sidebar.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent, IconComponent],
  template: `
    <div class="admin-layout">
      <app-admin-sidebar></app-admin-sidebar>

      <main class="admin-main-content">
        <div class="admin-container">
          <div class="page-header mb-6">
            <span class="text-xs font-bold uppercase text-warning">Compliance & Moderation</span>
            <h1>Platform Food Catalog Moderation</h1>
            <p class="text-xs text-secondary">Inspect seller nutritional claims and disable non-compliant dishes with transparent reasons.</p>
          </div>

          <!-- Search & Filter Controls -->
          <div class="card filter-bar mb-6">
            <div class="search-input-wrap">
              <app-icon name="search" [size]="16" class="search-icon"></app-icon>
              <input
                type="text"
                class="form-control"
                placeholder="Search meal name, kitchen, or category..."
                [(ngModel)]="searchQuery"
                (ngModelChange)="filterProducts()"
              />
            </div>
            <select class="form-control status-select" [(ngModel)]="statusFilter" (ngModelChange)="filterProducts()">
              <option value="all">All Dishes ({{ allProducts.length }})</option>
              <option value="active">Active Marketplace Dishes</option>
              <option value="disabled">Disabled by Moderation</option>
            </select>
          </div>

          <!-- Products Table -->
          <div class="card table-panel">
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Meal Details</th>
                    <th>Kitchen Partner</th>
                    <th>Price</th>
                    <th class="text-center">Serving Size</th>
                    <th class="text-center">Macros (P / C / F / kcal)</th>
                    <th class="text-center">Moderation State</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let p of filteredProducts">
                    <td>
                      <div class="flex items-center gap-3">
                        <img [src]="p.imageUrl" [alt]="p.name" class="meal-thumb" />
                        <div>
                          <strong class="text-xs block">{{ p.name }}</strong>
                          <span class="text-xs text-secondary">{{ p.category }}</span>
                          <small class="text-danger block mt-1" *ngIf="p.isDisabled && p.disableReason">
                            Disabled: "{{ p.disableReason }}"
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="text-xs font-semibold">{{ getBusinessName(p.sellerId) }}</span>
                    </td>
                    <td class="text-xs font-bold">{{ p.price | currency:'PHP':'symbol' }}</td>
                    <td class="text-center text-xs text-secondary">{{ p.nutrition.servingSize }}</td>
                    <td class="text-center">
                      <div class="macro-block">
                        <strong class="text-xs text-primary">{{ p.nutrition.protein }}g Protein</strong>
                        <small class="text-tertiary block">{{ p.nutrition.carbs }}C / {{ p.nutrition.fat }}F &bull; {{ p.nutrition.calories }} kcal</small>
                      </div>
                    </td>
                    <td class="text-center">
                      <span class="badge" [class.badge-success]="!p.isDisabled" [class.badge-danger]="p.isDisabled">
                        {{ p.isDisabled ? 'Disabled' : 'Approved' }}
                      </span>
                    </td>
                    <td class="text-right">
                      <button
                        *ngIf="!p.isDisabled"
                        class="btn btn-outline btn-sm text-danger"
                        (click)="openDisableModal(p)"
                      >
                        Disable Dish
                      </button>
                      <button
                        *ngIf="p.isDisabled"
                        class="btn btn-success btn-sm"
                        (click)="enableProduct(p)"
                      >
                        Re-Enable
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal for Disabling Product with Mandatory Reason -->
    <div class="modal-overlay" *ngIf="showModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Disable Marketplace Meal</h3>
          <button class="modal-close" (click)="showModal = false">
            <app-icon name="x" [size]="20"></app-icon>
          </button>
        </div>
        <div class="modal-body">
          <p class="text-xs text-secondary mb-3">
            Target Meal: <strong>{{ selectedProduct?.name }}</strong> (Kitchen: {{ getBusinessName(selectedProduct?.sellerId || '') }})
          </p>
          <div class="form-group">
            <label class="form-label" for="disableReason">Mandatory Compliance / Infraction Reason *</label>
            <textarea
              id="disableReason"
              class="form-control"
              rows="3"
              placeholder="e.g. Unrealistic protein density claims; missing allergens warning..."
              [(ngModel)]="disableReason"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="showModal = false">Cancel</button>
          <button
            class="btn btn-danger"
            [disabled]="!disableReason.trim()"
            (click)="confirmDisable()"
          >
            Disable from Marketplace
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
      background: var(--color-bg-secondary);
    }
    .admin-main-content {
      flex: 1;
      margin-left: var(--sidebar-width);
      padding: var(--space-8) var(--space-6);
    }
    .admin-container {
      max-width: var(--container-max);
      margin: 0 auto;
    }
    .filter-bar {
      display: flex;
      gap: var(--space-4);
      padding: var(--space-3) var(--space-4);
      background: white;
      border: 1px solid var(--color-border);
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
    .status-select {
      width: 200px;
    }

    .table-panel {
      border: 1px solid var(--color-border);
      background: white;
    }
    .meal-thumb {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-sm);
      object-fit: cover;
    }
    .macro-block {
      display: flex;
      flex-direction: column;
    }

    @media (max-width: 900px) {
      .admin-main-content {
        margin-left: 0;
        padding: var(--space-4);
      }
      .filter-bar {
        flex-direction: column;
      }
      .status-select {
        width: 100%;
      }
    }
  `]
})
export class AdminProductsComponent implements OnInit {
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  searchQuery = '';
  statusFilter = 'all';

  showModal = false;
  selectedProduct: Product | null = null;
  disableReason = '';

  constructor(
    private productService: ProductService,
    private adminService: AdminService,
    private mockData: MockDataService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.allProducts = this.productService.getAllProducts();
    this.filterProducts();
  }

  filterProducts() {
    this.filteredProducts = this.allProducts.filter(p => {
      const matchSearch = !this.searchQuery ||
        p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        this.getBusinessName(p.sellerId).toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchStatus = this.statusFilter === 'all' ||
        (this.statusFilter === 'disabled' ? p.isDisabled : !p.isDisabled);

      return matchSearch && matchStatus;
    });
  }

  getBusinessName(sellerId: string): string {
    const biz = this.mockData.getBusinessBySellerId(sellerId);
    return biz ? biz.businessName : 'Kitchen Partner';
  }

  openDisableModal(product: Product) {
    this.selectedProduct = product;
    this.disableReason = '';
    this.showModal = true;
  }

  confirmDisable() {
    if (!this.selectedProduct || !this.disableReason.trim()) return;
    const admin = this.authService.user();
    this.adminService.disableProduct(this.selectedProduct.id, admin?.id || 'admin-1', this.disableReason);
    this.showModal = false;
    this.loadProducts();
  }

  enableProduct(product: Product) {
    const admin = this.authService.user();
    this.adminService.enableProduct(product.id, admin?.id || 'admin-1');
    this.loadProducts();
  }
}
