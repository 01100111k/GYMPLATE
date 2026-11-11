import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Order, OrderStatus } from '../../models';
import { SellerSidebarComponent } from '../../shared/components/seller-sidebar.component';
import { ReceiptModalComponent } from '../../shared/components/receipt-modal.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-seller-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SellerSidebarComponent, ReceiptModalComponent, IconComponent],
  template: `
    <div class="seller-layout">
      <app-seller-sidebar></app-seller-sidebar>

      <main class="seller-main-content">
        <div class="seller-container">
          <div class="page-header flex justify-between items-center flex-wrap gap-4 mb-6">
            <div>
              <span class="text-xs font-bold uppercase text-primary">Kitchen Dispatch</span>
              <h1>Customer Order Fulfillment</h1>
              <p class="text-xs text-secondary">Accept orders, transition kitchen prep phases, and generate official receipts.</p>
            </div>
            <div class="flex gap-2">
              <button class="btn btn-secondary btn-sm" (click)="loadOrders()">
                <app-icon name="refresh-cw" [size]="14"></app-icon>
                Refresh
              </button>
            </div>
          </div>

          <!-- Alert for status update feedback -->
          <div class="alert alert-success mb-4" *ngIf="actionFeedback">
            <app-icon name="check-circle" [size]="16"></app-icon>
            <span>{{ actionFeedback }}</span>
          </div>

          <!-- Filters Bar -->
          <div class="filter-bar card mb-6">
            <div class="search-input-wrap">
              <app-icon name="search" [size]="16" class="search-icon"></app-icon>
              <input
                type="text"
                class="form-control"
                placeholder="Search order #, customer name, dish..."
                [(ngModel)]="searchQuery"
                (ngModelChange)="filterOrders()"
              />
            </div>
            <select class="form-control status-select" [(ngModel)]="statusFilter" (ngModelChange)="filterOrders()">
              <option value="all">All Statuses ({{ orders.length }})</option>
              <option value="pending">Pending Acceptance</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready for Pickup</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="completed">Completed / Handed Over</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <!-- Orders Table -->
          <div class="card table-panel">
            <div class="table-container" *ngIf="filteredOrders.length > 0">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Order # & Date</th>
                    <th>Customer & Notes</th>
                    <th>Fulfillment</th>
                    <th>Dishes Ordered</th>
                    <th>Total</th>
                    <th class="text-center">Status</th>
                    <th class="text-right">Lifecycle Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let o of filteredOrders">
                    <td>
                      <span class="font-mono text-xs font-bold">{{ o.orderNumber }}</span>
                      <small class="text-secondary block">{{ o.createdAt | date:'shortTime' }} &bull; {{ o.createdAt | date:'shortDate' }}</small>
                    </td>
                    <td>
                      <strong class="text-xs">{{ o.customerName }}</strong>
                      <span class="text-xs text-secondary block">{{ o.customerPhone }}</span>
                      <small class="customer-note text-info" *ngIf="o.specialInstructions">
                        Note: "{{ o.specialInstructions }}"
                      </small>
                    </td>
                    <td>
                      <span class="badge badge-neutral capitalize">{{ o.fulfillmentType }}</span>
                      <small class="text-tertiary block mt-1">
                        {{ o.paymentMethod === 'cash_on_pickup' ? 'Cash Pickup' : 'Cash on Delivery' }}
                      </small>
                    </td>
                    <td>
                      <div class="items-summary-list">
                        <span class="item-summary-line" *ngFor="let item of o.items">
                          {{ item.quantity }}x {{ item.productName }}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div class="total-cell">
                        <strong class="order-total-amount">{{ o.total | currency:'PHP':'symbol' }}</strong>
                        <span class="badge payment-badge text-xs" [class.badge-success]="o.paymentStatus === 'paid'" [class.badge-warning]="o.paymentStatus === 'pending'">
                          {{ o.paymentStatus === 'paid' ? 'Paid' : 'Unpaid' }}
                        </span>
                      </div>
                    </td>
                    <td class="text-center">
                      <span class="badge" [ngClass]="'badge-' + getStatusBadgeClass(o.status)">
                        {{ formatStatus(o.status) }}
                      </span>
                    </td>
                    <td class="text-right">
                      <div class="actions-cell">
                        <!-- Quick Transition Button if eligible -->
                        <button
                          *ngIf="getNextTransition(o)"
                          class="btn btn-primary btn-sm quick-action-btn"
                          (click)="advanceStatus(o)"
                        >
                          {{ getNextTransitionLabel(o) }}
                        </button>
                        <button class="btn btn-ghost btn-sm" (click)="openReceipt(o)" title="Print Receipt">
                          <app-icon name="receipt" [size]="14"></app-icon>
                        </button>
                        <a [routerLink]="['/seller/orders', o.id]" class="btn btn-secondary btn-sm">
                          Details
                        </a>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Empty state -->
            <div class="empty-state py-12 text-center" *ngIf="filteredOrders.length === 0">
              <app-icon name="clipboard-list" [size]="48" color="var(--color-text-tertiary)"></app-icon>
              <h3>No Orders Found</h3>
              <p class="text-xs text-secondary mt-1">No orders match your active filter.</p>
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
    .status-select {
      width: 220px;
    }

    .table-panel {
      border: 1px solid var(--color-border);
      background: white;
    }
    .total-cell {
      display: flex;
      flex-direction: column;
      gap: 3px;
      align-items: flex-start;
    }
    .order-total-amount {
      font-size: 13px;
      font-weight: 700;
      color: var(--color-primary);
    }
    .customer-note {
      display: block;
      font-size: 10px;
      color: #1E40AF;
      margin-top: 2px;
    }
    .items-summary-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 11px;
    }
    .actions-cell {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 4px;
    }
    .quick-action-btn {
      white-space: nowrap;
      font-size: 11px;
      padding: 4px 8px;
    }

    .alert-success {
      background: var(--color-success-bg);
      color: #166534;
      padding: 10px 14px;
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-xs);
    }

    @media (max-width: 900px) {
      .seller-main-content {
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
export class SellerOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  searchQuery = '';
  statusFilter = 'all';
  actionFeedback = '';

  isReceiptOpen = false;
  selectedOrder: Order | null = null;

  constructor(
    private authService: AuthService,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    const user = this.authService.user();
    if (user) {
      this.orders = this.orderService.getSellerOrders(user.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      this.filterOrders();
    }
  }

  filterOrders() {
    this.filteredOrders = this.orders.filter(o => {
      const matchSearch = !this.searchQuery ||
        o.orderNumber.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        o.customerName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        o.items.some(i => i.productName.toLowerCase().includes(this.searchQuery.toLowerCase()));

      const matchStatus = this.statusFilter === 'all' || o.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
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

  getNextTransition(order: Order): OrderStatus | null {
    const allowed = this.orderService.getValidTransitions(order.status, order.fulfillmentType);
    const nonCancelled = allowed.filter(s => s !== 'cancelled');
    return nonCancelled.length > 0 ? nonCancelled[0] : null;
  }

  getNextTransitionLabel(order: Order): string {
    const next = this.getNextTransition(order);
    if (!next) return '';
    switch (next) {
      case 'confirmed': return 'Confirm Order';
      case 'preparing': return 'Start Preparing';
      case 'ready': return 'Mark Ready for Pickup';
      case 'out_for_delivery': return 'Dispatch Delivery';
      case 'delivered': return 'Mark Delivered';
      case 'completed': return 'Mark Handed Over';
      default: return 'Advance';
    }
  }

  advanceStatus(order: Order) {
    const next = this.getNextTransition(order);
    if (!next) return;

    const res = this.orderService.updateOrderStatus(order.id, next, `Advanced to ${next} by kitchen`);
    if (res.success) {
      this.actionFeedback = `Order #${order.orderNumber} advanced to ${this.formatStatus(next)}.`;
      this.loadOrders();
      setTimeout(() => this.actionFeedback = '', 3500);
    } else {
      alert(res.message);
    }
  }

  openReceipt(order: Order) {
    this.selectedOrder = order;
    this.isReceiptOpen = true;
  }
}
