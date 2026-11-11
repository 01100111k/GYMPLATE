import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Order } from '../../models';
import { SellerSidebarComponent } from '../../shared/components/seller-sidebar.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-seller-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, SellerSidebarComponent, IconComponent],
  template: `
    <div class="seller-layout">
      <app-seller-sidebar></app-seller-sidebar>

      <main class="seller-main-content">
        <div class="seller-container">
          <div class="page-header flex justify-between items-center flex-wrap gap-4 mb-6">
            <div>
              <span class="text-xs font-bold uppercase text-primary">Financial Analytics</span>
              <h1>Sales & Performance Reports</h1>
              <p class="text-xs text-secondary">Review revenue velocity, top macro dishes, and export fulfillment records.</p>
            </div>
            <div class="flex gap-2">
              <button class="btn btn-outline btn-sm" (click)="exportCSV()">
                <app-icon name="download" [size]="14"></app-icon>
                Export CSV
              </button>
              <button class="btn btn-secondary btn-sm" (click)="printReport()">
                <app-icon name="printer" [size]="14"></app-icon>
                Print Report
              </button>
            </div>
          </div>

          <!-- Timeframe Selector Tabs -->
          <div class="filter-tabs card mb-6">
            <button class="tab-btn" [class.active]="period === 'daily'" (click)="setPeriod('daily')">Daily (Today)</button>
            <button class="tab-btn" [class.active]="period === 'weekly'" (click)="setPeriod('weekly')">Weekly (Last 7 Days)</button>
            <button class="tab-btn" [class.active]="period === 'monthly'" (click)="setPeriod('monthly')">Monthly (Last 30 Days)</button>
            <button class="tab-btn" [class.active]="period === 'all'" (click)="setPeriod('all')">All Time</button>
          </div>

          <!-- Metric Cards -->
          <div class="grid-4 mb-6">
            <div class="card stat-box">
              <span class="lbl">Gross Sales</span>
              <strong class="val text-primary">{{ totalSales | currency:'PHP':'symbol' }}</strong>
            </div>
            <div class="card stat-box">
              <span class="lbl">Total Orders</span>
              <strong class="val">{{ filteredOrders.length }}</strong>
            </div>
            <div class="card stat-box">
              <span class="lbl">Average Order Value</span>
              <strong class="val">{{ averageOrderValue | currency:'PHP':'symbol' }}</strong>
            </div>
            <div class="card stat-box">
              <span class="lbl">Units Sold</span>
              <strong class="val">{{ totalUnitsSold }}</strong>
            </div>
          </div>

          <!-- 2 Columns: Best Sellers & Order Distribution -->
          <div class="report-grid mb-6">
            <!-- Best Selling Meals -->
            <div class="card report-card">
              <h3>Top Selling Meals by Volume</h3>
              <div class="table-container mt-3">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Meal</th>
                      <th class="text-center">Units Sold</th>
                      <th class="text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of topSellers">
                      <td class="font-medium text-xs">{{ item.name }}</td>
                      <td class="text-center font-bold text-xs">{{ item.units }}</td>
                      <td class="text-right text-xs font-semibold text-primary">{{ item.revenue | currency:'PHP':'symbol' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Fulfillment Breakdown -->
            <div class="card report-card">
              <h3>Fulfillment Type Breakdown</h3>
              <div class="fulfillment-stats-list mt-4">
                <div class="f-row">
                  <div class="flex items-center gap-2">
                    <app-icon name="store" [size]="16" color="var(--color-primary)"></app-icon>
                    <span class="text-xs">Self Pickup Orders:</span>
                  </div>
                  <strong>{{ pickupCount }} orders</strong>
                </div>
                <div class="f-row">
                  <div class="flex items-center gap-2">
                    <app-icon name="truck" [size]="16" color="var(--color-info)"></app-icon>
                    <span class="text-xs">Delivery Orders:</span>
                  </div>
                  <strong>{{ deliveryCount }} orders</strong>
                </div>
              </div>
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

    .filter-tabs {
      display: flex;
      padding: 3px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      background: white;
      gap: 3px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    .tab-btn {
      flex: 1;
      min-width: 90px;
      white-space: nowrap;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 500;
      height: 28px;
      color: var(--color-text-secondary);
      background: none;
      border: none;
      cursor: pointer;
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
    }
    .tab-btn.active {
      background: var(--color-primary-lighter);
      color: var(--color-primary);
      font-weight: 600;
    }

    .stat-box {
      padding: var(--space-5);
      border: 1px solid var(--color-border);
      background: white;
      text-align: center;
    }
    .stat-box .lbl {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--color-text-secondary);
      display: block;
    }
    .stat-box .val {
      font-size: 1.75rem;
      font-weight: 800;
      display: block;
      margin-top: 4px;
    }

    .report-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: var(--space-6);
    }
    .report-card {
      padding: var(--space-5);
      border: 1px solid var(--color-border);
      background: white;
    }
    .report-card h3 {
      font-size: var(--font-size-base);
    }

    .f-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: var(--color-bg-secondary);
      border-radius: var(--radius);
      margin-bottom: var(--space-3);
    }

    @media (max-width: 900px) {
      .seller-main-content {
        margin-left: 0;
        padding: var(--space-4);
      }
      .report-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SellerReportsComponent implements OnInit {
  period: 'daily' | 'weekly' | 'monthly' | 'all' = 'monthly';
  orders: Order[] = [];
  filteredOrders: Order[] = [];

  totalSales = 0;
  averageOrderValue = 0;
  totalUnitsSold = 0;
  pickupCount = 0;
  deliveryCount = 0;
  topSellers: { name: string; units: number; revenue: number }[] = [];

  constructor(
    private authService: AuthService,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    const user = this.authService.user();
    if (user) {
      this.orders = this.orderService.getSellerOrders(user.id);
      this.computeMetrics();
    }
  }

  setPeriod(p: 'daily' | 'weekly' | 'monthly' | 'all') {
    this.period = p;
    this.computeMetrics();
  }

  computeMetrics() {
    const now = new Date().getTime();
    this.filteredOrders = this.orders.filter(o => {
      if (o.status === 'cancelled') return false;
      const orderTime = new Date(o.createdAt).getTime();

      if (this.period === 'daily') {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        return orderTime >= startOfDay.getTime();
      } else if (this.period === 'weekly') {
        return orderTime >= now - (7 * 24 * 60 * 60 * 1000);
      } else if (this.period === 'monthly') {
        return orderTime >= now - (30 * 24 * 60 * 60 * 1000);
      }
      return true;
    });

    this.totalSales = this.filteredOrders.reduce((sum, o) => sum + o.subtotal, 0);
    this.averageOrderValue = this.filteredOrders.length > 0 ? this.totalSales / this.filteredOrders.length : 0;
    this.pickupCount = this.filteredOrders.filter(o => o.fulfillmentType === 'pickup').length;
    this.deliveryCount = this.filteredOrders.filter(o => o.fulfillmentType === 'delivery').length;

    // Top sellers map
    const map = new Map<string, { name: string; units: number; revenue: number }>();
    let totalUnits = 0;

    this.filteredOrders.forEach(o => {
      o.items.forEach(i => {
        totalUnits += i.quantity;
        const exist = map.get(i.productId) || { name: i.productName, units: 0, revenue: 0 };
        exist.units += i.quantity;
        exist.revenue += i.subtotal;
        map.set(i.productId, exist);
      });
    });

    this.totalUnitsSold = totalUnits;
    this.topSellers = Array.from(map.values()).sort((a, b) => b.units - a.units).slice(0, 5);
  }

  exportCSV() {
    const rows = [
      ['Order Number', 'Date', 'Customer', 'Fulfillment', 'Status', 'Total'],
      ...this.filteredOrders.map(o => [
        o.orderNumber,
        new Date(o.createdAt).toLocaleDateString(),
        `"${o.customerName}"`,
        o.fulfillmentType,
        o.status,
        o.total.toFixed(2)
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GymPlate_Sales_Report_${this.period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  printReport() {
    window.print();
  }
}
