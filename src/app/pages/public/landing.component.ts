import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { PublicNavComponent } from '../../shared/components/public-nav.component';
import { PublicFooterComponent } from '../../shared/components/public-footer.component';
import { IconComponent } from '../../shared/components/icon.component';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, PublicNavComponent, PublicFooterComponent, IconComponent],
  template: `
    <!-- Top Navigation (Exactly: Home, About, FAQs, Sign In, Sign Up) -->
    <app-public-nav></app-public-nav>

    <!-- Quick Demo Role Switcher Helper Bar -->
    <section class="demo-banner">
      <div class="container flex items-center justify-between flex-wrap gap-3">
        <div class="flex items-center gap-2">
          <app-icon name="info" [size]="15" color="var(--color-primary)"></app-icon>
          <span class="text-xs font-semibold text-secondary">Quick Demo Evaluation Switcher:</span>
        </div>
        <div class="demo-roles-group">
          <button type="button" class="demo-chip" (click)="quickLogin('customer')" title="Sign in as Customer Alex Rivera">
            <app-icon name="user" [size]="12"></app-icon>
            <span>Customer (Alex)</span>
          </button>
          <button type="button" class="demo-chip" (click)="quickLogin('seller')" title="Sign in as Approved Seller FitFuel Kitchen">
            <app-icon name="store" [size]="12"></app-icon>
            <span>Approved Seller (FitFuel)</span>
          </button>
          <button type="button" class="demo-chip" (click)="quickLogin('admin')" title="Sign in as Administrator James Chen">
            <app-icon name="shield" [size]="12"></app-icon>
            <span>Admin (James)</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ============================================
         1. HOME SECTION
         ============================================ -->
    <section id="home" class="hero-section">
      <div class="container hero-container">
        <!-- Hero Text -->
        <div class="hero-content">
          <div class="hero-badge">
            <app-icon name="target" [size]="14" color="var(--color-primary)"></app-icon>
            <span>Precision Nutrition for Fitness-Focused Individuals</span>
          </div>

          <h1 class="hero-title">
            Eat Better.<br />Order Smarter.<br /><span class="highlight">Stay on Track.</span>
          </h1>

          <p class="hero-desc">
            GymPlate helps fitness-focused individuals discover and order meals with complete nutritional information.
            Every dish showcases verified calories, protein, carbs, and fat per designated serving size so you hit your body goals with confidence.
          </p>

          <div class="hero-actions">
            <a routerLink="/explore" class="btn btn-primary btn-lg cta-btn">
              <app-icon name="compass" [size]="18"></app-icon>
              <span>Explore Meals</span>
            </a>
            <a routerLink="/auth/seller-register" class="btn btn-secondary btn-lg cta-btn">
              <app-icon name="store" [size]="18"></app-icon>
              <span>Become a Seller</span>
            </a>
          </div>

          <!-- Proof Metrics -->
          <div class="hero-stats">
            <div class="stat-item">
              <div class="stat-number">40g+</div>
              <div class="stat-label">High-Protein Staples</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-number">100%</div>
              <div class="stat-label">Macro Transparency</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-number">Verified</div>
              <div class="stat-label">Commercial Kitchens</div>
            </div>
          </div>
        </div>

        <!-- Hero Featured Card Graphic -->
        <div class="hero-visual">
          <div class="hero-card-featured card">
            <div class="card-img-wrap">
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=450&fit=crop"
                alt="Grilled Chicken Power Bowl"
                loading="eager"
              />
              <span class="macro-callout">42g Protein</span>
            </div>
            <div class="hero-card-body">
              <div class="hero-card-header">
                <h3>Grilled Chicken Power Bowl</h3>
                <span class="price">₱285.00</span>
              </div>
              <p class="seller-sub">By FitFuel Kitchen &bull; 450 kcal</p>

              <div class="mini-macro-bar">
                <div class="macro-pill">
                  <span class="pill-label">Protein</span>
                  <span class="pill-val">42g</span>
                </div>
                <div class="macro-pill">
                  <span class="pill-label">Carbs</span>
                  <span class="pill-val">35g</span>
                </div>
                <div class="macro-pill">
                  <span class="pill-label">Fat</span>
                  <span class="pill-val">12g</span>
                </div>
                <div class="macro-pill serving-pill">
                  <span class="pill-label">Serving</span>
                  <span class="pill-val">400g</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
         2. ABOUT SECTION
         ============================================ -->
    <section id="about" class="about-section">
      <div class="container">
        <!-- Section Header -->
        <div class="section-header text-center">
          <span class="section-tag">About GymPlate</span>
          <h2>Precision Nutrition Built for Real Training Goals</h2>
          <p class="section-subtitle">
            GymPlate is a commercial food ordering platform engineered specifically for athletes, gym-goers, and health-focused individuals.
            We eliminate nutritional guesswork by connecting you with verified commercial kitchens providing transparent macronutrient data on every dish.
          </p>
        </div>

        <!-- 3 Core Tenets -->
        <div class="about-grid grid-3">
          <div class="about-card card">
            <div class="about-icon-box">
              <app-icon name="target" [size]="24" color="var(--color-primary)"></app-icon>
            </div>
            <h3>Macro Transparency</h3>
            <p>
              Traditional restaurant menus hide oils, sugars, and exact calories. Every single dish on GymPlate displays designated serving sizes and itemized macros (Protein, Carbs, Fat, and Calories).
            </p>
          </div>

          <div class="about-card card">
            <div class="about-icon-box">
              <app-icon name="shield" [size]="24" color="var(--color-primary)"></app-icon>
            </div>
            <h3>Verified Kitchens Only</h3>
            <p>
              We do not allow unvetted food providers. Platform administrators inspect commercial sanitation permits, business licenses, and government identification before approving kitchen partners to publish menus.
            </p>
          </div>

          <div class="about-card card">
            <div class="about-icon-box">
              <app-icon name="activity" [size]="24" color="var(--color-primary)"></app-icon>
            </div>
            <h3>Cumulative Nutrition Logging</h3>
            <p>
              Every meal you order automatically logs into your personal Customer Nutrition Summary, allowing you to monitor your total nutritional intake across 1-day, 7-day, 30-day, or all-time periods.
            </p>
          </div>
        </div>

        <!-- Target Users Section -->
        <div class="target-users-block">
          <div class="users-header text-center">
            <span class="sub-tag">Who GymPlate Is For</span>
            <h3>Tailored to Your Personal Discipline</h3>
          </div>

          <div class="users-grid grid-4">
            <div class="user-pill-card">
              <div class="user-icon">
                <app-icon name="award" [size]="20" color="var(--color-primary)"></app-icon>
              </div>
              <h4>Bodybuilders & Lifters</h4>
              <p>Hit exact 1g per pound protein benchmarks with designated 35g+ and 40g+ high-protein meal options.</p>
            </div>

            <div class="user-pill-card">
              <div class="user-icon">
                <app-icon name="zap" [size]="20" color="var(--color-primary)"></app-icon>
              </div>
              <h4>Fat Loss & Cutting</h4>
              <p>Stay strictly within a caloric deficit with filtered meals under 350 kcal and 500 kcal with verified portions.</p>
            </div>

            <div class="user-pill-card">
              <div class="user-icon">
                <app-icon name="trending-up" [size]="20" color="var(--color-primary)"></app-icon>
              </div>
              <h4>Athletes & Endurance</h4>
              <p>Fuel strenuous high-volume workouts with clean, unrefined complex carbs, lean poultry, and nutrient-rich greens.</p>
            </div>

            <div class="user-pill-card">
              <div class="user-icon">
                <app-icon name="clock" [size]="20" color="var(--color-primary)"></app-icon>
              </div>
              <h4>Busy Professionals</h4>
              <p>Reclaim meal prep hours without settling for sodium-heavy fast food or nutrient-deficient delivery options.</p>
            </div>
          </div>
        </div>

        <!-- How It Works Flow -->
        <div class="how-it-works-box">
          <div class="text-center mb-10">
            <span class="sub-tag">Seamless Ordering Workflow</span>
            <h3>How Nutrition-Focused Food Ordering Works</h3>
          </div>

          <div class="steps-grid grid-3">
            <div class="step-card">
              <div class="step-number">01</div>
              <h4>Target Your Macros</h4>
              <p>
                Filter the catalog by your daily targets: High-Protein (&ge; 25g), Low-Calorie (&le; 350 kcal), Under 500 kcal, or customized calorie ranges.
              </p>
            </div>

            <div class="step-card">
              <div class="step-number">02</div>
              <h4>Order from One Verified Kitchen</h4>
              <p>
                To maintain culinary freshness and precise preparation standards, checkout is bundled per verified commercial kitchen partner.
              </p>
            </div>

            <div class="step-card">
              <div class="step-number">03</div>
              <h4>Track Order & Cumulative Fuel</h4>
              <p>
                Follow live order milestones from kitchen prep to fulfillment, download official itemized receipts, and watch your Nutrition Summary update.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
         3. FAQS SECTION (Replaces Contact & Support)
         ============================================ -->
    <section id="faqs" class="faqs-section">
      <div class="container">
        <!-- Section Header -->
        <div class="section-header text-center">
          <span class="section-tag">Frequently Asked Questions</span>
          <h2>Everything You Need to Know</h2>
          <p class="section-subtitle">
            Find immediate answers regarding nutritional tracking, commercial kitchen verification, ordering policies, and partner onboarding.
          </p>
        </div>

        <!-- FAQ Categories Filter Pills -->
        <div class="faq-category-pills">
          <button
            type="button"
            class="cat-pill"
            [class.active]="selectedCategory === 'all'"
            (click)="setCategory('all')"
          >
            All Questions ({{ faqs.length }})
          </button>
          <button
            type="button"
            class="cat-pill"
            [class.active]="selectedCategory === 'nutrition'"
            (click)="setCategory('nutrition')"
          >
            Macros & Nutrition
          </button>
          <button
            type="button"
            class="cat-pill"
            [class.active]="selectedCategory === 'ordering'"
            (click)="setCategory('ordering')"
          >
            Ordering & Checkout
          </button>
          <button
            type="button"
            class="cat-pill"
            [class.active]="selectedCategory === 'sellers'"
            (click)="setCategory('sellers')"
          >
            Kitchen Verification
          </button>
        </div>

        <!-- FAQ Accordion List -->
        <div class="faq-accordion-list">
          <div
            class="faq-card card"
            *ngFor="let item of filteredFaqs(); let i = index"
            [class.open]="isOpen(item)"
          >
            <button
              type="button"
              class="faq-question-btn"
              (click)="toggleFaq(item)"
              [attr.aria-expanded]="isOpen(item)"
            >
              <div class="question-text-wrap">
                <app-icon name="help-circle" [size]="18" color="var(--color-primary)" class="faq-q-icon"></app-icon>
                <span class="question-title">{{ item.question }}</span>
              </div>
              <div class="faq-toggle-icon">
                <app-icon [name]="isOpen(item) ? 'chevron-up' : 'chevron-down'" [size]="18"></app-icon>
              </div>
            </button>

            <div class="faq-answer-collapse" *ngIf="isOpen(item)">
              <div class="faq-answer-content">
                <p>{{ item.answer }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Public Footer -->
    <app-public-footer></app-public-footer>
  `,
  styles: [`
    /* Demo Banner */
    .demo-banner {
      background-color: var(--color-primary-lighter);
      border-bottom: 1px solid var(--color-primary-light);
      padding: var(--space-2) 0;
    }
    .demo-roles-group {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-wrap: wrap;
    }
    .demo-chip {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      padding: 3px 10px;
      font-size: var(--font-size-xs);
      font-weight: 500;
      color: var(--color-primary);
      background-color: var(--color-surface);
      border: 1px solid var(--color-primary-light);
      border-radius: var(--radius-full);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .demo-chip:hover {
      background-color: var(--color-primary);
      color: #FFFFFF;
      border-color: var(--color-primary);
    }

    /* Common Section Styles */
    .section-header {
      max-width: 720px;
      margin: 0 auto var(--space-12);
    }
    .section-tag {
      display: inline-block;
      font-size: var(--font-size-xs);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--color-primary);
      background-color: var(--color-primary-light);
      padding: 4px 12px;
      border-radius: var(--radius-full);
      margin-bottom: var(--space-3);
    }
    .sub-tag {
      display: inline-block;
      font-size: var(--font-size-xs);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--color-text-secondary);
      margin-bottom: var(--space-2);
    }
    .section-subtitle {
      color: var(--color-text-secondary);
      font-size: var(--font-size-base);
      line-height: 1.6;
      margin-top: var(--space-2);
    }

    /* ============================================
       1. HOME SECTION STYLES
       ============================================ */
    .hero-section {
      padding: var(--space-16) 0 var(--space-20);
      background: linear-gradient(180deg, #FFFFFF 0%, var(--color-bg-secondary) 100%);
      scroll-margin-top: var(--nav-height);
    }
    .hero-container {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: var(--space-12);
      align-items: center;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-1) var(--space-3);
      background-color: var(--color-primary-light);
      color: var(--color-primary);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: 600;
      margin-bottom: var(--space-4);
    }
    .hero-title {
      font-size: clamp(2.5rem, 5vw, 3.5rem);
      line-height: 1.15;
      font-weight: 800;
      letter-spacing: -0.025em;
      color: var(--color-text);
      margin-bottom: var(--space-5);
    }
    .hero-title .highlight {
      color: var(--color-primary);
    }
    .hero-desc {
      font-size: var(--font-size-lg);
      color: var(--color-text-secondary);
      line-height: 1.6;
      margin-bottom: var(--space-8);
      max-width: 540px;
    }
    .hero-actions {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      margin-bottom: var(--space-10);
      flex-wrap: wrap;
    }
    .cta-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
    }
    .hero-stats {
      display: flex;
      align-items: center;
      gap: var(--space-6);
      padding-top: var(--space-8);
      border-top: 1px solid var(--color-border);
    }
    .stat-number {
      font-size: var(--font-size-2xl);
      font-weight: 800;
      color: var(--color-text);
      letter-spacing: -0.02em;
    }
    .stat-label {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      font-weight: 500;
    }
    .stat-divider {
      width: 1px;
      height: 36px;
      background-color: var(--color-border);
    }
    .hero-visual {
      display: flex;
      justify-content: center;
    }
    .hero-card-featured {
      width: 100%;
      max-width: 420px;
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-xl);
      border: 1px solid var(--color-border);
      background: var(--color-surface);
      transition: transform var(--transition);
    }
    .hero-card-featured:hover {
      transform: translateY(-4px);
    }
    .card-img-wrap {
      position: relative;
      height: 240px;
      background-color: var(--color-bg-tertiary);
    }
    .card-img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .macro-callout {
      position: absolute;
      top: var(--space-3);
      right: var(--space-3);
      background-color: var(--color-primary);
      color: #FFFFFF;
      font-size: var(--font-size-xs);
      font-weight: 700;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    }
    .hero-card-body {
      padding: var(--space-5);
    }
    .hero-card-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: var(--space-1);
    }
    .hero-card-header h3 {
      font-size: var(--font-size-lg);
      font-weight: 700;
      color: var(--color-text);
    }
    .hero-card-header .price {
      font-size: var(--font-size-lg);
      font-weight: 800;
      color: var(--color-primary);
    }
    .seller-sub {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      margin-bottom: var(--space-4);
    }
    .mini-macro-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-2);
      padding: var(--space-3);
      background-color: var(--color-bg-secondary);
      border-radius: var(--radius-md);
      text-align: center;
    }
    .macro-pill {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .pill-label {
      font-size: 0.65rem;
      text-transform: uppercase;
      font-weight: 600;
      color: var(--color-text-tertiary);
    }
    .pill-val {
      font-size: var(--font-size-sm);
      font-weight: 700;
      color: var(--color-text);
    }

    /* ============================================
       2. ABOUT SECTION STYLES
       ============================================ */
    .about-section {
      padding: var(--space-20) 0;
      background-color: var(--color-surface);
      scroll-margin-top: var(--nav-height);
      border-top: 1px solid var(--color-border);
    }
    .about-card {
      padding: var(--space-8);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      background-color: var(--color-surface);
      transition: transform var(--transition), box-shadow var(--transition);
    }
    .about-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }
    .about-icon-box {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      background-color: var(--color-primary-light);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-4);
    }
    .about-card h3 {
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: var(--color-text);
      margin-bottom: var(--space-2);
    }
    .about-card p {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      line-height: 1.6;
    }

    .target-users-block {
      margin-top: var(--space-16);
      padding-top: var(--space-12);
      border-top: 1px solid var(--color-border);
    }
    .users-header {
      margin-bottom: var(--space-8);
    }
    .users-header h3 {
      font-size: var(--font-size-2xl);
      font-weight: 700;
    }
    .user-pill-card {
      background-color: var(--color-bg-secondary);
      padding: var(--space-6);
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
      transition: background-color var(--transition);
    }
    .user-pill-card:hover {
      background-color: var(--color-surface);
      box-shadow: var(--shadow-sm);
    }
    .user-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-full);
      background-color: var(--color-primary-light);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-3);
    }
    .user-pill-card h4 {
      font-size: var(--font-size-base);
      font-weight: 700;
      color: var(--color-text);
      margin-bottom: var(--space-2);
    }
    .user-pill-card p {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      line-height: 1.5;
    }

    .how-it-works-box {
      margin-top: var(--space-16);
      padding: var(--space-12);
      background-color: var(--color-bg-secondary);
      border-radius: var(--radius-xl);
      border: 1px solid var(--color-border);
    }
    .how-it-works-box h3 {
      font-size: var(--font-size-2xl);
      font-weight: 700;
    }
    .step-card {
      background: var(--color-surface);
      padding: var(--space-8);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
      position: relative;
    }
    .step-number {
      font-size: var(--font-size-3xl);
      font-weight: 800;
      color: var(--color-primary);
      opacity: 0.35;
      line-height: 1;
      margin-bottom: var(--space-3);
      font-family: monospace;
    }
    .step-card h4 {
      font-size: var(--font-size-lg);
      font-weight: 700;
      margin-bottom: var(--space-2);
      color: var(--color-text);
    }
    .step-card p {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      line-height: 1.6;
    }

    /* ============================================
       3. FAQS SECTION STYLES (Replaces Contacts)
       ============================================ */
    .faqs-section {
      padding: var(--space-20) 0;
      background-color: var(--color-bg-secondary);
      scroll-margin-top: var(--nav-height);
      border-top: 1px solid var(--color-border);
    }
    .faq-category-pills {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      margin-bottom: var(--space-10);
      flex-wrap: wrap;
    }
    .cat-pill {
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      color: var(--color-text-secondary);
      font-size: var(--font-size-xs);
      font-weight: 600;
      padding: 6px 16px;
      border-radius: var(--radius-full);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .cat-pill:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
    }
    .cat-pill.active {
      background-color: var(--color-primary);
      border-color: var(--color-primary);
      color: #FFFFFF;
      box-shadow: 0 1px 3px rgba(45, 90, 61, 0.25);
    }
    .faq-accordion-list {
      max-width: 840px;
      margin: 0 auto var(--space-12);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
    .faq-card {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      background-color: var(--color-surface);
      overflow: hidden;
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    }
    .faq-card:hover {
      border-color: #D1D5DB;
    }
    .faq-card.open {
      border-color: var(--color-primary);
      box-shadow: var(--shadow-sm);
    }
    .faq-question-btn {
      width: 100%;
      text-align: left;
      background: none;
      border: none;
      padding: var(--space-5) var(--space-6);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
      cursor: pointer;
      font-family: inherit;
    }
    .question-text-wrap {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }
    .faq-q-icon {
      flex-shrink: 0;
    }
    .question-title {
      font-size: var(--font-size-base);
      font-weight: 600;
      color: var(--color-text);
      line-height: 1.4;
    }
    .faq-card.open .question-title {
      color: var(--color-primary);
    }
    .faq-toggle-icon {
      color: var(--color-text-secondary);
      flex-shrink: 0;
      line-height: 0;
    }
    .faq-card.open .faq-toggle-icon {
      color: var(--color-primary);
    }
    .faq-answer-collapse {
      padding: 0 var(--space-6) var(--space-6) calc(var(--space-6) + 30px);
      animation: fadeIn 180ms ease-in-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .faq-answer-content p {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      line-height: 1.7;
      margin: 0;
    }

    /* Responsive */
    @media (max-width: 960px) {
      .hero-container {
        grid-template-columns: 1fr;
        gap: var(--space-10);
      }
      .hero-content {
        text-align: center;
      }
      .hero-desc {
        margin-left: auto;
        margin-right: auto;
      }
      .hero-actions {
        justify-content: center;
      }
      .hero-stats {
        justify-content: center;
      }
      .grid-4 {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 640px) {
      .hero-stats {
        flex-direction: column;
        gap: var(--space-4);
      }
      .stat-divider {
        display: none;
      }
      .grid-4 {
        grid-template-columns: 1fr;
      }
      .about-grid, .steps-grid {
        grid-template-columns: 1fr;
      }
      .hero-actions .btn {
        width: 100%;
        justify-content: center;
      }
      .banner-inner {
        flex-direction: column;
        text-align: center;
      }
      .banner-actions {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class LandingComponent implements OnInit {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private authService = inject(AuthService);

  selectedCategory = 'all';
  openFaqMap: Record<number, boolean> = { 0: true }; // First FAQ open by default

  faqs: FaqItem[] = [
    {
      category: 'nutrition',
      question: 'How are calories and macronutrients calculated for each dish?',
      answer: 'Every dish lists designated serving sizes and itemized macronutrient facts (Protein, Carbohydrates, Dietary Fat, and Calories). Macro values are calculated per designated serving (e.g. 400g serving) and submitted by verified commercial kitchen partners. While labeled seller-provided per standard regulations, our administrative staff regularly inspects portions and recipe claims to ensure nutritional honesty.'
    },
    {
      category: 'nutrition',
      question: 'Can I filter meals based on my exact fitness regimen (e.g. cutting vs. bulking)?',
      answer: 'Yes! GymPlate includes dedicated macro quick-filters for High-Protein (25g+ protein), Low-Calorie (<= 350 kcal), Under 500 kcal, as well as custom caloric range sliders. You can also sort the entire catalog by Highest Protein, Lowest Calories, or Price to fit your daily deficit or surplus.'
    },
    {
      category: 'nutrition',
      question: 'How does the Customer Nutrition Summary track my daily food intake?',
      answer: 'Whenever an order is completed, its exact protein, carbs, fat, and calories are automatically added to your personal Nutrition Summary. You can review your cumulative nutritional intake across 1-day, 7-day, 30-day, or all-time windows with a breakdown of which dishes contributed to your macros.'
    },
    {
      category: 'sellers',
      question: 'How does GymPlate verify commercial kitchens and meal prep partners?',
      answer: 'We do not permit unverified home kitchens. During the 5-step registration wizard, all food sellers must provide their official business registration, commercial address, and upload government-issued photo ID alongside valid Health Department Food Sanitation Permits. Platform administrators inspect these legal credentials before approving sellers to publish menus.'
    },
    {
      category: 'ordering',
      question: 'Why is checkout bundled to a single commercial kitchen per order?',
      answer: 'To guarantee food freshness, strict temperature preservation, and synchronous handover, every checkout order is prepared by one verified kitchen partner. If you add items from different kitchens, GymPlate will ask whether you want to clear your cart or complete your current kitchen order first.'
    },
    {
      category: 'ordering',
      question: 'What fulfillment and payment options are supported?',
      answer: 'Customers can choose between Contactless Doorstep Delivery or In-Store Kitchen Pickup. For demo security, payments are handled as Cash on Delivery (COD) or Cash on Pickup upon physical handover—no real credit cards or sensitive financial details are ever stored or collected.'
    },
    {
      category: 'ordering',
      question: 'How does GymPlate prevent food overselling?',
      answer: 'Every dish is tied to live real-time stock inventory. When customer orders are submitted, units are automatically deducted. When inventory reaches zero, dishes are automatically marked as "Sold Out" across the customer catalog to prevent overselling.'
    },
    {
      category: 'sellers',
      question: 'How can my meal prep kitchen or restaurant become a GymPlate partner?',
      answer: 'Click "Sign Up" in the navigation bar and select "Seller Registration". Complete our guided 5-step onboarding wizard with your commercial business info and credentials. Once approved by our compliance team, you will receive full access to your seller dashboard to publish macro-accurate dishes and dispatch orders.'
    }
  ];

  ngOnInit(): void {
    // Check fragment on page load / route transition
    this.activatedRoute.fragment.subscribe(fragment => {
      if (fragment) {
        setTimeout(() => {
          const el = document.getElementById(fragment);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 120);
      }
    });
  }

  // Quick Switcher for seamless test evaluation
  quickLogin(role: 'customer' | 'seller' | 'admin'): void {
    this.authService.quickLogin(role);
    if (role === 'customer') {
      this.router.navigate(['/customer']);
    } else if (role === 'seller') {
      this.router.navigate(['/seller']);
    } else if (role === 'admin') {
      this.router.navigate(['/admin']);
    }
  }

  // FAQ Accordion Controls
  setCategory(category: string): void {
    this.selectedCategory = category;
  }

  filteredFaqs(): FaqItem[] {
    if (this.selectedCategory === 'all') {
      return this.faqs;
    }
    return this.faqs.filter(f => f.category === this.selectedCategory);
  }

  isOpen(item: FaqItem): boolean {
    const idx = this.faqs.indexOf(item);
    return !!this.openFaqMap[idx];
  }

  toggleFaq(item: FaqItem): void {
    const idx = this.faqs.indexOf(item);
    this.openFaqMap[idx] = !this.openFaqMap[idx];
  }
}
