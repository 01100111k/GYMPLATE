import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { CartService } from '../../services/cart.service';
import { Product, Order } from '../../models';
import { CustomerNavComponent } from '../../shared/components/customer-nav.component';
import { PublicFooterComponent } from '../../shared/components/public-footer.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-customer-home',
  standalone: true,
  imports: [CommonModule, RouterLink, CustomerNavComponent, PublicFooterComponent, IconComponent],
  template: `
    <app-customer-nav></app-customer-nav>

    <main class="page-content customer-dashboard">
      <div class="container">
        <!-- Welcome Hero -->
        <div class="welcome-banner card">
          <div class="welcome-text">
            <span class="user-greeting">Welcome back,</span>
            <h1>{{ user()?.firstName }} {{ user()?.lastName }}</h1>
            <p>Ready to fuel your training? Explore today's freshly prepared high-protein selections.</p>
            <div class="welcome-actions">
              <a routerLink="/customer/explore" class="btn btn-primary">
                <app-icon name="compass" [size]="16"></app-icon>
                Explore Meals
              </a>
              <a routerLink="/customer/nutrition" class="btn btn-outline">
                <app-icon name="activity" [size]="16"></app-icon>
                View Nutrition Summary
              </a>
            </div>
          </div>
          <div class="macro-quick-card">
            <span class="widget-title">Your 30-Day Nutrition Log</span>
            <div class="widget-grid">
              <div class="wcell">
                <span class="wval">{{ totalNutrition.calories }}</span>
                <span class="wlbl">Calories</span>
              </div>
              <div class="wcell highlight">
                <span class="wval">{{ totalNutrition.protein }}g</span>
                <span class="wlbl">Protein</span>
              </div>
              <div class="wcell">
                <span class="wval">{{ totalNutrition.carbs }}g</span>
                <span class="wlbl">Carbs</span>
              </div>
              <div class="wcell">
                <span class="wval">{{ totalNutrition.fat }}g</span>
                <span class="wlbl">Fat</span>
              </div>
            </div>
            <small class="widget-footer">Based on {{ completedOrdersCount }} completed GymPlate meals</small>
          </div>
        </div>

        <!-- Active Orders Alert Banner if any -->
        <div class="active-order-alert card" *ngIf="activeOrder">
          <div class="flex items-center gap-3">
            <div class="status-pulse-dot"></div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-semibold text-sm">Order in Progress: {{ activeOrder.orderNumber }}</span>
                <span class="badge badge-info">{{ formatStatus(activeOrder.status) }}</span>
              </div>
              <p class="text-xs text-secondary mt-1">
                From {{ activeOrder.businessName }} &bull; {{ activeOrder.items.length }} items &bull; {{ activeOrder.total | currency:'PHP':'symbol' }}
              </p>
            </div>
          </div>
          <a [routerLink]="['/customer/orders', activeOrder.id]" class="btn btn-secondary btn-sm">
            Track Live Status
            <app-icon name="arrow-right" [size]="14"></app-icon>
          </a>
        </div>

        <!-- High Protein Recommendations -->
        <div class="section-block">
          <div class="section-title-row flex justify-between items-center mb-4">
            <div>
              <h2>Recommended High-Protein Meals</h2>
              <p class="text-xs text-secondary">Minimum 25 grams of lean protein per serving</p>
            </div>
            <a routerLink="/customer/explore" class="btn btn-ghost btn-sm">View All &rarr;</a>
          </div>

          <div class="grid-3">
            <div class="card meal-card" *ngFor="let p of recommendedProducts">
              <div class="meal-img-box">
                <img [src]="p.imageUrl" [alt]="p.name" />
                <span class="protein-tag">{{ p.nutrition.protein }}g Protein</span>
              </div>
              <div class="card-body meal-body">
                <div class="flex justify-between items-start mb-2">
                  <h3 class="meal-name">{{ p.name }}</h3>
                  <span class="meal-price">{{ p.price | currency:'PHP':'symbol' }}</span>
                </div>
                <p class="meal-desc">{{ p.description }}</p>

                <div class="macro-chips">
                  <span>{{ p.nutrition.calories }} kcal</span>
                  <span>{{ p.nutrition.carbs }}g carbs</span>
                  <span>{{ p.nutrition.fat }}g fat</span>
                </div>

                <div class="meal-footer">
                  <span class="text-xs text-tertiary">Stock: {{ p.stock }}</span>
                  <button class="btn btn-primary btn-sm" (click)="addToCart(p)">
                    <app-icon name="plus" [size]="14"></app-icon>
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Access Navigation Grid -->
        <div class="grid-3 quick-nav-grid mt-8">
          <a routerLink="/customer/explore" class="quick-nav-card card">
            <app-icon name="compass" [size]="24" color="var(--color-primary)"></app-icon>
            <div>
              <h4>Explore Kitchens</h4>
              <p>Filter by calories and macros</p>
            </div>
          </a>
          <a routerLink="/customer/orders" class="quick-nav-card card">
            <app-icon name="package" [size]="24" color="var(--color-primary)"></app-icon>
            <div>
              <h4>Order History</h4>
              <p>Past orders and itemized receipts</p>
            </div>
          </a>
          <a routerLink="/customer/nutrition" class="quick-nav-card card">
            <app-icon name="activity" [size]="24" color="var(--color-primary)"></app-icon>
            <div>
              <h4>Nutrition Logs</h4>
              <p>Track your dietary intake</p>
            </div>
          </a>
        </div>
      </div>
    </main>

    <app-public-footer></app-public-footer>
  `,
  styles: [`
    .customer-dashboard {
      background: var(--color-bg-secondary);
      min-height: 85vh;
    }
    .welcome-banner {
      background: #FFFFFF;
      padding: var(--space-8);
      border: 1px solid var(--color-border);
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: var(--space-8);
      align-items: center;
      margin-bottom: var(--space-6);
      border-radius: var(--radius-lg);
    }
    .user-greeting {
      font-size: var(--font-size-xs);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-primary);
    }
    .welcome-text h1 {
      font-size: 2.25rem;
      margin: 4px 0 var(--space-2);
    }
    .welcome-text p {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin-bottom: var(--space-5);
    }
    .welcome-actions {
      display: flex;
      gap: var(--space-3);
      flex-wrap: wrap;
    }

    .macro-quick-card {
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border);
      padding: var(--space-5);
      border-radius: var(--radius-md);
    }
    .widget-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-text-secondary);
      display: block;
      margin-bottom: var(--space-3);
    }
    .widget-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      margin-bottom: var(--space-3);
    }
    .wcell {
      background: white;
      padding: 8px 4px;
      border-radius: var(--radius-sm);
      text-align: center;
      border: 1px solid var(--color-border);
    }
    .wcell.highlight .wval {
      color: var(--color-primary);
    }
    .wval {
      font-size: var(--font-size-base);
      font-weight: 700;
      display: block;
    }
    .wlbl {
      font-size: 9px;
      color: var(--color-text-secondary);
      text-transform: uppercase;
    }
    .widget-footer {
      font-size: 10px;
      color: var(--color-text-tertiary);
      display: block;
      text-align: center;
    }

    .active-order-alert {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-4) var(--space-5);
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      margin-bottom: var(--space-6);
    }
    .status-pulse-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #3B82F6;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
    }

    .meal-card {
      display: flex;
      flex-direction: column;
    }
    .meal-img-box {
      height: 180px;
      position: relative;
      overflow: hidden;
    }
    .meal-img-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .protein-tag {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(45, 90, 61, 0.95);
      color: white;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: var(--radius-full);
    }
    .meal-body {
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .meal-name {
      font-size: var(--font-size-sm);
      font-weight: 600;
    }
    .meal-price {
      font-size: var(--font-size-sm);
      font-weight: 700;
      color: var(--color-primary);
    }
    .meal-desc {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      line-height: 1.4;
      margin-bottom: var(--space-3);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .macro-chips {
      display: flex;
      gap: 6px;
      font-size: 10px;
      color: var(--color-text-secondary);
      background: var(--color-bg-secondary);
      padding: 4px 6px;
      border-radius: var(--radius-sm);
      margin-bottom: var(--space-3);
    }
    .meal-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      padding-top: var(--space-2);
      border-top: 1px solid var(--color-border);
    }

    .quick-nav-card {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-4);
      text-decoration: none;
      color: var(--color-text);
      transition: transform var(--transition);
    }
    .quick-nav-card:hover {
      transform: translateY(-2px);
    }
    .quick-nav-card h4 {
      font-size: var(--font-size-sm);
      margin-bottom: 2px;
    }
    .quick-nav-card p {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }

    @media (max-width: 900px) {
      .welcome-banner {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CustomerHomeComponent implements OnInit {
  recommendedProducts: Product[] = [];
  activeOrder: Order | null = null;
  completedOrdersCount = 0;
  totalNutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private orderService: OrderService,
    private cartService: CartService,
    private router: Router
  ) {}

  user() {
    return this.authService.user();
  }

  ngOnInit() {
    const products = this.productService.getProducts();
    // High protein items
    this.recommendedProducts = products.filter(p => p.nutrition.protein >= 28).slice(0, 3);

    const currentUser = this.authService.user();
    if (currentUser) {
      const orders = this.orderService.getCustomerOrders(currentUser.id);
      // Active order
      this.activeOrder = orders.find(o => ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.status)) || null;

      // Completed orders calculation
      const completed = orders.filter(o => o.status === 'completed' || o.status === 'delivered');
      this.completedOrdersCount = completed.length;

      this.totalNutrition = completed.reduce((acc, order) => {
        order.items.forEach(item => {
          acc.calories += item.nutrition.calories;
          acc.protein += item.nutrition.protein;
          acc.carbs += item.nutrition.carbs;
          acc.fat += item.nutrition.fat;
        });
        return acc;
      }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    }
  }

  formatStatus(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pending Acceptance',
      confirmed: 'Confirmed by Kitchen',
      preparing: 'Preparing in Kitchen',
      ready: 'Ready for Pickup',
      out_for_delivery: 'Out for Delivery'
    };
    return labels[status] || status;
  }

  addToCart(product: Product) {
    const res = this.cartService.addItem(product, 1);
    if (res.success) {
      this.router.navigate(['/customer/cart']);
    } else {
      alert(res.message);
    }
  }
}
