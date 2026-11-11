import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models';
import { AdminSidebarComponent } from '../../shared/components/admin-sidebar.component';
import { ReceiptModalComponent } from '../../shared/components/receipt-modal.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdminSidebarComponent, ReceiptModalComponent, IconComponent],
  template: `
    <div class="admin-layout">
      <app-admin-sidebar></app-admin-sidebar>

      <main class="admin-main-content">
        <div class="admin-container">
          <div class="page-header mb-6">
            <span class="text-xs font-bold uppercase text-warning">Platform Surveillance</span>
            <h1>Platform-Wide Orders Monitoring</h1>
            <p class="text-xs text-secondary">Read-only oversight of all commercial kitchen orders across the GymPlate ecosystem.</p>
          </div>

          <!-- Filter Bar -->
          <div class="card filter-bar mb-6">
            <div class="search-input-wrap">
              <app-icon name="search" [size]="16" class="search-icon"></app-icon>
              <input
                type="text"
                class="form-control"
                placeholder="Search order #, customer, or kitchen name..."
                [(ngModel)]="searchQuery"
                (ngModelChange)="filterOrders()"
              />
            </div>
            <select class="form-control status-select" [(ngModel)]="statusFilter" (ngModelChange)="filterOrders()">
              <option value="all">All Statuses ({{ orders.length }})</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready for Pickup</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <!-- Orders Table -->
          <div class="card table-panel">
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Order # & Date</th>
                    <th>Customer</th>
                    <th>Kitchen Partner</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th class="text-center">Status</th>
                    <th class="text-right">Inspection</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let o of filteredOrders">
                    <td>
                      <span class="font-mono text-xs font-bold">{{ o.orderNumber }}</span>
                      <small class="text-tertiary block">{{ o.createdAt | date:'short' }}</small>
                    </td>
                    <td>
                      <span class="text-xs font-medium">{{ o.customerName }}</span>
                      <small class="text-secondary block">{{ o.customerPhone }}</small>
                    </td>
                    <td>
                      <strong class="text-xs text-primary">{{ o.businessName }}</strong>
                      <small class="text-tertiary block capitalize">{{ o.fulfillmentType }}</small>
                    </td>
                    <td class="text-xs">{{ o.items.length }} dishes</td>
                    <td>
                      <strong class="text-xs font-bold">{{ o.total | currency:'PHP':'symbol' }}</strong>
                      <span class="badge text-xs" [class.badge-success]="o.paymentStatus === 'paid'" [class.badge-warning]="o.paymentStatus === 'pending'">
                        {{ o.paymentStatus }}
                      </span>
                    </td>
                    <td class="text-center">
                      <span class="badge" [ngClass]="'badge-' + getStatusBadgeClass(o.status)">
                        {{ formatStatus(o.status) }}
                      </span>
                    </td>
                    <td class="text-right">
                      <div class="flex justify-end gap-2">
                        <button class="btn btn-ghost btn-sm" (click)="openReceipt(o)" title="Inspect Receipt">
                          <app-icon name="receipt" [size]="14"></app-icon>
                        </button>
                        <a [routerLink]="['/admin/orders', o.id]" class="btn btn-secondary btn-sm">
                          Inspect
                        </a>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Printable Receipt Modal -->
    <app-receipt-modal
      [isOpen]="isReceiptOpen"
      [order]="selectedOrder"
      (closeEvent)="isReceiptOpen = false"
    ></app-receipt-modal>
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
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  searchQuery = '';
  statusFilter = 'all';

  isReceiptOpen = false;
  selectedOrder: Order | null = null;

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.orders = this.orderService.getOrders()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    this.filterOrders();
  }

  filterOrders() {
    this.filteredOrders = this.orders.filter(o => {
      const matchSearch = !this.searchQuery ||
        o.orderNumber.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        o.customerName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        o.businessName.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchStatus = this.statusFilter === 'all' || o.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  formatStatus(status: any): string {
    return this.orderService.formatStatus(status);
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
