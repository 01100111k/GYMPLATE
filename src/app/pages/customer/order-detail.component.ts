import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { MockDataService } from '../../services/mock-data.service';
import { ReportService } from '../../services/report.service';
import { Order, OrderItem, OrderStatus, Review, Report, ReportStatus } from '../../models';
import { CustomerNavComponent } from '../../shared/components/customer-nav.component';
import { PublicFooterComponent } from '../../shared/components/public-footer.component';
import { ReceiptModalComponent } from '../../shared/components/receipt-modal.component';
import { RateFoodModalComponent } from '../../shared/components/rate-food-modal.component';
import { ReportIssueModalComponent } from '../../shared/components/report-issue-modal.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-order-detail',
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

    <main class="page-content order-detail-page" *ngIf="order">
      <div class="container container-narrow">
        <!-- New Order Alert Banner if just redirected -->
        <div class="alert alert-success mb-4" *ngIf="isNewlyPlaced">
          <app-icon name="check-circle" [size]="18"></app-icon>
          <div>
            <strong>Order Placed Successfully!</strong>
            <p class="text-xs mt-1">Order #{{ order.orderNumber }} has been dispatched to {{ order.businessName }}.</p>
          </div>
        </div>

        <!-- Back Button & Header -->
        <div class="page-header flex justify-between items-center flex-wrap gap-4 mb-6">
          <div>
            <a routerLink="/customer/orders" class="text-xs text-secondary mb-1 block">&larr; Back to Order History</a>
            <h1>Order #{{ order.orderNumber }}</h1>
            <p class="text-xs text-secondary">Placed on {{ order.createdAt | date:'medium' }} &bull; Kitchen: {{ order.businessName }}</p>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-outline btn-sm" (click)="isReceiptOpen = true">
              <app-icon name="receipt" [size]="16"></app-icon>
              View Receipt
            </button>
            <button
              class="btn btn-danger btn-sm"
              *ngIf="canCancel()"
              (click)="cancelOrder()"
            >
              Cancel Order
            </button>
          </div>
        </div>

        <!-- Order Status Timeline Track -->
        <div class="card timeline-card mb-6">
          <div class="timeline-header flex justify-between items-center mb-6">
            <div>
              <span class="text-xs font-bold uppercase text-primary">Live Progress Tracker</span>
              <h3 class="mt-1">Current State: {{ formatStatus(order.status) }}</h3>
            </div>
            <span class="badge" [ngClass]="'badge-' + getStatusClass(order.status)">
              {{ formatStatus(order.status) }}
            </span>
          </div>

          <!-- Stepper Graphic -->
          <div class="stepper-horizontal" *ngIf="order.status !== 'cancelled'">
            <div
              class="step-node"
              *ngFor="let s of getTimelineSteps(); let i = index"
              [class.completed]="isStepCompleted(s.key)"
              [class.current]="order.status === s.key"
            >
              <div class="node-circle">
                <app-icon name="check" [size]="14" *ngIf="isStepCompleted(s.key) && order.status !== s.key"></app-icon>
                <span *ngIf="!isStepCompleted(s.key) || order.status === s.key">{{ i + 1 }}</span>
              </div>
              <span class="node-label">{{ s.label }}</span>
            </div>
          </div>

          <!-- Cancelled Notice if Cancelled -->
          <div class="cancelled-banner alert alert-danger" *ngIf="order.status === 'cancelled'">
            <app-icon name="x-circle" [size]="20"></app-icon>
            <div>
              <strong>Order Cancelled</strong>
              <p class="text-xs mt-1">This order was cancelled. Reserved meal stock has been replenished.</p>
            </div>
          </div>
        </div>

        <!-- 2 Column Order Details -->
        <div class="order-content-grid">
          <!-- Left: Items and Macros -->
          <div class="items-column">
            <div class="card detail-card">
              <h3>Items Ordered</h3>
              <div class="items-list">
                <div class="order-item-row" *ngFor="let item of order.items">
                  <div class="item-img-thumb">
                    <img [src]="item.productImageUrl" [alt]="item.productName" />
                  </div>
                  <div class="item-info">
                    <span class="item-name">{{ item.productName }}</span>
                    <span class="item-qty-price">{{ item.quantity }}x @ {{ item.unitPrice | currency:'PHP':'symbol' }}</span>
                    <div class="item-macro-line">
                      <span>{{ item.nutrition.calories }} kcal</span> &bull;
                      <span>{{ item.nutrition.protein }}g protein</span> &bull;
                      <span>{{ item.nutrition.carbs }}g carbs</span> &bull;
                      <span>{{ item.nutrition.fat }}g fat</span>
                    </div>

                    <!-- Feedback & Report Row (Only when delivered and received) -->
                    <div class="item-actions-row mt-3" *ngIf="isDeliveredAndReceived()">
                      <!-- Reviewed Badge -->
                      <div class="reviewed-pill" *ngIf="hasReviewedItem(item.productId)">
                        <app-icon name="check-circle" [size]="14" color="var(--color-primary)"></app-icon>
                        <span>Reviewed &bull; {{ getReviewForItem(item.productId)?.rating }} &starf;</span>
                      </div>

                      <!-- Rate Food Button (If not reviewed) -->
                      <button
                        type="button"
                        class="btn btn-outline btn-xs"
                        *ngIf="!hasReviewedItem(item.productId)"
                        (click)="openRateModal(item)"
                      >
                        <app-icon name="star" [size]="13" color="#D97706"></app-icon>
                        Rate Food
                      </button>

                      <!-- Report Issue Button -->
                      <button
                        type="button"
                        class="btn btn-ghost btn-xs text-secondary-btn"
                        (click)="openReportModal(item)"
                        title="Report quality issue or discrepancy with this meal"
                      >
                        <app-icon name="alert-triangle" [size]="13" color="#B45309"></app-icon>
                        Report an Issue
                      </button>
                    </div>

                    <!-- Ineligible state notice if not yet delivered -->
                    <div class="ineligible-feedback-hint mt-2" *ngIf="!isDeliveredAndReceived() && order.status !== 'cancelled'">
                      <app-icon name="clock" [size]="12" color="var(--color-text-tertiary)"></app-icon>
                      <span>Rating & issue reporting unlock once order is delivered.</span>
                    </div>
                  </div>
                  <div class="item-line-total">{{ item.subtotal | currency:'PHP':'symbol' }}</div>
                </div>
              </div>

              <!-- Cumulative Macros Summary -->
              <div class="cumulative-macro-box mt-4">
                <span class="macro-head">Order Macronutrient Totals:</span>
                <div class="macro-grid-4">
                  <div class="c-cell">
                    <strong>{{ totalNutrition().calories }}</strong>
                    <small>Calories</small>
                  </div>
                  <div class="c-cell highlight">
                    <strong>{{ totalNutrition().protein }}g</strong>
                    <small>Protein</small>
                  </div>
                  <div class="c-cell">
                    <strong>{{ totalNutrition().carbs }}g</strong>
                    <small>Carbs</small>
                  </div>
                  <div class="c-cell">
                    <strong>{{ totalNutrition().fat }}g</strong>
                    <small>Fat</small>
                  </div>
                </div>
              </div>

              <!-- Submitted Quality Reports Section for This Order -->
              <div class="order-reports-section mt-5 pt-4 border-top" *ngIf="orderReports.length > 0">
                <div class="flex items-center gap-2 mb-3">
                  <app-icon name="alert-triangle" [size]="16" color="#B45309"></app-icon>
                  <h4 class="text-sm font-bold m-0">Submitted Reports for this Order ({{ orderReports.length }})</h4>
                </div>

                <div class="case-card mb-3" *ngFor="let rep of orderReports">
                  <div class="case-card-header">
                    <div>
                      <span class="font-mono font-bold text-xs">{{ rep.referenceNumber }}</span>
                      <span class="text-xs text-secondary ml-2">&bull; {{ rep.productName }}</span>
                    </div>
                    <span class="badge" [ngClass]="getReportStatusBadge(rep.status)">
                      {{ formatReportStatus(rep.status) }}
                    </span>
                  </div>

                  <div class="case-reason-line mt-2">
                    <span class="text-xs font-semibold text-secondary">Reason:</span>
                    <span class="text-xs ml-1">{{ rep.reason }}</span>
                  </div>

                  <p class="case-desc text-xs text-secondary mt-1 mb-2">
                    "{{ rep.description }}"
                  </p>

                  <!-- Evidence Thumbnails -->
                  <div class="evidence-strip mt-2" *ngIf="rep.evidenceImages && rep.evidenceImages.length > 0">
                    <span class="text-xs text-secondary block mb-1">Evidence Photos:</span>
                    <div class="flex gap-2">
                      <img
                        *ngFor="let img of rep.evidenceImages"
                        [src]="img"
                        class="evidence-mini-thumb"
                        alt="Evidence photo"
                      />
                    </div>
                  </div>

                  <!-- Kitchen Response -->
                  <div class="seller-reply-box mt-3" *ngIf="rep.sellerResponse">
                    <div class="flex items-center gap-1 mb-1">
                      <app-icon name="store" [size]="13" color="var(--color-primary)"></app-icon>
                      <strong class="text-xs text-primary">{{ rep.sellerResponse.respondedBy }} Response:</strong>
                      <span class="text-xs text-secondary ml-auto">{{ rep.sellerResponse.respondedAt | date:'short' }}</span>
                    </div>
                    <p class="text-xs mb-0">{{ rep.sellerResponse.response }}</p>
                  </div>

                  <!-- Admin Resolution -->
                  <div class="admin-resolution-box mt-3" *ngIf="rep.adminResolution">
                    <div class="flex items-center gap-1 mb-1">
                      <app-icon name="shield" [size]="13" color="#166534"></app-icon>
                      <strong class="text-xs text-success">Administrator Resolution:</strong>
                      <span class="text-xs text-secondary ml-auto">{{ rep.adminResolution.resolvedAt | date:'short' }}</span>
                    </div>
                    <div class="text-xs font-semibold text-success">{{ rep.adminResolution.actionTaken }}</div>
                    <p class="text-xs text-secondary mb-0 mt-1">{{ rep.adminResolution.remarks }}</p>
                  </div>
                </div>
              </div>

              <!-- Special Instructions -->
              <div class="special-notes-box mt-4" *ngIf="order.specialInstructions">
                <span class="text-xs font-semibold text-secondary">Customer Preparation Notes:</span>
                <p class="text-xs mt-1">{{ order.specialInstructions }}</p>
              </div>
            </div>
          </div>

          <!-- Right: Fulfillment & Payment Breakdown -->
          <div class="summary-column">
            <!-- Fulfillment Details Card -->
            <div class="card detail-card">
              <h3>Fulfillment & Handover</h3>
              <div class="info-block">
                <span class="lbl">Fulfillment Type:</span>
                <span class="val font-semibold capitalize">{{ order.fulfillmentType }}</span>
              </div>
              <div class="info-block" *ngIf="order.fulfillmentType === 'delivery'">
                <span class="lbl">Delivery Address:</span>
                <span class="val">{{ order.customerAddress }}</span>
              </div>
              <div class="info-block">
                <span class="lbl">Contact Phone:</span>
                <span class="val">{{ order.customerPhone }}</span>
              </div>
              <div class="info-block">
                <span class="lbl">Kitchen Partner:</span>
                <span class="val">{{ order.businessName }} ({{ order.sellerName }})</span>
              </div>
            </div>

            <!-- Payment Summary Card -->
            <div class="card detail-card mt-4">
              <h3>Payment Breakdown</h3>
              <div class="calc-row">
                <span>Items Subtotal:</span>
                <span>{{ order.subtotal | currency:'PHP':'symbol' }}</span>
              </div>
              <div class="calc-row">
                <span>Delivery Fee:</span>
                <span>{{ order.deliveryFee | currency:'PHP':'symbol' }}</span>
              </div>
              <div class="calc-row">
                <span>Platform Service Fee:</span>
                <span>{{ order.serviceFee | currency:'PHP':'symbol' }}</span>
              </div>
              <div class="divider"></div>
              <div class="calc-row grand-total">
                <span>Total Amount:</span>
                <span class="text-primary">{{ order.total | currency:'PHP':'symbol' }}</span>
              </div>
              <div class="payment-method-row mt-3">
                <span class="badge badge-neutral">
                  {{ order.paymentMethod === 'cash_on_pickup' ? 'Cash on Pickup' : 'Cash on Delivery' }}
                </span>
                <span class="badge" [class.badge-success]="order.paymentStatus === 'paid'" [class.badge-warning]="order.paymentStatus === 'pending'">
                  {{ order.paymentStatus === 'paid' ? 'Paid' : 'Payment Pending' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Printable Receipt Modal -->
    <app-receipt-modal
      [isOpen]="isReceiptOpen"
      [order]="order"
      (closeEvent)="isReceiptOpen = false"
    ></app-receipt-modal>

    <!-- Rate Food Modal -->
    <app-rate-food-modal
      [isOpen]="isRateModalOpen"
      [order]="order"
      [item]="selectedItemForRate"
      (closeEvent)="isRateModalOpen = false"
      (reviewSubmitted)="onReviewSubmitted($event)"
    ></app-rate-food-modal>

    <!-- Report Issue Modal -->
    <app-report-issue-modal
      [isOpen]="isReportModalOpen"
      [order]="order"
      [item]="selectedItemForReport"
      (closeEvent)="isReportModalOpen = false"
      (reportSubmitted)="onReportSubmitted($event)"
    ></app-report-issue-modal>

    <app-public-footer></app-public-footer>
  `,
  styles: [`
    .order-detail-page {
      background: var(--color-bg-secondary);
      min-height: 85vh;
    }
    .timeline-card {
      padding: var(--space-6);
      border: 1px solid var(--color-border);
    }
    .stepper-horizontal {
      display: flex;
      justify-content: space-between;
      position: relative;
      margin: var(--space-4) 0;
    }
    .step-node {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      position: relative;
      z-index: 2;
    }
    .node-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--color-bg-secondary);
      border: 2px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      color: var(--color-text-secondary);
    }
    .step-node.completed .node-circle {
      border-color: var(--color-primary);
      background: var(--color-primary-light);
      color: var(--color-primary);
    }
    .step-node.current .node-circle {
      border-color: var(--color-primary);
      background: var(--color-primary);
      color: white;
    }
    .node-label {
      font-size: 11px;
      color: var(--color-text-secondary);
      font-weight: 500;
    }
    .step-node.current .node-label {
      color: var(--color-primary);
      font-weight: 700;
    }

    .order-content-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: var(--space-6);
    }
    .detail-card {
      padding: var(--space-6);
      border: 1px solid var(--color-border);
    }
    .detail-card h3 {
      font-size: var(--font-size-base);
      margin-bottom: var(--space-4);
      padding-bottom: var(--space-2);
      border-bottom: 1px solid var(--color-border);
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
    .order-item-row {
      display: flex;
      gap: var(--space-3);
      align-items: center;
      padding-bottom: var(--space-3);
      border-bottom: 1px solid var(--color-border);
    }
    .item-img-thumb {
      width: 60px;
      height: 60px;
      border-radius: var(--radius);
      overflow: hidden;
      flex-shrink: 0;
      background: var(--color-bg-secondary);
    }
    .item-img-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .item-info {
      flex: 1;
    }
    .item-name {
      font-size: var(--font-size-xs);
      font-weight: 600;
      display: block;
    }
    .item-qty-price {
      font-size: 11px;
      color: var(--color-text-secondary);
    }
    .item-macro-line {
      font-size: 10px;
      color: var(--color-text-tertiary);
      margin-top: 2px;
    }
    .item-line-total {
      font-size: var(--font-size-xs);
      font-weight: 700;
      color: var(--color-text);
    }

    .cumulative-macro-box {
      background: var(--color-primary-lighter);
      padding: var(--space-3);
      border-radius: var(--radius);
      border: 1px solid rgba(45, 90, 61, 0.2);
    }
    .macro-head {
      font-size: 11px;
      font-weight: 700;
      color: var(--color-primary);
      display: block;
      margin-bottom: 6px;
    }
    .macro-grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 4px;
      text-align: center;
    }
    .c-cell strong {
      display: block;
      font-size: 11px;
    }
    .c-cell.highlight strong {
      color: var(--color-primary);
    }
    .c-cell small {
      font-size: 9px;
      color: var(--color-text-secondary);
    }

    .info-block {
      display: flex;
      justify-content: space-between;
      font-size: var(--font-size-xs);
      margin-bottom: var(--space-2);
    }
    .info-block .lbl {
      color: var(--color-text-secondary);
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
    .payment-method-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .alert {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: 12px 14px;
      border-radius: var(--radius);
    }
    .alert-success {
      background: var(--color-success-bg);
      color: #166534;
      border: 1px solid rgba(40, 167, 69, 0.3);
    }
    .alert-danger {
      background: var(--color-danger-bg);
      color: #991B1B;
      border: 1px solid rgba(220, 53, 69, 0.3);
    }

    /* Feedback & Reporting Actions in Item Row */
    .item-actions-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .reviewed-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: #F0FDF4;
      color: #166534;
      border: 1px solid #BBF7D0;
      padding: 3px 8px;
      border-radius: var(--radius-full);
      font-size: 11px;
      font-weight: 600;
    }
    .text-secondary-btn {
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border);
      background: white;
    }
    .text-secondary-btn:hover {
      background: #FEF2F2;
      color: #DC2626;
      border-color: #FECACA;
    }
    .ineligible-feedback-hint {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      color: var(--color-text-tertiary);
    }

    /* Reports Section in Order Details */
    .order-reports-section {
      border-top: 1px solid var(--color-border);
    }
    .case-card {
      background: #FAFAFA;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 12px 14px;
    }
    .case-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }
    .evidence-mini-thumb {
      width: 44px;
      height: 44px;
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

    @media (max-width: 800px) {
      .order-content-grid {
        grid-template-columns: 1fr;
      }
      .node-label {
        display: none;
      }
    }
  `]
})
export class OrderDetailComponent implements OnInit {
  order: Order | undefined;
  isNewlyPlaced = false;
  isReceiptOpen = false;

  isRateModalOpen = false;
  selectedItemForRate: OrderItem | null = null;

  isReportModalOpen = false;
  selectedItemForReport: OrderItem | null = null;

  orderReports: Report[] = [];

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private mockData: MockDataService,
    private reportService: ReportService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.order = this.orderService.getOrder(id);
      this.loadOrderReports();
    }
    this.isNewlyPlaced = this.route.snapshot.queryParams['newOrder'] === 'true';
  }

  loadOrderReports() {
    if (this.order) {
      this.orderReports = this.reportService.getOrderReports(this.order.id);
    }
  }

  isDeliveredAndReceived(): boolean {
    if (!this.order) return false;
    if (this.order.status === 'delivered') return true;
    if (this.order.status === 'completed' && this.order.fulfillmentType === 'pickup') return true;
    if (this.order.status === 'completed') return true;
    return false;
  }

  hasReviewedItem(productId: string): boolean {
    if (!this.order) return false;
    return this.mockData.hasReviewedItem(this.order.id, productId);
  }

  getReviewForItem(productId: string): Review | undefined {
    if (!this.order) return undefined;
    return this.mockData.getReviewForItem(this.order.id, productId);
  }

  openRateModal(item: OrderItem) {
    this.selectedItemForRate = item;
    this.isRateModalOpen = true;
  }

  openReportModal(item?: OrderItem) {
    this.selectedItemForReport = item || (this.order && this.order.items.length > 0 ? this.order.items[0] : null);
    this.isReportModalOpen = true;
  }

  onReviewSubmitted(review: Review) {
    if (this.order) {
      this.order = this.orderService.getOrder(this.order.id);
    }
  }

  onReportSubmitted(report: Report) {
    this.loadOrderReports();
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

  canCancel(): boolean {
    return !!this.order && ['pending', 'confirmed'].includes(this.order.status);
  }

  cancelOrder() {
    if (!this.order) return;
    if (confirm(`Are you sure you want to cancel order #${this.order.orderNumber}?`)) {
      const res = this.orderService.cancelOrder(this.order.id, 'Cancelled by customer');
      if (res.success) {
        this.order = this.orderService.getOrder(this.order.id);
      } else {
        alert(res.message);
      }
    }
  }

  formatStatus(status: OrderStatus): string {
    return this.orderService.formatStatus(status);
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

  getTimelineSteps(): { key: OrderStatus; label: string }[] {
    if (!this.order) return [];
    if (this.order.fulfillmentType === 'pickup') {
      return [
        { key: 'pending', label: 'Placed' },
        { key: 'confirmed', label: 'Confirmed' },
        { key: 'preparing', label: 'Kitchen Prep' },
        { key: 'ready', label: 'Ready for Pickup' },
        { key: 'completed', label: 'Collected' }
      ];
    } else {
      return [
        { key: 'pending', label: 'Placed' },
        { key: 'confirmed', label: 'Confirmed' },
        { key: 'preparing', label: 'Kitchen Prep' },
        { key: 'out_for_delivery', label: 'Out for Delivery' },
        { key: 'delivered', label: 'Delivered' }
      ];
    }
  }

  isStepCompleted(stepKey: OrderStatus): boolean {
    if (!this.order) return false;
    const history = this.order.statusHistory.map(h => h.status);
    return history.includes(stepKey);
  }

  totalNutrition() {
    if (!this.order?.items) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    return this.order.items.reduce((acc, item) => ({
      calories: acc.calories + item.nutrition.calories,
      protein: acc.protein + item.nutrition.protein,
      carbs: acc.carbs + item.nutrition.carbs,
      fat: acc.fat + item.nutrition.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }
}
