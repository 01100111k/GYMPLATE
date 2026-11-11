import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from '../../models';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-receipt-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="onBackdropClick($event)">
      <div class="modal-content receipt-dialog" (click)="$event.stopPropagation()">
        <!-- Fixed Header -->
        <div class="modal-header">
          <div class="header-title">
            <app-icon name="receipt" [size]="20" color="var(--color-primary)"></app-icon>
            <h3>Official Order Receipt</h3>
          </div>
          <button class="modal-close" (click)="close()" aria-label="Close modal">
            <app-icon name="x" [size]="20"></app-icon>
          </button>
        </div>

        <!-- Scrollable Receipt Body -->
        <div class="modal-body print-area" id="receipt-print-section">
          <!-- Receipt Header / Branding -->
          <div class="receipt-header">
            <div class="brand">
              <div class="brand-title">
                <app-icon name="utensils" [size]="22" color="var(--color-primary)"></app-icon>
                <span>Gym<strong class="text-primary">Plate</strong></span>
              </div>
              <p class="brand-sub">Nutrition-Based Fitness Food Ordering</p>
            </div>
            <div class="receipt-meta">
              <div class="order-num">{{ order?.orderNumber }}</div>
              <div class="order-date">{{ order?.createdAt | date:'medium' }}</div>
              <span class="status-badge" [ngClass]="'status-' + order?.status">
                {{ formatStatus(order?.status || '') }}
              </span>
            </div>
          </div>

          <div class="receipt-divider"></div>

          <!-- Customer & Kitchen / Seller Details -->
          <div class="party-grid">
            <div class="party-col">
              <span class="col-heading">Customer Information</span>
              <div class="party-name">{{ order?.customerName }}</div>
              <div class="party-detail">{{ order?.customerEmail }}</div>
              <div class="party-detail">{{ order?.customerPhone }}</div>
              <div class="party-detail" *ngIf="order?.fulfillmentType === 'delivery'">
                <strong>Delivery Address:</strong> {{ order?.customerAddress }}
              </div>
            </div>

            <div class="party-col">
              <span class="col-heading">Kitchen / Partner</span>
              <div class="party-name">{{ order?.businessName }}</div>
              <div class="party-detail">Partner Seller: {{ order?.sellerName }}</div>
              <div class="party-detail">Fulfillment: <strong class="capitalize">{{ order?.fulfillmentType }}</strong></div>
              <div class="party-detail">
                Payment: <strong>{{ formatPaymentMethod(order?.paymentMethod || '') }}</strong>
              </div>
              <div class="party-detail payment-status-line">
                Status:
                <span [class.text-success]="order?.paymentStatus === 'paid'" [class.text-warning]="order?.paymentStatus === 'pending'">
                  {{ order?.paymentStatus === 'paid' ? 'Paid in Full' : 'Payment Pending (Upon Handover)' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Special instructions if any -->
          <div class="instructions-box" *ngIf="order?.specialInstructions">
            <span class="col-heading">Special Preparation Instructions:</span>
            <p>{{ order?.specialInstructions }}</p>
          </div>

          <!-- Order Items Table -->
          <div class="table-container items-table-wrapper">
            <table class="receipt-table">
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th class="text-center">Nutrition (Macros)</th>
                  <th class="text-center">Qty</th>
                  <th class="text-right">Unit Price</th>
                  <th class="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of order?.items">
                  <td>
                    <div class="item-name">{{ item.productName }}</div>
                  </td>
                  <td class="text-center nutrition-cell">
                    <small>{{ item.nutrition.calories }} kcal | {{ item.nutrition.protein }}g P</small>
                  </td>
                  <td class="text-center font-medium">{{ item.quantity }}</td>
                  <td class="text-right">{{ item.unitPrice | currency:'PHP':'symbol' }}</td>
                  <td class="text-right font-medium">{{ item.subtotal | currency:'PHP':'symbol' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Totals Calculation -->
          <div class="totals-section">
            <div class="total-row">
              <span class="total-label">Subtotal:</span>
              <span class="total-val">{{ order?.subtotal | currency:'PHP':'symbol' }}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Delivery Fee:</span>
              <span class="total-val">{{ (order?.deliveryFee || 0) | currency:'PHP':'symbol' }}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Platform Service Fee (5%):</span>
              <span class="total-val">{{ (order?.serviceFee || 0) | currency:'PHP':'symbol' }}</span>
            </div>
            <div class="total-row grand-total">
              <span class="total-label">Total Amount:</span>
              <span class="total-val text-primary">{{ order?.total | currency:'PHP':'symbol' }}</span>
            </div>
          </div>

          <!-- Total Nutrition Breakdown for Order -->
          <div class="nutrition-summary-box">
            <span class="col-heading">Cumulative Order Nutrition Breakdown</span>
            <div class="order-macro-grid">
              <div class="macro-cell">
                <span class="macro-val">{{ getTotalNutrition()?.calories }}</span>
                <span class="macro-lbl">Total Calories (kcal)</span>
              </div>
              <div class="macro-cell">
                <span class="macro-val">{{ getTotalNutrition()?.protein }}g</span>
                <span class="macro-lbl">Protein</span>
              </div>
              <div class="macro-cell">
                <span class="macro-val">{{ getTotalNutrition()?.carbs }}g</span>
                <span class="macro-lbl">Carbs</span>
              </div>
              <div class="macro-cell">
                <span class="macro-val">{{ getTotalNutrition()?.fat }}g</span>
                <span class="macro-lbl">Fat</span>
              </div>
            </div>
          </div>

          <!-- Disclaimer / Receipt Footer -->
          <div class="receipt-note">
            <p>
              * GymPlate verified digital receipt. Nutrition facts are seller-provided per serving.
              {{ order?.paymentStatus === 'paid' ? 'Payment was successfully recorded.' : 'Cash payment required upon physical fulfillment/pickup.' }}
            </p>
          </div>
        </div>

        <!-- Fixed Footer Actions -->
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="close()">Close</button>
          <button class="btn btn-outline" (click)="printReceipt()">
            <app-icon name="printer" [size]="16"></app-icon>
            Print Receipt
          </button>
          <button class="btn btn-primary" (click)="downloadReceipt()">
            <app-icon name="download" [size]="16"></app-icon>
            Download Text Receipt
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .receipt-dialog {
      max-width: 680px;
    }
    .header-title {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    .receipt-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-4);
    }
    .brand-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: var(--font-size-xl);
      font-weight: 700;
    }
    .text-primary {
      color: var(--color-primary);
    }
    .brand-sub {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin-top: 2px;
    }
    .receipt-meta {
      text-align: right;
    }
    .order-num {
      font-size: var(--font-size-base);
      font-weight: 700;
      color: var(--color-text);
      font-family: monospace;
    }
    .order-date {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin-top: 2px;
    }
    .status-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: var(--radius-full);
      margin-top: 4px;
      text-transform: capitalize;
    }
    .status-pending { background: var(--color-warning-bg); color: #92400E; }
    .status-confirmed, .status-preparing, .status-ready { background: var(--color-info-bg); color: #1E40AF; }
    .status-out_for_delivery { background: #F3E8FF; color: #6B21A8; }
    .status-completed, .status-delivered { background: var(--color-success-bg); color: #166534; }
    .status-cancelled { background: var(--color-danger-bg); color: #991B1B; }

    .receipt-divider {
      height: 1px;
      background: var(--color-border);
      margin: var(--space-4) 0;
    }

    .party-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-6);
      margin-bottom: var(--space-4);
    }
    .col-heading {
      display: block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-text-tertiary);
      margin-bottom: 4px;
    }
    .party-name {
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--color-text);
    }
    .party-detail {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin-top: 2px;
    }
    .payment-status-line {
      margin-top: 4px;
      font-weight: 500;
    }

    .instructions-box {
      background: var(--color-bg-secondary);
      padding: var(--space-3);
      border-radius: var(--radius);
      margin-bottom: var(--space-4);
      font-size: var(--font-size-xs);
    }
    .instructions-box p {
      color: var(--color-text);
      margin-top: 2px;
    }

    .receipt-table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--font-size-xs);
      margin-bottom: var(--space-4);
    }
    .receipt-table th {
      background: var(--color-bg-secondary);
      padding: 8px 10px;
      border-bottom: 1px solid var(--color-border);
      font-weight: 600;
      color: var(--color-text-secondary);
    }
    .receipt-table td {
      padding: 10px;
      border-bottom: 1px solid var(--color-border);
    }
    .item-name {
      font-weight: 500;
      color: var(--color-text);
    }
    .nutrition-cell {
      color: var(--color-text-secondary);
    }

    .totals-section {
      margin-left: auto;
      max-width: 280px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: var(--space-5);
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }
    .total-val {
      font-weight: 500;
      color: var(--color-text);
    }
    .total-row.grand-total {
      font-size: var(--font-size-base);
      font-weight: 700;
      color: var(--color-text);
      border-top: 2px solid var(--color-border);
      padding-top: 6px;
      margin-top: 4px;
    }

    .nutrition-summary-box {
      background: var(--color-primary-lighter);
      border: 1px solid rgba(45, 90, 61, 0.2);
      border-radius: var(--radius);
      padding: var(--space-3) var(--space-4);
      margin-bottom: var(--space-4);
    }
    .order-macro-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-2);
      margin-top: 6px;
    }
    .macro-cell {
      text-align: center;
    }
    .macro-val {
      display: block;
      font-size: var(--font-size-sm);
      font-weight: 700;
      color: var(--color-primary);
    }
    .macro-lbl {
      font-size: 10px;
      color: var(--color-text-secondary);
    }

    .receipt-note {
      font-size: 11px;
      color: var(--color-text-tertiary);
      line-height: 1.4;
      text-align: center;
      margin-top: var(--space-4);
    }

    @media print {
      body * {
        visibility: hidden;
      }
      #receipt-print-section, #receipt-print-section * {
        visibility: visible;
      }
      #receipt-print-section {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
    }

    @media (max-width: 600px) {
      .party-grid {
        grid-template-columns: 1fr;
        gap: var(--space-3);
      }
      .order-macro-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class ReceiptModalComponent {
  @Input() isOpen = false;
  @Input() order: Order | null | undefined = null;
  @Output() closeEvent = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isOpen) {
      this.close();
    }
  }

  onBackdropClick(event: MouseEvent) {
    this.close();
  }

  close() {
    this.closeEvent.emit();
  }

  formatStatus(status: string): string {
    const map: Record<string, string> = {
      pending: 'Pending Acceptance',
      confirmed: 'Confirmed',
      preparing: 'Preparing in Kitchen',
      ready: 'Ready for Pickup',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return map[status] || status;
  }

  formatPaymentMethod(pm: string): string {
    return pm === 'cash_on_pickup' ? 'Cash on Pickup' : 'Cash on Delivery';
  }

  getTotalNutrition() {
    if (!this.order?.items) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    return this.order.items.reduce((acc, item) => ({
      calories: acc.calories + item.nutrition.calories,
      protein: acc.protein + item.nutrition.protein,
      carbs: acc.carbs + item.nutrition.carbs,
      fat: acc.fat + item.nutrition.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }

  printReceipt() {
    window.print();
  }

  downloadReceipt() {
    if (!this.order) return;
    const o = this.order;
    const macros = this.getTotalNutrition();
    const lines = [
      '====================================================',
      '                     GYMPLATE                        ',
      '      Nutrition-Based Fitness Food Ordering         ',
      '====================================================',
      `Order Number: ${o.orderNumber}`,
      `Date:         ${new Date(o.createdAt).toLocaleString()}`,
      `Status:       ${this.formatStatus(o.status)}`,
      `Customer:     ${o.customerName} (${o.customerEmail})`,
      `Kitchen:      ${o.businessName} (Seller: ${o.sellerName})`,
      `Fulfillment:  ${o.fulfillmentType.toUpperCase()}`,
      `Payment:      ${this.formatPaymentMethod(o.paymentMethod)} (${o.paymentStatus === 'paid' ? 'PAID' : 'PENDING'})`,
      '----------------------------------------------------',
      'ITEMS ORDERED:',
      ...o.items.map(i => `  - ${i.productName} x${i.quantity} @ ₱${i.unitPrice.toFixed(2)} = ₱${i.subtotal.toFixed(2)} [${i.nutrition.calories} kcal, ${i.nutrition.protein}g P]`),
      '----------------------------------------------------',
      `Subtotal:     ₱${o.subtotal.toFixed(2)}`,
      `Delivery Fee: ₱${o.deliveryFee.toFixed(2)}`,
      `Service Fee:  ₱${o.serviceFee.toFixed(2)}`,
      `TOTAL:        ₱${o.total.toFixed(2)}`,
      '----------------------------------------------------',
      'TOTAL ORDER NUTRITION ESTIMATE:',
      `  Calories: ${macros.calories} kcal`,
      `  Protein:  ${macros.protein}g`,
      `  Carbs:    ${macros.carbs}g`,
      `  Fat:      ${macros.fat}g`,
      '====================================================',
      'Thank you for staying on track with GymPlate!',
      'Nutrition data is seller-provided per serving.',
      '===================================================='
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GymPlate-Receipt-${o.orderNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
