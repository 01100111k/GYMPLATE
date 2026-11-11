import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { Order, OrderStatus } from '../../models';
import { SellerSidebarComponent } from '../../shared/components/seller-sidebar.component';
import { ReceiptModalComponent } from '../../shared/components/receipt-modal.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-seller-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SellerSidebarComponent, ReceiptModalComponent, IconComponent],
  template: `
    <div class="seller-layout">
      <app-seller-sidebar></app-seller-sidebar>

      <main class="seller-main-content">
        <div class="seller-container container-narrow" *ngIf="order">
          <div class="page-header flex justify-between items-center flex-wrap gap-4 mb-6">
            <div>
              <a routerLink="/seller/orders" class="text-xs text-secondary mb-1 block">&larr; Back to Order Queue</a>
              <h1>Order #{{ order.orderNumber }}</h1>
              <p class="text-xs text-secondary">Received on {{ order.createdAt | date:'medium' }}</p>
            </div>
            <div class="flex gap-2">
              <button class="btn btn-outline btn-sm" (click)="isReceiptOpen = true">
                <app-icon name="receipt" [size]="14"></app-icon>
                Print Receipt
              </button>
            </div>
          </div>

          <!-- Status Action Toolbar Card -->
          <div class="card status-action-card mb-6">
            <div class="flex justify-between items-center flex-wrap gap-4">
              <div>
                <span class="text-xs font-bold uppercase text-primary">Current Lifecycle Stage</span>
                <div class="flex items-center gap-2 mt-1">
                  <span class="badge" [ngClass]="'badge-' + getStatusBadgeClass(order.status)">
                    {{ formatStatus(order.status) }}
                  </span>
                  <span class="text-xs text-secondary">
                    {{ order.fulfillmentType === 'pickup' ? 'Self Pickup Order' : 'Courier Delivery Order' }}
                  </span>
                </div>
              </div>

              <!-- Transition Action Buttons -->
              <div class="status-buttons-row">
                <button
                  *ngFor="let target of validTransitions"
                  class="btn btn-primary btn-sm"
                  [class.btn-danger]="target === 'cancelled'"
                  (click)="updateStatus(target)"
                >
                  {{ getTransitionButtonLabel(target) }}
                </button>
              </div>
            </div>
          </div>

          <!-- 2 Columns: Order Details & Customer Info -->
          <div class="order-grid">
            <!-- Left: Order Items & Nutrition -->
            <div class="items-card card">
              <h3>Dishes to Prepare</h3>
              <div class="items-table-list">
                <div class="item-row" *ngFor="let item of order.items">
                  <img [src]="item.productImageUrl" [alt]="item.productName" class="thumb" />
                  <div class="item-meta">
                    <span class="font-bold text-xs">{{ item.productName }}</span>
                    <span class="text-xs text-secondary">{{ item.quantity }}x @ {{ item.unitPrice | currency:'PHP':'symbol' }}</span>
                    <small class="macro-line block text-tertiary">
                      {{ item.nutrition.calories }} kcal &bull; {{ item.nutrition.protein }}g protein
                    </small>
                  </div>
                  <strong class="item-sub text-xs">{{ item.subtotal | currency:'PHP':'symbol' }}</strong>
                </div>
              </div>

              <!-- Special Customer Instructions -->
              <div class="instructions-box mt-4" *ngIf="order.specialInstructions">
                <strong class="text-xs text-primary block">Customer Preparation Instructions:</strong>
                <p class="text-xs mt-1">{{ order.specialInstructions }}</p>
              </div>

              <!-- Order Pricing Totals -->
              <div class="totals-box mt-4">
                <div class="t-row">
                  <span>Subtotal:</span>
                  <span>{{ order.subtotal | currency:'PHP':'symbol' }}</span>
                </div>
                <div class="t-row">
                  <span>Delivery ({{ order.fulfillmentType }}):</span>
                  <span>{{ order.deliveryFee | currency:'PHP':'symbol' }}</span>
                </div>
                <div class="t-row">
                  <span>Platform Fee:</span>
                  <span>{{ order.serviceFee | currency:'PHP':'symbol' }}</span>
                </div>
                <div class="divider"></div>
                <div class="t-row total">
                  <span>Total Bill:</span>
                  <span class="text-primary">{{ order.total | currency:'PHP':'symbol' }}</span>
                </div>
              </div>
            </div>

            <!-- Right: Customer Contact & Timeline -->
            <div class="info-sidebar">
              <div class="card panel-box">
                <h3>Customer Information</h3>
                <div class="c-line">
                  <span class="lbl">Customer:</span>
                  <span class="val font-semibold">{{ order.customerName }}</span>
                </div>
                <div class="c-line">
                  <span class="lbl">Phone:</span>
                  <span class="val">{{ order.customerPhone }}</span>
                </div>
                <div class="c-line">
                  <span class="lbl">Email:</span>
                  <span class="val">{{ order.customerEmail }}</span>
                </div>
                <div class="c-line" *ngIf="order.fulfillmentType === 'delivery'">
                  <span class="lbl">Address:</span>
                  <span class="val">{{ order.customerAddress }}</span>
                </div>
                <div class="c-line">
                  <span class="lbl">Payment:</span>
                  <span class="val capitalize">{{ order.paymentMethod === 'cash_on_pickup' ? 'Cash on Pickup' : 'Cash on Delivery' }}</span>
                </div>
                <div class="c-line">
                  <span class="lbl">Payment Status:</span>
                  <span class="val" [class.text-success]="order.paymentStatus === 'paid'" [class.text-warning]="order.paymentStatus === 'pending'">
                    {{ order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid' }}
                  </span>
                </div>
              </div>

              <!-- Status History Audit Log -->
              <div class="card panel-box mt-4">
                <h3>Preparation History</h3>
                <div class="history-list">
                  <div class="history-step" *ngFor="let h of order.statusHistory">
                    <div class="h-dot"></div>
                    <div class="h-info">
                      <span class="h-status font-semibold text-xs">{{ formatStatus(h.status) }}</span>
                      <small class="h-time text-tertiary block">{{ h.timestamp | date:'short' }}</small>
                      <small class="h-note text-secondary" *ngIf="h.note">{{ h.note }}</small>
                    </div>
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
      [order]="order"
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
    }
    .seller-container {
      max-width: var(--container-narrow);
      margin: 0 auto;
    }

    .status-action-card {
      padding: var(--space-4) var(--space-5);
      border: 1px solid var(--color-border);
      background: white;
    }
    .status-buttons-row {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    .order-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: var(--space-6);
    }
    .items-card, .panel-box {
      padding: var(--space-5);
      border: 1px solid var(--color-border);
      background: white;
    }
    .items-card h3, .panel-box h3 {
      font-size: var(--font-size-base);
      margin-bottom: var(--space-4);
      padding-bottom: var(--space-2);
      border-bottom: 1px solid var(--color-border);
    }

    .items-table-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
    .item-row {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding-bottom: var(--space-2);
      border-bottom: 1px solid var(--color-border);
    }
    .thumb {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-sm);
      object-fit: cover;
    }
    .item-meta {
      flex: 1;
    }
    .instructions-box {
      background: var(--color-primary-lighter);
      padding: var(--space-3);
      border-radius: var(--radius);
      border: 1px solid rgba(45, 90, 61, 0.2);
    }

    .totals-box {
      background: var(--color-bg-secondary);
      padding: var(--space-3);
      border-radius: var(--radius);
    }
    .t-row {
      display: flex;
      justify-content: space-between;
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin-bottom: 2px;
    }
    .t-row.total {
      font-size: var(--font-size-sm);
      font-weight: 700;
      color: var(--color-text);
      margin-top: 4px;
    }
    .divider {
      height: 1px;
      background: var(--color-border);
      margin: var(--space-2) 0;
    }

    .c-line {
      display: flex;
      justify-content: space-between;
      font-size: var(--font-size-xs);
      margin-bottom: 6px;
    }
    .c-line .lbl {
      color: var(--color-text-secondary);
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      position: relative;
    }
    .history-step {
      display: flex;
      gap: var(--space-3);
      align-items: flex-start;
    }
    .h-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-primary);
      margin-top: 4px;
    }

    @media (max-width: 900px) {
      .seller-main-content {
        margin-left: 0;
        padding: var(--space-4);
      }
      .order-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SellerOrderDetailComponent implements OnInit {
  order: Order | undefined;
  validTransitions: OrderStatus[] = [];
  isReceiptOpen = false;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.order = this.orderService.getOrder(id);
      if (this.order) {
        this.validTransitions = this.orderService.getValidTransitions(this.order.status, this.order.fulfillmentType);
      }
    }
  }

  formatStatus(status: OrderStatus): string {
    return this.orderService.formatStatus(status);
  }

  getStatusBadgeClass(status: OrderStatus): string {
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

  getTransitionButtonLabel(status: OrderStatus): string {
    switch (status) {
      case 'confirmed': return 'Accept & Confirm';
      case 'preparing': return 'Start Kitchen Prep';
      case 'ready': return 'Ready for Collection';
      case 'out_for_delivery': return 'Dispatch Courier';
      case 'delivered': return 'Mark Delivered';
      case 'completed': return 'Mark Handed Over';
      case 'cancelled': return 'Cancel Order';
      default: return status;
    }
  }

  updateStatus(status: OrderStatus) {
    if (!this.order) return;
    if (status === 'cancelled' && !confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    const res = this.orderService.updateOrderStatus(this.order.id, status, `Kitchen state changed to ${status}`);
    if (res.success) {
      this.order = this.orderService.getOrder(this.order.id);
      if (this.order) {
        this.validTransitions = this.orderService.getValidTransitions(this.order.status, this.order.fulfillmentType);
      }
    } else {
      alert(res.message);
    }
  }
}
