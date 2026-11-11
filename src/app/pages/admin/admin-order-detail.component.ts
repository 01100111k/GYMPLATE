import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models';
import { AdminSidebarComponent } from '../../shared/components/admin-sidebar.component';
import { ReceiptModalComponent } from '../../shared/components/receipt-modal.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminSidebarComponent, ReceiptModalComponent, IconComponent],
  template: `
    <div class="admin-layout">
      <app-admin-sidebar></app-admin-sidebar>

      <main class="admin-main-content">
        <div class="admin-container container-narrow" *ngIf="order">
          <div class="page-header flex justify-between items-center flex-wrap gap-4 mb-6">
            <div>
              <a routerLink="/admin/orders" class="text-xs text-secondary mb-1 block">&larr; Back to Platform Orders</a>
              <h1>Order Inspection: #{{ order.orderNumber }}</h1>
              <p class="text-xs text-secondary">Placed on {{ order.createdAt | date:'medium' }} &bull; Read-Only Governance Mode</p>
            </div>
            <div class="flex gap-2">
              <button class="btn btn-outline btn-sm" (click)="isReceiptOpen = true">
                <app-icon name="receipt" [size]="14"></app-icon>
                View Official Receipt
              </button>
            </div>
          </div>

          <!-- Order Status Bar -->
          <div class="card status-bar-card mb-6">
            <div class="flex justify-between items-center flex-wrap gap-3">
              <div>
                <span class="text-xs font-bold uppercase text-warning">Order Lifecycle State</span>
                <div class="flex items-center gap-2 mt-1">
                  <span class="badge" [ngClass]="'badge-' + getStatusBadgeClass(order.status)">
                    {{ formatStatus(order.status) }}
                  </span>
                  <span class="text-xs text-secondary">Controlled by seller {{ order.sellerName }}</span>
                </div>
              </div>
              <div class="flex items-center gap-2 text-xs text-secondary">
                <span>Fulfillment: <strong class="capitalize">{{ order.fulfillmentType }}</strong></span>
                &bull;
                <span>Payment: <strong>{{ order.paymentMethod === 'cash_on_pickup' ? 'Cash Pickup' : 'Cash on Delivery' }}</strong></span>
              </div>
            </div>
          </div>

          <!-- 2 Columns: Items & Customer/Seller Info -->
          <div class="detail-grid">
            <div class="card items-box">
              <h3>Items Ordered</h3>
              <div class="items-list">
                <div class="item-row" *ngFor="let item of order.items">
                  <img [src]="item.productImageUrl" [alt]="item.productName" class="thumb" />
                  <div class="flex-1">
                    <span class="text-xs font-semibold block">{{ item.productName }}</span>
                    <span class="text-xs text-secondary">{{ item.quantity }}x @ {{ item.unitPrice | currency:'PHP':'symbol' }}</span>
                    <small class="text-tertiary block">{{ item.nutrition.calories }} kcal &bull; {{ item.nutrition.protein }}g protein</small>
                  </div>
                  <strong class="text-xs">{{ item.subtotal | currency:'PHP':'symbol' }}</strong>
                </div>
              </div>

              <div class="totals-breakdown mt-4">
                <div class="t-line">
                  <span>Subtotal:</span>
                  <span>{{ order.subtotal | currency:'PHP':'symbol' }}</span>
                </div>
                <div class="t-line">
                  <span>Delivery Fee:</span>
                  <span>{{ order.deliveryFee | currency:'PHP':'symbol' }}</span>
                </div>
                <div class="t-line">
                  <span>Platform Fee (5%):</span>
                  <span>{{ order.serviceFee | currency:'PHP':'symbol' }}</span>
                </div>
                <div class="divider"></div>
                <div class="t-line grand">
                  <span>Total Amount:</span>
                  <span class="text-primary">{{ order.total | currency:'PHP':'symbol' }}</span>
                </div>
              </div>
            </div>

            <div class="parties-box">
              <div class="card info-card mb-4">
                <h3>Customer Coordinates</h3>
                <div class="c-row"><span class="lbl">Name:</span><strong>{{ order.customerName }}</strong></div>
                <div class="c-row"><span class="lbl">Email:</span><span>{{ order.customerEmail }}</span></div>
                <div class="c-row"><span class="lbl">Phone:</span><span>{{ order.customerPhone }}</span></div>
                <div class="c-row" *ngIf="order.fulfillmentType === 'delivery'"><span class="lbl">Address:</span><span>{{ order.customerAddress }}</span></div>
              </div>

              <div class="card info-card">
                <h3>Kitchen Commercial Details</h3>
                <div class="c-row"><span class="lbl">Kitchen Name:</span><strong>{{ order.businessName }}</strong></div>
                <div class="c-row"><span class="lbl">Seller User:</span><span>{{ order.sellerName }}</span></div>
                <div class="c-row"><span class="lbl">Seller ID:</span><span class="font-mono text-xs">{{ order.sellerId }}</span></div>
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
      max-width: var(--container-narrow);
      margin: 0 auto;
    }
    .status-bar-card {
      padding: var(--space-4) var(--space-5);
      border: 1px solid var(--color-border);
      background: white;
    }
    .detail-grid {
      display: grid;
      grid-template-columns: 1.3fr 1fr;
      gap: var(--space-6);
    }
    .items-box, .info-card {
      padding: var(--space-5);
      border: 1px solid var(--color-border);
      background: white;
    }
    .items-box h3, .info-card h3 {
      font-size: var(--font-size-base);
      margin-bottom: var(--space-3);
      padding-bottom: var(--space-2);
      border-bottom: 1px solid var(--color-border);
    }
    .item-row {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding-bottom: var(--space-2);
      border-bottom: 1px solid var(--color-border);
    }
    .thumb {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-sm);
      object-fit: cover;
    }
    .totals-breakdown {
      background: var(--color-bg-secondary);
      padding: var(--space-3);
      border-radius: var(--radius);
    }
    .t-line {
      display: flex;
      justify-content: space-between;
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin-bottom: 2px;
    }
    .t-line.grand {
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
    .c-row {
      display: flex;
      justify-content: space-between;
      font-size: var(--font-size-xs);
      margin-bottom: 6px;
    }
    .c-row .lbl {
      color: var(--color-text-secondary);
    }

    @media (max-width: 900px) {
      .admin-main-content {
        margin-left: 0;
        padding: var(--space-4);
      }
      .detail-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminOrderDetailComponent implements OnInit {
  order: Order | undefined;
  isReceiptOpen = false;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.order = this.orderService.getOrder(id);
    }
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
}
