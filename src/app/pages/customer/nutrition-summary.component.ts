import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Order, OrderItem } from '../../models';
import { CustomerNavComponent } from '../../shared/components/customer-nav.component';
import { PublicFooterComponent } from '../../shared/components/public-footer.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-nutrition-summary',
  standalone: true,
  imports: [CommonModule, CustomerNavComponent, PublicFooterComponent, IconComponent],
  template: `
    <app-customer-nav></app-customer-nav>

    <main class="page-content nutrition-page">
      <div class="container container-narrow">
        <div class="page-header mb-6">
          <div class="flex items-center gap-2 mb-1">
            <app-icon name="activity" [size]="20" color="var(--color-primary)"></app-icon>
            <span class="text-xs font-bold uppercase text-primary">Macronutrient Intelligence</span>
          </div>
          <h1>GymPlate Nutrition Summary</h1>
          <p>Real-time aggregation of calories, protein, carbs, and fat strictly calculated from your GymPlate orders.</p>
        </div>

        <!-- Date Range Filter Tabs -->
        <div class="filter-tabs card mb-6">
          <button
            class="tab-btn"
            [class.active]="timeframe === 'today'"
            (click)="setTimeframe('today')"
          >
            Today
          </button>
          <button
            class="tab-btn"
            [class.active]="timeframe === '7days'"
            (click)="setTimeframe('7days')"
          >
            Last 7 Days
          </button>
          <button
            class="tab-btn"
            [class.active]="timeframe === '30days'"
            (click)="setTimeframe('30days')"
          >
            Last 30 Days
          </button>
          <button
            class="tab-btn"
            [class.active]="timeframe === 'all'"
            (click)="setTimeframe('all')"
          >
            All Time
          </button>
        </div>

        <!-- Macro Stats Dashboard -->
        <div class="macro-stats-grid mb-6">
          <div class="stat-card card highlight-card">
            <span class="stat-lbl">Total Protein</span>
            <div class="stat-val-group">
              <span class="stat-num text-primary">{{ totals.protein }}</span>
              <span class="stat-unit">grams</span>
            </div>
            <span class="stat-sub">Building & Muscle Recovery</span>
          </div>

          <div class="stat-card card">
            <span class="stat-lbl">Total Calories</span>
            <div class="stat-val-group">
              <span class="stat-num">{{ totals.calories }}</span>
              <span class="stat-unit">kcal</span>
            </div>
            <span class="stat-sub">Energy Expenditure Fuel</span>
          </div>

          <div class="stat-card card">
            <span class="stat-lbl">Carbohydrates</span>
            <div class="stat-val-group">
              <span class="stat-num">{{ totals.carbs }}</span>
              <span class="stat-unit">grams</span>
            </div>
            <span class="stat-sub">Glycogen Replenishment</span>
          </div>

          <div class="stat-card card">
            <span class="stat-lbl">Dietary Fat</span>
            <div class="stat-val-group">
              <span class="stat-num">{{ totals.fat }}</span>
              <span class="stat-unit">grams</span>
            </div>
            <span class="stat-sub">Essential Fatty Acids</span>
          </div>
        </div>

        <!-- Macro Ratio Distribution Bar -->
        <div class="card distribution-card mb-6" *ngIf="totals.calories > 0">
          <div class="dist-header flex justify-between items-center mb-2">
            <span class="font-semibold text-xs uppercase">Macronutrient Caloric Breakdown</span>
            <span class="text-xs text-secondary">{{ timeframeLabel() }}</span>
          </div>
          <div class="ratio-bar">
            <div class="segment protein-seg" [style.width.%]="getMacroPercentage('protein')" title="Protein"></div>
            <div class="segment carbs-seg" [style.width.%]="getMacroPercentage('carbs')" title="Carbohydrates"></div>
            <div class="segment fat-seg" [style.width.%]="getMacroPercentage('fat')" title="Fats"></div>
          </div>
          <div class="ratio-legend mt-3">
            <div class="legend-item">
              <span class="dot protein-dot"></span>
              <span>Protein: {{ getMacroPercentage('protein') | number:'1.0-0' }}%</span>
            </div>
            <div class="legend-item">
              <span class="dot carbs-dot"></span>
              <span>Carbs: {{ getMacroPercentage('carbs') | number:'1.0-0' }}%</span>
            </div>
            <div class="legend-item">
              <span class="dot fat-dot"></span>
              <span>Fat: {{ getMacroPercentage('fat') | number:'1.0-0' }}%</span>
            </div>
          </div>
        </div>

        <!-- Contributing Foods Table -->
        <div class="card contributors-card mb-6">
          <div class="card-header-row flex justify-between items-center mb-4">
            <div>
              <h3>Contributing Meals in Selected Period</h3>
              <p class="text-xs text-secondary">Every meal ordered via GymPlate contributing to the macro totals above.</p>
            </div>
            <span class="badge badge-neutral">{{ contributingItems.length }} dishes</span>
          </div>

          <div class="table-container" *ngIf="contributingItems.length > 0">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Meal / Dish</th>
                  <th class="text-center">Order #</th>
                  <th class="text-center">Qty</th>
                  <th class="text-center">Calories</th>
                  <th class="text-center">Protein</th>
                  <th class="text-center">Carbs</th>
                  <th class="text-center">Fat</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let c of contributingItems">
                  <td>
                    <strong class="text-xs">{{ c.item.productName }}</strong>
                    <small class="text-secondary block">{{ c.orderDate | date:'shortDate' }}</small>
                  </td>
                  <td class="text-center font-mono text-xs">{{ c.orderNumber }}</td>
                  <td class="text-center font-semibold">{{ c.item.quantity }}</td>
                  <td class="text-center">{{ c.item.nutrition.calories }}</td>
                  <td class="text-center font-semibold text-primary">{{ c.item.nutrition.protein }}g</td>
                  <td class="text-center">{{ c.item.nutrition.carbs }}g</td>
                  <td class="text-center">{{ c.item.nutrition.fat }}g</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="empty-contributors text-center py-6" *ngIf="contributingItems.length === 0">
            <app-icon name="calendar" [size]="32" color="var(--color-text-tertiary)"></app-icon>
            <p class="text-xs text-secondary mt-2">No orders placed during the selected timeframe.</p>
            <button class="btn btn-secondary btn-sm mt-3" (click)="setTimeframe('all')">View All-Time Data</button>
          </div>
        </div>

        <!-- Mandatory Disclaimer Notice -->
        <div class="disclaimer-card card">
          <div class="flex items-start gap-3">
            <app-icon name="alert-circle" [size]="20" color="var(--color-warning)"></app-icon>
            <div>
              <strong class="text-xs block text-warning font-semibold">Dietary Transparency & Medical Disclaimer</strong>
              <p class="text-xs text-secondary mt-1">
                All nutrition metrics presented are calculated solely from meals ordered through the GymPlate platform. Macro values are provided by each commercial kitchen partner per specified recipe serving. This log is an athletic tracking utility and is not intended as medical, diagnostic, or clinical dietary advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <app-public-footer></app-public-footer>
  `,
  styles: [`
    .nutrition-page {
      background: var(--color-bg-secondary);
      min-height: 85vh;
    }
    .filter-tabs {
      display: flex;
      padding: 4px;
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
    .tab-btn.active {
      background: white;
      color: var(--color-primary);
      font-weight: 700;
      box-shadow: var(--shadow-sm);
    }

    .macro-stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-4);
    }
    .stat-card {
      padding: var(--space-5);
      border: 1px solid var(--color-border);
      text-align: center;
    }
    .stat-card.highlight-card {
      border-color: rgba(45, 90, 61, 0.4);
      background: var(--color-primary-lighter);
    }
    .stat-lbl {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-text-secondary);
      display: block;
      margin-bottom: 4px;
    }
    .stat-val-group {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 4px;
    }
    .stat-num {
      font-size: 2rem;
      font-weight: 800;
      line-height: 1;
    }
    .stat-unit {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }
    .stat-sub {
      font-size: 10px;
      color: var(--color-text-tertiary);
      display: block;
      margin-top: 4px;
    }

    .distribution-card {
      padding: var(--space-5);
      border: 1px solid var(--color-border);
    }
    .ratio-bar {
      display: flex;
      height: 14px;
      border-radius: var(--radius-full);
      overflow: hidden;
      background: var(--color-bg-secondary);
    }
    .protein-seg { background: var(--color-primary); }
    .carbs-seg { background: #3B82F6; }
    .fat-seg { background: #F59E0B; }

    .ratio-legend {
      display: flex;
      justify-content: center;
      gap: var(--space-6);
      font-size: var(--font-size-xs);
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .protein-dot { background: var(--color-primary); }
    .carbs-dot { background: #3B82F6; }
    .fat-dot { background: #F59E0B; }

    .contributors-card {
      padding: var(--space-5);
      border: 1px solid var(--color-border);
    }
    .contributors-card h3 {
      font-size: var(--font-size-base);
    }

    .disclaimer-card {
      background: #FFFBEB;
      border: 1px solid #FCD34D;
      padding: var(--space-4);
      border-radius: var(--radius-md);
    }

    @media (max-width: 800px) {
      .macro-stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class NutritionSummaryComponent implements OnInit {
  timeframe: 'today' | '7days' | '30days' | 'all' = '30days';
  totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  contributingItems: { item: OrderItem; orderNumber: string; orderDate: Date }[] = [];

  constructor(
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.calculateTotals();
  }

  setTimeframe(tf: 'today' | '7days' | '30days' | 'all') {
    this.timeframe = tf;
    this.calculateTotals();
  }

  timeframeLabel(): string {
    switch (this.timeframe) {
      case 'today': return 'Today';
      case '7days': return 'Last 7 Days';
      case '30days': return 'Last 30 Days';
      case 'all': return 'All Time';
    }
  }

  calculateTotals() {
    const user = this.authService.user();
    if (!user) return;

    const orders = this.orderService.getCustomerOrders(user.id);
    const now = new Date().getTime();

    // Filter orders by completed/delivered/active
    const validOrders = orders.filter(o => o.status !== 'cancelled');

    let filteredOrders: Order[] = [];
    if (this.timeframe === 'today') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      filteredOrders = validOrders.filter(o => new Date(o.createdAt).getTime() >= startOfDay.getTime());
    } else if (this.timeframe === '7days') {
      const past7 = now - (7 * 24 * 60 * 60 * 1000);
      filteredOrders = validOrders.filter(o => new Date(o.createdAt).getTime() >= past7);
    } else if (this.timeframe === '30days') {
      const past30 = now - (30 * 24 * 60 * 60 * 1000);
      filteredOrders = validOrders.filter(o => new Date(o.createdAt).getTime() >= past30);
    } else {
      filteredOrders = validOrders;
    }

    this.totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    this.contributingItems = [];

    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        this.totals.calories += item.nutrition.calories;
        this.totals.protein += item.nutrition.protein;
        this.totals.carbs += item.nutrition.carbs;
        this.totals.fat += item.nutrition.fat;

        this.contributingItems.push({
          item,
          orderNumber: order.orderNumber,
          orderDate: order.createdAt
        });
      });
    });
  }

  getMacroPercentage(macro: 'protein' | 'carbs' | 'fat'): number {
    const proteinCal = this.totals.protein * 4;
    const carbsCal = this.totals.carbs * 4;
    const fatCal = this.totals.fat * 9;
    const totalCal = proteinCal + carbsCal + fatCal;
    if (totalCal <= 0) return 33.3;

    if (macro === 'protein') return (proteinCal / totalCal) * 100;
    if (macro === 'carbs') return (carbsCal / totalCal) * 100;
    return (fatCal / totalCal) * 100;
  }
}
