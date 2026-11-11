import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SellerService } from '../../services/seller.service';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { Order, Product, SellerApplication } from '../../models';
import { SellerSidebarComponent } from '../../shared/components/seller-sidebar.component';
import { ReceiptModalComponent } from '../../shared/components/receipt-modal.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SellerSidebarComponent, ReceiptModalComponent, IconComponent],
  template: `
    <div class="seller-layout">
      <app-seller-sidebar></app-seller-sidebar>

      <main class="seller-main-content">
        <div class="seller-container">
          <!-- Page Header -->
          <div class="page-header flex justify-between items-center flex-wrap gap-4 mb-6">
            <div>
              <span class="text-xs font-bold uppercase text-primary">Kitchen Overview</span>
              <h1>{{ businessName() }} Dashboard</h1>
              <p class="text-xs text-secondary">Manage daily preparation pipelines, track inventory macros, and fulfill orders.</p>
            </div>
            <div class="flex gap-2">
              <a routerLink="/seller/products/add" class="btn btn-primary btn-sm" [class.disabled-btn]="!isApproved()">
                <app-icon name="plus" [size]="14"></app-icon>
                Add Meal
              </a>
              <a routerLink="/seller/orders" class="btn btn-secondary btn-sm">
                <app-icon name="clipboard-list" [size]="14"></app-icon>
                View Orders
              </a>
            </div>
          </div>

          <!-- Application Status Banner if not approved -->
          <div class="status-alert-card card mb-6" *ngIf="!isApproved()">
            <div class="flex items-start gap-3">
              <app-icon name="alert-triangle" [size]="24" color="var(--color-warning)"></app-icon>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <strong class="text-sm">Verification Status: {{ formatStatus(application?.status || '') }}</strong>
                  <span class="badge" [ngClass]="'badge-' + (application?.status === 'rejected' ? 'danger' : 'warning')">
                    {{ application?.status }}
                  </span>
                </div>
                <p class="text-xs text-secondary mt-1" *ngIf="application?.status === 'pending'">
                  Your kitchen application is currently queued for administrator document verification. Publishing products to the marketplace is temporarily locked.
                </p>
                <p class="text-xs text-danger mt-1" *ngIf="application?.status === 'rejected'">
                  Rejection Reason: {{ application?.rejectionReason || 'Please resubmit valid commercial credentials.' }}
                </p>
                <p class="text-xs text-info mt-1" *ngIf="application?.status === 'info_required'">
                  Notice from Compliance: {{ application?.infoRequestReason || 'Additional identity verification needed.' }}
                </p>
              </div>
              <a routerLink="/seller/pending" class="btn btn-secondary btn-sm">Review Status</a>
            </div>
          </div>

          <!-- Top Metric Cards -->
          <div class="grid-4 metric-grid mb-6">
            <div class="metric-card card">
              <div class="metric-header">
                <span class="metric-title">Gross Sales</span>
                <div class="m-icon-box primary">
                  <app-icon name="dollar-sign" [size]="18" color="var(--color-primary)"></app-icon>
                </div>
              </div>
              <div class="metric-num">{{ totalSales | currency:'PHP':'symbol' }}</div>
              <span class="metric-trend text-success">&#x25B2; Real-time order sync</span>
            </div>

            <div class="metric-card card">
              <div class="metric-header">
                <span class="metric-title">Pending Orders</span>
                <div class="m-icon-box warning">
                  <app-icon name="clock" [size]="18" color="var(--color-warning)"></app-icon>
                </div>
              </div>
              <div class="metric-num">{{ pendingOrdersCount }}</div>
              <span class="metric-sub">Awaiting confirmation</span>
            </div>

            <div class="metric-card card">
              <div class="metric-header">
                <span class="metric-title">Active Menu Items</span>
                <div class="m-icon-box info">
                  <app-icon name="package" [size]="18" color="var(--color-info)"></app-icon>
                </div>
              </div>
              <div class="metric-num">{{ myProducts.length }}</div>
              <span class="metric-sub">{{ lowStockCount }} low in stock (&lt; 10)</span>
            </div>

            <div class="metric-card card">
              <div class="metric-header">
                <span class="metric-title">Total Orders</span>
                <div class="m-icon-box neutral">
                  <app-icon name="check-circle" [size]="18" color="var(--color-success)"></app-icon>
                </div>
              </div>
              <div class="metric-num">{{ myOrders.length }}</div>
              <span class="metric-sub">{{ completedOrdersCount }} completed</span>
            </div>
          </div>

          <!-- Low Stock Alert Banner if any -->
          <div class="low-stock-alert card mb-6" *ngIf="lowStockCount > 0">
            <app-icon name="alert-triangle" [size]="20" color="var(--color-warning)"></app-icon>
            <div class="flex-1">
              <span class="text-xs font-semibold text-warning">Inventory Notice: {{ lowStockCount }} meal(s) approaching sold-out threshold</span>
              <p class="text-xs text-secondary">Update stock quantities in the Inventory manager to prevent customer checkout blocks.</p>
            </div>
            <a routerLink="/seller/inventory" class="btn btn-secondary btn-sm">Manage Inventory</a>
          </div>

          <!-- 2 Columns: Recent Orders & Quick Products -->
          <div class="dashboard-content-grid">
            <!-- Left: Recent Orders Queue -->
            <div class="card panel-card">
              <div class="panel-header flex justify-between items-center mb-4">
                <div>
                  <h3>Recent Customer Orders</h3>
                  <p class="text-xs text-secondary">Incoming kitchen preparation queue</p>
                </div>
                <a routerLink="/seller/orders" class="btn btn-ghost btn-sm">All Orders &rarr;</a>
              </div>

              <div class="table-container" *ngIf="recentOrders.length > 0">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th class="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let o of recentOrders">
                      <td class="font-mono text-xs font-semibold">{{ o.orderNumber }}</td>
                      <td>
                        <span class="text-xs font-medium">{{ o.customerName }}</span>
                        <small class="text-tertiary block capitalize">{{ o.fulfillmentType }}</small>
                      </td>
                      <td class="text-xs">{{ o.items.length }} dishes</td>
                      <td class="text-xs font-semibold">{{ o.total | currency:'PHP':'symbol' }}</td>
                      <td>
                        <span class="badge" [ngClass]="'badge-' + getStatusBadgeClass(o.status)">
                          {{ formatStatus(o.status) }}
                        </span>
                      </td>
                      <td class="text-right">
                        <button class="btn btn-ghost btn-sm" (click)="openReceipt(o)" title="Receipt">
                          <app-icon name="receipt" [size]="14"></app-icon>
                        </button>
                        <a [routerLink]="['/seller/orders', o.id]" class="btn btn-primary btn-sm">
                          Manage
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="empty-state py-8 text-center" *ngIf="recentOrders.length === 0">
                <p class="text-xs text-secondary">No customer orders recorded yet.</p>
              </div>
            </div>

            <!-- Right: Menu Quick View -->
            <div class="card panel-card">
              <div class="panel-header flex justify-between items-center mb-4">
                <div>
                  <h3>Menu & Macro Catalog</h3>
                  <p class="text-xs text-secondary">Top listed fitness meals</p>
                </div>
                <a routerLink="/seller/products" class="btn btn-ghost btn-sm">Catalog &rarr;</a>
              </div>

              <div class="product-mini-list">
                <div class="mini-prod-item" *ngFor="let p of myProducts.slice(0, 5)">
                  <img [src]="p.imageUrl" [alt]="p.name" class="mini-thumb" />
                  <div class="mini-details">
                    <span class="mini-name">{{ p.name }}</span>
                    <span class="mini-macros text-xs text-secondary">
                      {{ p.nutrition.calories }} kcal &bull; <strong>{{ p.nutrition.protein }}g P</strong>
                    </span>
                  </div>
                  <div class="mini-stock-status">
                    <span class="price text-xs font-bold">{{ p.price | currency:'PHP':'symbol' }}</span>
                    <span class="stock-pill" [class.low]="p.stock <= 5" [class.out]="p.stock === 0">
                      {{ p.stock }} in stock
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Receipt Modal -->
    <app-receipt-modal
      [isOpen]="isReceiptOpen"
      [order]="selectedOrder"
      (closeEvent)="isReceiptOpen = false"
    ></app-receipt-modal>
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
      transition: margin-left var(--transition);
    }
    .seller-container {
      max-width: var(--container-max);
      margin: 0 auto;
    }

    .metric-grid {
      gap: var(--space-4);
    }
    .metric-card {
      padding: var(--space-5);
      border: 1px solid var(--color-border);
      background: white;
    }
    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-2);
    }
    .metric-title {
      font-size: var(--font-size-xs);
      font-weight: 600;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .m-icon-box {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .m-icon-box.primary { background: var(--color-primary-light); }
    .m-icon-box.warning { background: var(--color-warning-bg); }
    .m-icon-box.info { background: var(--color-info-bg); }
    .m-icon-box.neutral { background: var(--color-success-bg); }

    .metric-num {
      font-size: 1.875rem;
      font-weight: 800;
      color: var(--color-text);
      line-height: 1.2;
    }
    .metric-sub {
      font-size: 11px;
      color: var(--color-text-secondary);
      margin-top: 4px;
      display: block;
    }
    .metric-trend {
      font-size: 11px;
      margin-top: 4px;
      display: block;
    }

    .status-alert-card {
      padding: var(--space-4) var(--space-5);
      background: #FFFBEB;
      border: 1px solid #FCD34D;
      border-radius: var(--radius-md);
    }
    .low-stock-alert {
      padding: var(--space-3) var(--space-4);
      background: #FEF3C7;
      border: 1px solid #F59E0B;
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .dashboard-content-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: var(--space-6);
    }
    .panel-card {
      padding: var(--space-5);
      border: 1px solid var(--color-border);
      background: white;
    }
    .panel-header h3 {
      font-size: var(--font-size-base);
    }

    .product-mini-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
    .mini-prod-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding-bottom: var(--space-2);
      border-bottom: 1px solid var(--color-border);
    }
    .mini-thumb {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-sm);
      object-fit: cover;
    }
    .mini-details {
      flex: 1;
    }
    .mini-name {
      font-size: var(--font-size-xs);
      font-weight: 600;
      display: block;
    }
    .mini-stock-status {
      text-align: right;
    }
    .stock-pill {
      display: block;
      font-size: 10px;
      color: var(--color-text-secondary);
    }
    .stock-pill.low { color: var(--color-warning); font-weight: 600; }
    .stock-pill.out { color: var(--color-danger); font-weight: 700; }

    .disabled-btn {
      opacity: 0.5;
      pointer-events: none;
    }

    @media (max-width: 900px) {
      .seller-main-content {
        margin-left: 0;
        padding: var(--space-4);
      }
      .dashboard-content-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SellerDashboardComponent implements OnInit {
  application: SellerApplication | undefined;
  myProducts: Product[] = [];
  myOrders: Order[] = [];
  recentOrders: Order[] = [];
  totalSales = 0;
  pendingOrdersCount = 0;
  completedOrdersCount = 0;
  lowStockCount = 0;

  isReceiptOpen = false;
  selectedOrder: Order | null = null;

  constructor(
    private authService: AuthService,
    private sellerService: SellerService,
    private orderService: OrderService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    const user = this.authService.user();
    if (user) {
      this.application = this.sellerService.getApplication(user.id);
      this.myProducts = this.productService.getProductsBySeller(user.id);
      this.myOrders = this.orderService.getSellerOrders(user.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      this.recentOrders = this.myOrders.slice(0, 5);

      this.totalSales = this.myOrders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.subtotal, 0);

      this.pendingOrdersCount = this.myOrders.filter(o => o.status === 'pending').length;
      this.completedOrdersCount = this.myOrders.filter(o => o.status === 'completed' || o.status === 'delivered').length;
      this.lowStockCount = this.myProducts.filter(p => p.stock > 0 && p.stock <= 10).length;
    }
  }

  isApproved(): boolean {
    const user = this.authService.user();
    return user ? this.sellerService.isApproved(user.id) : false;
  }

  businessName(): string {
    const user = this.authService.user();
    if (!user) return 'Seller';
    const biz = this.sellerService.getBusiness(user.id);
    return biz ? biz.businessName : 'FitFuel Kitchen';
  }

  formatStatus(status: string): string {
    return this.orderService.formatStatus(status as any);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'completed':
      case 'delivered': return 'success';
      case 'pending': return 'warning';
      case 'confirmed':
      case 'preparing':
      case 'ready':
      case 'out_for_delivery': return 'info';
      case 'cancelled': return 'danger';
      default: return 'neutral';
    }
  }

  openReceipt(order: Order) {
    this.selectedOrder = order;
    this.isReceiptOpen = true;
  }
}
