import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { MockDataService } from '../../services/mock-data.service';
import { ReportService } from '../../services/report.service';
import { Order, OrderItem, OrderStatus, Report, ReportStatus, Review } from '../../models';
import { CustomerNavComponent } from '../../shared/components/customer-nav.component';
import { PublicFooterComponent } from '../../shared/components/public-footer.component';
import { ReceiptModalComponent } from '../../shared/components/receipt-modal.component';
import { RateFoodModalComponent } from '../../shared/components/rate-food-modal.component';
import { ReportIssueModalComponent } from '../../shared/components/report-issue-modal.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-customer-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CustomerNavComponent,
    PublicFooterComponent,
    ReceiptModalComponent,
    RateFoodModalComponent,
    ReportIssueModalComponent,
    IconComponent
  ],
  template: `
    <app-customer-nav></app-customer-nav>

    <main class="page-content orders-page">
      <div class="container container-narrow">
        <div class="page-header flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1>My GymPlate Orders</h1>
            <p>Track live prep status, inspect itemized macros, and download digital receipts.</p>
          </div>
          <a routerLink="/customer/explore" class="btn btn-primary btn-sm">
            <app-icon name="plus" [size]="14"></app-icon>
            Order New Meal
          </a>
        </div>

        <!-- Filter Tabs -->
        <div class="filter-tabs card">
          <button
            class="tab-btn"
            [class.active]="activeFilter === 'all'"
            (click)="setFilter('all')"
          >
            All Orders ({{ orders.length }})
          </button>
          <button
            class="tab-btn"
            [class.active]="activeFilter === 'active'"
            (click)="setFilter('active')"
          >
            Active In-Progress ({{ countActive() }})
          </button>
          <button
            class="tab-btn"
            [class.active]="activeFilter === 'completed'"
            (click)="setFilter('completed')"
          >
            Completed / Delivered ({{ countCompleted() }})
          </button>
          <button
            class="tab-btn"
            [class.active]="activeFilter === 'cancelled'"
            (click)="setFilter('cancelled')"
          >
            Cancelled ({{ countCancelled() }})
          </button>
          <button
            class="tab-btn tab-btn-reports"
            [class.active]="activeFilter === 'reports'"
            (click)="setFilter('reports')"
          >
            <app-icon name="alert-triangle" [size]="13" color="#B45309"></app-icon>
            My Reports ({{ myReports.length }})
          </button>
        </div>

        <!-- Orders List (When not on reports tab) -->
        <div class="orders-list" *ngIf="activeFilter !== 'reports' && filteredOrders.length > 0">
          <div class="card order-card" *ngFor="let o of filteredOrders">
            <div class="order-card-header">
              <div class="order-meta-left">
                <span class="order-number font-mono">{{ o.orderNumber }}</span>
                <span class="order-date text-xs text-secondary">{{ o.createdAt | date:'medium' }}</span>
                <span class="kitchen-name text-xs">&bull; {{ o.businessName }}</span>
              </div>
              <div class="order-status-wrap">
                <span class="badge" [ngClass]="'badge-' + getStatusClass(o.status)">
                  {{ formatStatus(o.status) }}
                </span>
              </div>
            </div>

            <!-- Items preview -->
            <div class="order-items-snippet">
              <div class="item-pill" *ngFor="let item of o.items">
                <strong>{{ item.quantity }}x</strong> {{ item.productName }}
                <span class="macro-micro">({{ item.nutrition.calories }} kcal, {{ item.nutrition.protein }}g P)</span>
              </div>
            </div>

            <!-- Total and Actions Row -->
            <div class="order-card-footer">
              <div class="fulfillment-snippet">
                <app-icon [name]="o.fulfillmentType === 'delivery' ? 'truck' : 'store'" [size]="16" color="var(--color-text-secondary)"></app-icon>
                <span class="text-xs text-secondary capitalize">{{ o.fulfillmentType }} &bull; {{ o.paymentMethod === 'cash_on_pickup' ? 'Cash on Pickup' : 'Cash on Delivery' }}</span>
              </div>

              <div class="footer-actions-right">
                <span class="total-amount">{{ o.total | currency:'PHP':'symbol' }}</span>

                <!-- Eligible Delivered Actions -->
                <ng-container *ngIf="isDeliveredAndReceived(o)">
                  <span class="badge badge-success text-xs font-semibold" *ngIf="isAllReviewed(o)">
                    <app-icon name="check-circle" [size]="12"></app-icon>
                    Reviewed
                  </span>
                  <button
                    class="btn btn-outline btn-sm btn-rate"
                    *ngIf="!isAllReviewed(o)"
                    (click)="openRateOrder(o)"
                    title="Rate delivered food"
                  >
                    <app-icon name="star" [size]="14" color="#D97706"></app-icon>
                    Rate Food
                  </button>
                  <button
                    class="btn btn-ghost btn-sm text-secondary btn-report"
                    (click)="openReportOrder(o)"
                    title="Report a food quality issue or order mistake"
                  >
                    <app-icon name="alert-triangle" [size]="13" color="#B45309"></app-icon>
                    Report Issue
                  </button>
                </ng-container>

                <button class="btn btn-outline btn-sm" (click)="openReceipt(o)">
                  <app-icon name="receipt" [size]="14"></app-icon>
                  Receipt
                </button>
                <a [routerLink]="['/customer/orders', o.id]" class="btn btn-primary btn-sm">
                  View Status
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- My Reports Tab View -->
        <div class="reports-list-container" *ngIf="activeFilter === 'reports'">
          <div class="card reports-tab-card mb-4" *ngIf="myReports.length > 0">
            <div class="flex items-center justify-between mb-4 pb-3 border-bottom">
              <div>
                <h3 class="text-base font-bold m-0">Submitted Reports & Inquiries</h3>
                <p class="text-xs text-secondary mt-1">Review status, seller feedback, and administrator resolutions for your reported meals.</p>
              </div>
            </div>

            <div class="report-case-card mb-4" *ngFor="let rep of myReports">
              <div class="report-case-header">
                <div>
                  <span class="font-mono font-bold text-sm text-primary">{{ rep.referenceNumber }}</span>
                  <span class="text-xs text-secondary ml-2">&bull; Order #{{ rep.orderNumber }}</span>
                  <span class="text-xs text-secondary ml-2">&bull; {{ rep.businessName }}</span>
                </div>
                <span class="badge" [ngClass]="getReportStatusBadge(rep.status)">
                  {{ formatReportStatus(rep.status) }}
                </span>
              </div>

              <div class="report-food-item-line mt-2">
                <strong class="text-xs">Meal Item:</strong>
                <span class="text-xs ml-1 font-semibold">{{ rep.productName }}</span>
                <span class="meta-dot mx-1">&bull;</span>
                <span class="text-xs font-semibold text-danger">{{ rep.reason }}</span>
              </div>

              <p class="report-desc-text text-xs text-secondary mt-2 mb-2">
                "{{ rep.description }}"
              </p>

              <!-- Evidence Photos -->
              <div class="evidence-strip mt-2" *ngIf="rep.evidenceImages && rep.evidenceImages.length > 0">
                <span class="text-xs text-secondary block mb-1">Attached Evidence Photos:</span>
                <div class="flex gap-2">
                  <img
                    *ngFor="let img of rep.evidenceImages"
                    [src]="img"
                    class="evidence-mini-thumb"
                    alt="Evidence"
                  />
                </div>
              </div>

              <!-- Kitchen / Seller Reply -->
              <div class="seller-reply-box mt-3" *ngIf="rep.sellerResponse">
                <div class="flex items-center gap-1 mb-1">
                  <app-icon name="store" [size]="14" color="var(--color-primary)"></app-icon>
                  <strong class="text-xs text-primary">{{ rep.sellerResponse.respondedBy }} Response:</strong>
                  <span class="text-xs text-secondary ml-auto">{{ rep.sellerResponse.respondedAt | date:'short' }}</span>
                </div>
                <p class="text-xs mb-0">{{ rep.sellerResponse.response }}</p>
              </div>

              <!-- Admin Resolution -->
              <div class="admin-resolution-box mt-3" *ngIf="rep.adminResolution">
                <div class="flex items-center gap-1 mb-1">
                  <app-icon name="shield" [size]="14" color="#166534"></app-icon>
                  <strong class="text-xs text-success">Administrator Resolution:</strong>
                  <span class="text-xs text-secondary ml-auto">{{ rep.adminResolution.resolvedAt | date:'short' }}</span>
                </div>
                <div class="text-xs font-semibold text-success">{{ rep.adminResolution.actionTaken }}</div>
                <p class="text-xs text-secondary mb-0 mt-1">{{ rep.adminResolution.remarks }}</p>
              </div>

              <div class="mt-3 pt-2 flex justify-end">
                <a [routerLink]="['/customer/orders', rep.orderId]" class="text-xs font-semibold text-primary">
                  Inspect Order Details &rarr;
                </a>
              </div>
            </div>
          </div>

          <!-- Empty Reports State -->
          <div class="card empty-orders-state text-center" *ngIf="myReports.length === 0">
            <app-icon name="check-circle" [size]="48" color="var(--color-primary)"></app-icon>
            <h3>No Issues Reported</h3>
            <p class="text-secondary mt-1">You have not submitted any food quality reports or issues.</p>
          </div>
        </div>

        <!-- Empty Orders State (When on orders tabs) -->
        <div class="card empty-orders-state text-center" *ngIf="activeFilter !== 'reports' && filteredOrders.length === 0">
          <app-icon name="package" [size]="48" color="var(--color-text-tertiary)"></app-icon>
          <h3>No Orders Found</h3>
          <p class="text-secondary mt-1">There are no orders matching this filter tab.</p>
          <a routerLink="/customer/explore" class="btn btn-primary mt-4">Order High-Protein Food</a>
        </div>
      </div>
    </main>

    <!-- Official Printable Receipt Modal -->
    <app-receipt-modal
      [isOpen]="isReceiptOpen"
      [order]="selectedOrderForReceipt"
      (closeEvent)="isReceiptOpen = false"
    ></app-receipt-modal>

    <!-- Rate Food Modal -->
    <app-rate-food-modal
      [isOpen]="isRateModalOpen"
      [order]="selectedOrderForRate"
      [item]="selectedItemForRate"
      (closeEvent)="isRateModalOpen = false"
      (reviewSubmitted)="onReviewSubmitted($event)"
    ></app-rate-food-modal>

    <!-- Report Issue Modal -->
    <app-report-issue-modal
      [isOpen]="isReportModalOpen"
      [order]="selectedOrderForReport"
      [item]="selectedItemForReport"
      (closeEvent)="isReportModalOpen = false"
      (reportSubmitted)="onReportSubmitted($event)"
    ></app-report-issue-modal>

    <app-public-footer></app-public-footer>
  `,
  styles: [`
    .orders-page {
      background: var(--color-bg-secondary);
      min-height: 85vh;
    }
    .filter-tabs {
      display: flex;
      padding: 4px;
      margin-bottom: var(--space-6);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      overflow-x: auto;
    }
    .tab-btn {
      flex: 1;
      padding: 8px 12px;
      font-size: var(--font-size-xs);
      font-weight: 500;
      color: var(--color-text-secondary);
      background: none;
      border: none;
      border-radius: var(--radius-sm);
      cursor: pointer;
      white-space: nowrap;
      transition: all var(--transition-fast);
    }
    .tab-btn:hover {
      color: var(--color-text);
    }
    .tab-btn.active {
      background: white;
      color: var(--color-primary);
      font-weight: 700;
      box-shadow: var(--shadow-sm);
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
    .order-card {
      padding: var(--space-5);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
    }
    .order-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-3);
      padding-bottom: var(--space-3);
      border-bottom: 1px solid var(--color-border);
    }
    .order-meta-left {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-wrap: wrap;
    }
    .order-number {
      font-weight: 700;
      font-size: var(--font-size-sm);
    }

    .order-items-snippet {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: var(--space-4);
    }
    .item-pill {
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border);
      padding: 4px 10px;
      border-radius: var(--radius-sm);
      font-size: 11px;
      color: var(--color-text);
    }
    .macro-micro {
      color: var(--color-text-secondary);
      font-size: 10px;
      margin-left: 4px;
    }

    .order-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: var(--space-3);
      border-top: 1px solid var(--color-border);
      flex-wrap: wrap;
      gap: var(--space-3);
    }
    .fulfillment-snippet {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .footer-actions-right {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }
    .total-amount {
      font-size: var(--font-size-base);
      font-weight: 700;
      color: var(--color-primary);
    }

    .empty-orders-state {
      padding: var(--space-16) var(--space-6);
      border: 1px solid var(--color-border);
    }

    .tab-btn-reports {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
    .btn-rate {
      border-color: #F59E0B;
      color: #B45309;
    }
    .btn-rate:hover {
      background: #FEF3C7;
    }
    .btn-report:hover {
      background: #FEF2F2;
      color: #DC2626;
    }

    /* Reports Tab Styling */
    .reports-tab-card {
      border: 1px solid var(--color-border);
      padding: var(--space-6);
    }
    .report-case-card {
      background: #FAFAFA;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 14px 16px;
    }
    .report-case-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .evidence-mini-thumb {
      width: 48px;
      height: 48px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-border);
    }
    .seller-reply-box {
      background: #F0FDF4;
      border: 1px solid #DCFCE7;
      border-radius: var(--radius-sm);
      padding: 8px 12px;
    }
    .admin-resolution-box {
      background: #EFF6FF;
      border: 1px solid #DBEAFE;
      border-radius: var(--radius-sm);
      padding: 8px 12px;
    }
  `]
})
export class CustomerOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  myReports: Report[] = [];
  activeFilter: 'all' | 'active' | 'completed' | 'cancelled' | 'reports' = 'all';

  isReceiptOpen = false;
  selectedOrderForReceipt: Order | null = null;

  isRateModalOpen = false;
  selectedOrderForRate: Order | null = null;
  selectedItemForRate: OrderItem | null = null;

  isReportModalOpen = false;
  selectedOrderForReport: Order | null = null;
  selectedItemForReport: OrderItem | null = null;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private mockData: MockDataService,
    private reportService: ReportService
  ) {}

  ngOnInit() {
    this.loadOrders();
    this.loadReports();
  }

  loadOrders() {
    const user = this.authService.user();
    if (user) {
      this.orders = this.orderService.getCustomerOrders(user.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      this.applyFilter();
    }
  }

  loadReports() {
    const user = this.authService.user();
    if (user) {
      this.myReports = this.reportService.getCustomerReports(user.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  setFilter(filter: 'all' | 'active' | 'completed' | 'cancelled' | 'reports') {
    this.activeFilter = filter;
    this.applyFilter();
  }

  applyFilter() {
    if (this.activeFilter === 'all') {
      this.filteredOrders = this.orders;
    } else if (this.activeFilter === 'active') {
      this.filteredOrders = this.orders.filter(o =>
        ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.status)
      );
    } else if (this.activeFilter === 'completed') {
      this.filteredOrders = this.orders.filter(o =>
        ['completed', 'delivered'].includes(o.status)
      );
    } else if (this.activeFilter === 'cancelled') {
      this.filteredOrders = this.orders.filter(o => o.status === 'cancelled');
    }
  }

  isDeliveredAndReceived(o: Order): boolean {
    if (o.status === 'delivered') return true;
    if (o.status === 'completed') return true;
    return false;
  }

  isAllReviewed(o: Order): boolean {
    if (!o.items || o.items.length === 0) return false;
    return o.items.every(item => this.mockData.hasReviewedItem(o.id, item.productId));
  }

  openRateOrder(o: Order, item?: OrderItem) {
    this.selectedOrderForRate = o;
    // Pick first unreviewed item
    const unreviewed = o.items.find(i => !this.mockData.hasReviewedItem(o.id, i.productId));
    this.selectedItemForRate = item || unreviewed || o.items[0];
    this.isRateModalOpen = true;
  }

  openReportOrder(o: Order, item?: OrderItem) {
    this.selectedOrderForReport = o;
    this.selectedItemForReport = item || (o.items.length > 0 ? o.items[0] : null);
    this.isReportModalOpen = true;
  }

  onReviewSubmitted(review: Review) {
    this.loadOrders();
  }

  onReportSubmitted(report: Report) {
    this.loadReports();
    this.activeFilter = 'reports';
  }

  getReportStatusBadge(status: ReportStatus): string {
    switch (status) {
      case 'submitted': return 'badge-warning';
      case 'under_review': return 'badge-info';
      case 'resolved': return 'badge-success';
      case 'rejected': return 'badge-danger';
      default: return 'badge-neutral';
    }
  }

  formatReportStatus(status: ReportStatus): string {
    switch (status) {
      case 'submitted': return 'Submitted';
      case 'under_review': return 'Under Review';
      case 'resolved': return 'Resolved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  }

  countActive(): number {
    return this.orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.status)).length;
  }

  countCompleted(): number {
    return this.orders.filter(o => ['completed', 'delivered'].includes(o.status)).length;
  }

  countCancelled(): number {
    return this.orders.filter(o => o.status === 'cancelled').length;
  }

  getStatusClass(status: OrderStatus): string {
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

  formatStatus(status: OrderStatus): string {
    return this.orderService.formatStatus(status);
  }

  openReceipt(order: Order) {
    this.selectedOrderForReceipt = order;
    this.isReceiptOpen = true;
  }
}
