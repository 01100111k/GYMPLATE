import { Injectable } from '@angular/core';
import {
  User,
  UserRole,
  AccountStatus,
  SellerApplication,
  SellerStatus,
  Business,
  Product,
  NutritionInfo,
  Category,
  Order,
  OrderItem,
  OrderStatus,
  FulfillmentType,
  PaymentMethod,
  PaymentStatus,
  Review,
  Notification,
  NotificationType,
  ActivityLog,
  Report,
  ReportStatus,
  ReportReason,
  ReportUpdate
} from '../models';

@Injectable({ providedIn: 'root' })
export class MockDataService {

  // ─── Private Data Arrays ─────────────────────────────────────────────
  private users: User[] = [];
  private sellerApplications: SellerApplication[] = [];
  private businesses: Business[] = [];
  private products: Product[] = [];
  private categories: Category[] = [];
  private orders: Order[] = [];
  private reviews: Review[] = [];
  private reports: Report[] = [];
  private notifications: Notification[] = [];
  private activityLogs: ActivityLog[] = [];

  // ─── LocalStorage Keys ───────────────────────────────────────────────
  private readonly STORAGE_KEYS = {
    users: 'gymplate_users',
    sellerApplications: 'gymplate_seller_applications',
    businesses: 'gymplate_businesses',
    products: 'gymplate_products',
    categories: 'gymplate_categories',
    orders: 'gymplate_orders',
    reviews: 'gymplate_reviews',
    reports: 'gymplate_reports',
    notifications: 'gymplate_notifications',
    activityLogs: 'gymplate_activity_logs'
  };

  constructor() {
    this.initializeData();
  }

  // ─── Simple Hash Function ────────────────────────────────────────────
  /**
   * THIS IS NOT SECURE — base64 encoding is NOT encryption.
   * Used only for demo/mock purposes to simulate a password hash.
   */
  simpleHash(str: string): string {
    return btoa(str);
  }

  // ─── Initialization ──────────────────────────────────────────────────
  private initializeData(): void {
    const storedUsers = localStorage.getItem(this.STORAGE_KEYS.users);
    if (storedUsers) {
      this.loadFromLocalStorage();
    } else {
      this.loadDefaults();
      this.saveToLocalStorage();
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const parseWithDates = (json: string): any[] => {
        return JSON.parse(json, (key, value) => {
          if (typeof value === 'string') {
            const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
            if (dateRegex.test(value)) {
              return new Date(value);
            }
          }
          return value;
        });
      };

      const storedUsers = localStorage.getItem(this.STORAGE_KEYS.users);
      const storedApplications = localStorage.getItem(this.STORAGE_KEYS.sellerApplications);
      const storedBusinesses = localStorage.getItem(this.STORAGE_KEYS.businesses);
      const storedProducts = localStorage.getItem(this.STORAGE_KEYS.products);
      const storedCategories = localStorage.getItem(this.STORAGE_KEYS.categories);
      const storedOrders = localStorage.getItem(this.STORAGE_KEYS.orders);
      const storedReviews = localStorage.getItem(this.STORAGE_KEYS.reviews);
      const storedReports = localStorage.getItem(this.STORAGE_KEYS.reports);
      const storedNotifications = localStorage.getItem(this.STORAGE_KEYS.notifications);
      const storedActivityLogs = localStorage.getItem(this.STORAGE_KEYS.activityLogs);

      this.users = storedUsers ? parseWithDates(storedUsers) : [];
      this.sellerApplications = storedApplications ? parseWithDates(storedApplications) : [];
      this.businesses = storedBusinesses ? parseWithDates(storedBusinesses) : [];
      this.products = storedProducts ? parseWithDates(storedProducts) : [];
      this.categories = storedCategories ? parseWithDates(storedCategories) : [];
      this.orders = storedOrders ? parseWithDates(storedOrders) : [];
      this.reviews = storedReviews ? parseWithDates(storedReviews) : [];
      this.reports = storedReports ? parseWithDates(storedReports) : [];
      this.notifications = storedNotifications ? parseWithDates(storedNotifications) : [];
      this.activityLogs = storedActivityLogs ? parseWithDates(storedActivityLogs) : [];

      // If users loaded from storage don't have passwordHash, re-merge from defaults
      if (this.users.length > 0 && !this.users[0].passwordHash) {
        const defaults = this.getDefaultUsers();
        this.users = this.users.map(u => {
          const defaultUser = defaults.find(d => d.id === u.id);
          return { ...u, passwordHash: defaultUser ? defaultUser.passwordHash : '' };
        });
      }
    } catch {
      this.loadDefaults();
      this.saveToLocalStorage();
    }
  }

  private saveToLocalStorage(): void {
    try {
      // Save users WITHOUT passwordHash for security
      const usersForStorage = this.users.map(u => {
        const { passwordHash, ...safe } = u;
        return safe;
      });
      localStorage.setItem(this.STORAGE_KEYS.users, JSON.stringify(usersForStorage));
      localStorage.setItem(this.STORAGE_KEYS.sellerApplications, JSON.stringify(this.sellerApplications));
      localStorage.setItem(this.STORAGE_KEYS.businesses, JSON.stringify(this.businesses));
      localStorage.setItem(this.STORAGE_KEYS.products, JSON.stringify(this.products));
      localStorage.setItem(this.STORAGE_KEYS.categories, JSON.stringify(this.categories));
      localStorage.setItem(this.STORAGE_KEYS.orders, JSON.stringify(this.orders));
      localStorage.setItem(this.STORAGE_KEYS.reviews, JSON.stringify(this.reviews));
      localStorage.setItem(this.STORAGE_KEYS.reports, JSON.stringify(this.reports));
      localStorage.setItem(this.STORAGE_KEYS.notifications, JSON.stringify(this.notifications));
      localStorage.setItem(this.STORAGE_KEYS.activityLogs, JSON.stringify(this.activityLogs));
    } catch {
      console.warn('MockDataService: Failed to save to localStorage');
    }
  }

  private loadDefaults(): void {
    this.users = this.getDefaultUsers();
    this.sellerApplications = this.getDefaultSellerApplications();
    this.businesses = this.getDefaultBusinesses();
    this.categories = this.getDefaultCategories();
    this.products = this.getDefaultProducts();
    this.orders = this.getDefaultOrders();
    this.reviews = this.getDefaultReviews();
    this.reports = this.getDefaultReports();
    this.notifications = this.getDefaultNotifications();
    this.activityLogs = this.getDefaultActivityLogs();
  }

  /** Reset all data back to factory defaults and clear localStorage */
  resetToDefaults(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    this.loadDefaults();
    this.saveToLocalStorage();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // DEFAULT DATA FACTORIES
  // ═══════════════════════════════════════════════════════════════════════

  // ─── Users ───────────────────────────────────────────────────────────
  private getDefaultUsers(): User[] {
    return [
      {
        id: 'user-1',
        email: 'customer@gymplate.com',
        passwordHash: this.simpleHash('Customer123!'),
        role: 'customer' as UserRole,
        firstName: 'Alex',
        lastName: 'Rivera',
        phone: '(555) 123-4567',
        address: '123 Fitness Ave',
        city: 'Makati',
        state: 'Metro Manila',
        zipCode: '1200',
        accountStatus: 'active' as AccountStatus,
        createdAt: new Date('2024-01-15T08:00:00'),
        updatedAt: new Date('2024-01-15T08:00:00')
      },
      {
        id: 'user-2',
        email: 'seller@gymplate.com',
        passwordHash: this.simpleHash('Seller123!'),
        role: 'seller' as UserRole,
        firstName: 'Maria',
        lastName: 'Santos',
        phone: '(555) 234-5678',
        address: '456 Market St',
        city: 'Taguig',
        state: 'Metro Manila',
        zipCode: '1630',
        accountStatus: 'active' as AccountStatus,
        createdAt: new Date('2024-01-10T10:00:00'),
        updatedAt: new Date('2024-02-01T14:30:00')
      },
      {
        id: 'user-3',
        email: 'admin@gymplate.com',
        passwordHash: this.simpleHash('Admin123!'),
        role: 'admin' as UserRole,
        firstName: 'James',
        lastName: 'Chen',
        phone: '(555) 345-6789',
        address: '789 Admin Blvd',
        city: 'Quezon City',
        state: 'Metro Manila',
        zipCode: '1100',
        accountStatus: 'active' as AccountStatus,
        createdAt: new Date('2024-01-01T00:00:00'),
        updatedAt: new Date('2024-01-01T00:00:00')
      },
      {
        id: 'user-4',
        email: 'pending@gymplate.com',
        passwordHash: this.simpleHash('Pending123!'),
        role: 'seller' as UserRole,
        firstName: 'David',
        lastName: 'Kim',
        phone: '(555) 456-7890',
        address: '321 Chef Lane',
        city: 'Pasig',
        state: 'Metro Manila',
        zipCode: '1600',
        accountStatus: 'active' as AccountStatus,
        createdAt: new Date('2024-03-01T09:00:00'),
        updatedAt: new Date('2024-03-01T09:00:00')
      },
      {
        id: 'user-5',
        email: 'rejected@gymplate.com',
        passwordHash: this.simpleHash('Rejected123!'),
        role: 'seller' as UserRole,
        firstName: 'Sarah',
        lastName: 'Johnson',
        phone: '(555) 567-8901',
        address: '654 Bistro Rd',
        city: 'Mandaluyong',
        state: 'Metro Manila',
        zipCode: '1550',
        accountStatus: 'active' as AccountStatus,
        createdAt: new Date('2024-02-20T11:00:00'),
        updatedAt: new Date('2024-03-05T16:00:00')
      },
      {
        id: 'user-6',
        email: 'john@example.com',
        passwordHash: this.simpleHash('John1234!'),
        role: 'customer' as UserRole,
        firstName: 'John',
        lastName: 'Martinez',
        phone: '(555) 678-9012',
        address: '987 Gym Rd',
        city: 'Makati',
        state: 'Metro Manila',
        zipCode: '1210',
        accountStatus: 'active' as AccountStatus,
        createdAt: new Date('2024-02-10T07:30:00'),
        updatedAt: new Date('2024-02-10T07:30:00')
      }
    ];
  }

  // ─── Seller Applications ─────────────────────────────────────────────
  private getDefaultSellerApplications(): SellerApplication[] {
    return [
      {
        id: 'app-1',
        userId: 'user-2',
        personalInfo: {
          firstName: 'Maria',
          lastName: 'Santos',
          phone: '(555) 234-5678',
          address: '456 Market St',
          city: 'Taguig',
          state: 'Metro Manila',
          zipCode: '1630'
        },
        businessInfo: {
          businessName: 'FitFuel Kitchen',
          businessType: 'Restaurant / Meal Prep',
          businessAddress: '100 BGC Corporate Center, 11th Avenue',
          businessCity: 'Taguig',
          businessState: 'Metro Manila',
          businessZipCode: '1634',
          businessDescription: 'FitFuel Kitchen specializes in high-protein, macro-friendly meals designed for fitness enthusiasts, athletes, and health-conscious individuals. All meals are freshly prepared daily with locally sourced ingredients.',
          businessPhone: '(555) 234-5679',
          businessEmail: 'hello@fitfuelkitchen.com',
          operatingHours: 'Mon-Sat: 7:00 AM - 9:00 PM, Sun: 8:00 AM - 6:00 PM'
        },
        documents: {
          governmentId: { name: 'maria_santos_id.pdf', url: '/assets/docs/maria_santos_id.pdf', type: 'application/pdf' },
          businessPermit: { name: 'fitfuel_permit_2024.pdf', url: '/assets/docs/fitfuel_permit_2024.pdf', type: 'application/pdf' },
          supportingDocs: [
            { name: 'food_safety_cert.pdf', url: '/assets/docs/food_safety_cert.pdf', type: 'application/pdf' }
          ]
        },
        status: 'approved' as SellerStatus,
        reviewNotes: 'All documents verified. Business permit and food safety certification are valid.',
        reviewedBy: 'user-3',
        reviewedAt: new Date('2024-01-20T14:00:00'),
        submittedAt: new Date('2024-01-12T10:30:00'),
        updatedAt: new Date('2024-01-20T14:00:00')
      },
      {
        id: 'app-2',
        userId: 'user-4',
        personalInfo: {
          firstName: 'David',
          lastName: 'Kim',
          phone: '(555) 456-7890',
          address: '321 Chef Lane',
          city: 'Pasig',
          state: 'Metro Manila',
          zipCode: '1600'
        },
        businessInfo: {
          businessName: 'Green Bowl Cafe',
          businessType: 'Health-Food Cafe',
          businessAddress: '55 Ortigas Center, Meralco Ave',
          businessCity: 'Pasig',
          businessState: 'Metro Manila',
          businessZipCode: '1605',
          businessDescription: 'Green Bowl Cafe offers nourishing plant-forward bowls and smoothies. We focus on organic, sustainably sourced ingredients to create wholesome, delicious meals that fuel an active lifestyle.',
          businessPhone: '(555) 456-7891',
          businessEmail: 'info@greenbowlcafe.com',
          operatingHours: 'Mon-Fri: 6:30 AM - 8:00 PM, Sat-Sun: 8:00 AM - 5:00 PM'
        },
        documents: {
          governmentId: { name: 'david_kim_id.pdf', url: '/assets/docs/david_kim_id.pdf', type: 'application/pdf' },
          businessPermit: { name: 'greenbowl_permit_2024.pdf', url: '/assets/docs/greenbowl_permit_2024.pdf', type: 'application/pdf' }
        },
        status: 'pending' as SellerStatus,
        submittedAt: new Date('2024-03-02T09:15:00'),
        updatedAt: new Date('2024-03-02T09:15:00')
      },
      {
        id: 'app-3',
        userId: 'user-5',
        personalInfo: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          phone: '(555) 567-8901',
          address: '654 Bistro Rd',
          city: 'Mandaluyong',
          state: 'Metro Manila',
          zipCode: '1550'
        },
        businessInfo: {
          businessName: 'PowerPlate',
          businessType: 'Meal Prep Service',
          businessAddress: '22 Shaw Blvd, Wack Wack',
          businessCity: 'Mandaluyong',
          businessState: 'Metro Manila',
          businessZipCode: '1555',
          businessDescription: 'PowerPlate is a meal prep delivery service catering to bodybuilders, CrossFit athletes, and anyone looking to hit their macros. We offer weekly meal plans with customizable portions.',
          businessPhone: '(555) 567-8902',
          businessEmail: 'orders@powerplate.com',
          operatingHours: 'Mon-Sat: 5:00 AM - 7:00 PM'
        },
        documents: {
          governmentId: { name: 'sarah_johnson_id.pdf', url: '/assets/docs/sarah_johnson_id.pdf', type: 'application/pdf' },
          businessPermit: { name: 'powerplate_permit_2023.pdf', url: '/assets/docs/powerplate_permit_2023.pdf', type: 'application/pdf' }
        },
        status: 'rejected' as SellerStatus,
        rejectionReason: 'Business permit expired. Please submit a current valid business permit.',
        reviewNotes: 'Government ID verified. Business permit is from 2023 and has expired.',
        reviewedBy: 'user-3',
        reviewedAt: new Date('2024-03-05T16:00:00'),
        submittedAt: new Date('2024-02-22T14:45:00'),
        updatedAt: new Date('2024-03-05T16:00:00')
      }
    ];
  }

  // ─── Businesses ──────────────────────────────────────────────────────
  private getDefaultBusinesses(): Business[] {
    return [
      {
        id: 'biz-1',
        sellerId: 'user-2',
        businessName: 'FitFuel Kitchen',
        businessType: 'Meal Prep & Health Food',
        description: 'FitFuel Kitchen specializes in high-protein, macro-friendly meals designed for fitness enthusiasts, athletes, and health-conscious individuals. Every dish is freshly prepared daily with locally sourced ingredients, carefully portioned to help you meet your nutritional goals without sacrificing flavor.',
        address: '100 BGC Corporate Center, 11th Avenue',
        city: 'Taguig',
        state: 'Metro Manila',
        zipCode: '1634',
        phone: '(555) 234-5679',
        email: 'hello@fitfuelkitchen.com',
        operatingHours: 'Mon-Sat: 7:00 AM - 9:00 PM, Sun: 8:00 AM - 6:00 PM',
        isActive: true,
        createdAt: new Date('2024-01-20T14:00:00'),
        updatedAt: new Date('2024-01-20T14:00:00')
      }
    ];
  }

  // ─── Categories ──────────────────────────────────────────────────────
  private getDefaultCategories(): Category[] {
    return [
      {
        id: 'cat-1',
        name: 'Protein Bowls',
        description: 'High-protein grain and rice bowls packed with lean meats, vegetables, and wholesome carbs.',
        isActive: true
      },
      {
        id: 'cat-2',
        name: 'Salads',
        description: 'Fresh, nutrient-dense salads with generous protein toppings and house-made dressings.',
        isActive: true
      },
      {
        id: 'cat-3',
        name: 'Wraps',
        description: 'Whole-wheat wraps stuffed with lean proteins, fresh vegetables, and flavorful sauces.',
        isActive: true
      },
      {
        id: 'cat-4',
        name: 'Smoothies',
        description: 'Protein-packed smoothies and shakes made with real fruit and premium protein powder.',
        isActive: true
      },
      {
        id: 'cat-5',
        name: 'Snacks',
        description: 'Healthy snack options including protein bars, energy bites, and baked goods.',
        isActive: true
      },
      {
        id: 'cat-6',
        name: 'Meal Prep',
        description: 'Pre-portioned weekly meal prep packages designed for specific calorie and macro targets.',
        isActive: true
      }
    ];
  }

  // ─── Products ────────────────────────────────────────────────────────
  private getDefaultProducts(): Product[] {
    return [
      {
        id: 'prod-1',
        sellerId: 'user-2',
        businessId: 'biz-1',
        name: 'Grilled Chicken Power Bowl',
        description: 'Herb-marinated grilled chicken breast served over brown rice with roasted sweet potatoes, steamed broccoli, and a tangy lemon-tahini drizzle. A perfectly balanced meal to fuel your workouts.',
        category: 'Protein Bowls',
        price: 285.00,
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
        nutrition: {
          servingSize: '1 bowl (400g)',
          calories: 450,
          protein: 42,
          carbs: 35,
          fat: 12
        },
        stock: 25,
        isAvailable: true,
        isDisabled: false,
        createdAt: new Date('2024-01-25T10:00:00'),
        updatedAt: new Date('2024-01-25T10:00:00')
      },
      {
        id: 'prod-2',
        sellerId: 'user-2',
        businessId: 'biz-1',
        name: 'Salmon Teriyaki Bowl',
        description: 'Pan-seared Atlantic salmon glazed with house-made teriyaki sauce, served on a bed of jasmine rice with edamame, pickled ginger, cucumber, and sesame seeds.',
        category: 'Protein Bowls',
        price: 350.00,
        imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
        nutrition: {
          servingSize: '1 bowl (420g)',
          calories: 520,
          protein: 38,
          carbs: 42,
          fat: 18
        },
        stock: 15,
        isAvailable: true,
        isDisabled: false,
        createdAt: new Date('2024-01-25T10:15:00'),
        updatedAt: new Date('2024-01-25T10:15:00')
      },
      {
        id: 'prod-3',
        sellerId: 'user-2',
        businessId: 'biz-1',
        name: 'Turkey Avocado Wrap',
        description: 'Sliced oven-roasted turkey breast with creamy avocado, baby spinach, tomatoes, red onion, and a light chipotle mayo wrapped in a whole-wheat tortilla.',
        category: 'Wraps',
        price: 240.00,
        imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop',
        nutrition: {
          servingSize: '1 wrap (280g)',
          calories: 380,
          protein: 32,
          carbs: 28,
          fat: 14
        },
        stock: 30,
        isAvailable: true,
        isDisabled: false,
        createdAt: new Date('2024-01-25T10:30:00'),
        updatedAt: new Date('2024-01-25T10:30:00')
      },
      {
        id: 'prod-4',
        sellerId: 'user-2',
        businessId: 'biz-1',
        name: 'Greek Protein Salad',
        description: 'Crisp romaine lettuce tossed with grilled chicken, kalamata olives, cherry tomatoes, cucumber, red onion, feta cheese, and a zesty Greek vinaigrette.',
        category: 'Salads',
        price: 250.00,
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
        nutrition: {
          servingSize: '1 salad (350g)',
          calories: 320,
          protein: 28,
          carbs: 18,
          fat: 16
        },
        stock: 20,
        isAvailable: true,
        isDisabled: false,
        createdAt: new Date('2024-01-25T10:45:00'),
        updatedAt: new Date('2024-01-25T10:45:00')
      },
      {
        id: 'prod-5',
        sellerId: 'user-2',
        businessId: 'biz-1',
        name: 'Berry Protein Smoothie',
        description: 'A refreshing blend of mixed berries, banana, vanilla whey protein, Greek yogurt, and almond milk. The perfect post-workout recovery drink.',
        category: 'Smoothies',
        price: 180.00,
        imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop',
        nutrition: {
          servingSize: '1 glass (450ml)',
          calories: 280,
          protein: 25,
          carbs: 32,
          fat: 4
        },
        stock: 40,
        isAvailable: true,
        isDisabled: false,
        createdAt: new Date('2024-01-25T11:00:00'),
        updatedAt: new Date('2024-01-25T11:00:00')
      },
      {
        id: 'prod-6',
        sellerId: 'user-2',
        businessId: 'biz-1',
        name: 'Beef & Quinoa Bowl',
        description: 'Tender grass-fed beef strips stir-fried with bell peppers and onions, served over fluffy quinoa with a side of roasted vegetables and chimichurri sauce.',
        category: 'Protein Bowls',
        price: 320.00,
        imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
        nutrition: {
          servingSize: '1 bowl (430g)',
          calories: 580,
          protein: 45,
          carbs: 48,
          fat: 16
        },
        stock: 18,
        isAvailable: true,
        isDisabled: false,
        createdAt: new Date('2024-01-25T11:15:00'),
        updatedAt: new Date('2024-01-25T11:15:00')
      },
      {
        id: 'prod-7',
        sellerId: 'user-2',
        businessId: 'biz-1',
        name: 'Egg White & Veggie Wrap',
        description: 'Fluffy egg whites scrambled with sautéed spinach, mushrooms, bell peppers, and a sprinkle of low-fat mozzarella, all wrapped in a sun-dried tomato tortilla.',
        category: 'Wraps',
        price: 210.00,
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
        nutrition: {
          servingSize: '1 wrap (260g)',
          calories: 290,
          protein: 24,
          carbs: 22,
          fat: 8
        },
        stock: 35,
        isAvailable: true,
        isDisabled: false,
        createdAt: new Date('2024-01-25T11:30:00'),
        updatedAt: new Date('2024-01-25T11:30:00')
      },
      {
        id: 'prod-8',
        sellerId: 'user-2',
        businessId: 'biz-1',
        name: 'Asian Chicken Salad',
        description: 'Shredded sesame-ginger chicken over a vibrant mix of Napa cabbage, shredded carrots, edamame, mandarin oranges, crispy wontons, and a toasted sesame dressing.',
        category: 'Salads',
        price: 260.00,
        imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop',
        nutrition: {
          servingSize: '1 salad (370g)',
          calories: 350,
          protein: 30,
          carbs: 22,
          fat: 14
        },
        stock: 22,
        isAvailable: true,
        isDisabled: false,
        createdAt: new Date('2024-01-25T11:45:00'),
        updatedAt: new Date('2024-01-25T11:45:00')
      },
      {
        id: 'prod-9',
        sellerId: 'user-2',
        businessId: 'biz-1',
        name: 'Chocolate Peanut Butter Smoothie',
        description: 'Rich chocolate whey protein blended with natural peanut butter, banana, oats, and almond milk. A decadent-tasting smoothie that packs a serious protein punch.',
        category: 'Smoothies',
        price: 190.00,
        imageUrl: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400&h=300&fit=crop',
        nutrition: {
          servingSize: '1 glass (450ml)',
          calories: 340,
          protein: 28,
          carbs: 36,
          fat: 8
        },
        stock: 30,
        isAvailable: true,
        isDisabled: false,
        createdAt: new Date('2024-01-25T12:00:00'),
        updatedAt: new Date('2024-01-25T12:00:00')
      },
      {
        id: 'prod-10',
        sellerId: 'user-2',
        businessId: 'biz-1',
        name: 'Quinoa Veggie Bowl',
        description: 'A hearty plant-based bowl with tri-color quinoa, roasted chickpeas, sweet potato, avocado, kale, cherry tomatoes, and a creamy turmeric-tahini dressing.',
        category: 'Protein Bowls',
        price: 265.00,
        imageUrl: 'https://images.unsplash.com/photo-1543339308-d6a60ac89b00?w=400&h=300&fit=crop',
        nutrition: {
          servingSize: '1 bowl (400g)',
          calories: 400,
          protein: 18,
          carbs: 52,
          fat: 12
        },
        stock: 0,
        isAvailable: false,
        isDisabled: false,
        createdAt: new Date('2024-01-25T12:15:00'),
        updatedAt: new Date('2024-03-10T09:00:00')
      }
    ];
  }

  // ─── Orders ──────────────────────────────────────────────────────────
  private getDefaultOrders(): Order[] {
    return [
      {
        id: 'order-1',
        orderNumber: 'GP-2024-001',
        customerId: 'user-1',
        customerName: 'Alex Rivera',
        customerEmail: 'customer@gymplate.com',
        customerPhone: '(555) 123-4567',
        customerAddress: '123 Fitness Ave, Makati, Metro Manila 1200',
        sellerId: 'user-2',
        sellerName: 'Maria Santos',
        businessId: 'biz-1',
        businessName: 'FitFuel Kitchen',
        items: [
          {
            id: 'item-1',
            productId: 'prod-1',
            productName: 'Grilled Chicken Power Bowl',
            productImageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
            quantity: 2,
            unitPrice: 285.00,
            subtotal: 570.00,
            nutrition: {
              calories: 900,
              protein: 84,
              carbs: 70,
              fat: 24
            }
          }
        ],
        subtotal: 570.00,
        deliveryFee: 0,
        serviceFee: 28.50,
        total: 598.50,
        fulfillmentType: 'pickup' as FulfillmentType,
        paymentMethod: 'cash_on_pickup' as PaymentMethod,
        paymentStatus: 'paid' as PaymentStatus,
        status: 'completed' as OrderStatus,
        statusHistory: [
          { status: 'pending' as OrderStatus, timestamp: new Date('2024-02-15T12:00:00'), note: 'Order placed' },
          { status: 'confirmed' as OrderStatus, timestamp: new Date('2024-02-15T12:05:00'), note: 'Order confirmed by seller' },
          { status: 'preparing' as OrderStatus, timestamp: new Date('2024-02-15T12:10:00'), note: 'Preparation started' },
          { status: 'ready' as OrderStatus, timestamp: new Date('2024-02-15T12:35:00'), note: 'Order ready for pickup' },
          { status: 'completed' as OrderStatus, timestamp: new Date('2024-02-15T12:50:00'), note: 'Order picked up by customer' }
        ],
        createdAt: new Date('2024-02-15T12:00:00'),
        updatedAt: new Date('2024-02-15T12:50:00')
      },
      {
        id: 'order-2',
        orderNumber: 'GP-2024-002',
        customerId: 'user-1',
        customerName: 'Alex Rivera',
        customerEmail: 'customer@gymplate.com',
        customerPhone: '(555) 123-4567',
        customerAddress: '123 Fitness Ave, Makati, Metro Manila 1200',
        sellerId: 'user-2',
        sellerName: 'Maria Santos',
        businessId: 'biz-1',
        businessName: 'FitFuel Kitchen',
        items: [
          {
            id: 'item-2',
            productId: 'prod-3',
            productName: 'Turkey Avocado Wrap',
            productImageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop',
            quantity: 1,
            unitPrice: 240.00,
            subtotal: 240.00,
            nutrition: {
              calories: 380,
              protein: 32,
              carbs: 28,
              fat: 14
            }
          }
        ],
        subtotal: 240.00,
        deliveryFee: 49.00,
        serviceFee: 12.00,
        total: 301.00,
        fulfillmentType: 'delivery' as FulfillmentType,
        paymentMethod: 'cash_on_delivery' as PaymentMethod,
        paymentStatus: 'pending' as PaymentStatus,
        status: 'preparing' as OrderStatus,
        specialInstructions: 'Please add extra avocado if possible.',
        statusHistory: [
          { status: 'pending' as OrderStatus, timestamp: new Date('2024-03-10T18:30:00'), note: 'Order placed' },
          { status: 'confirmed' as OrderStatus, timestamp: new Date('2024-03-10T18:35:00'), note: 'Order confirmed by seller' },
          { status: 'preparing' as OrderStatus, timestamp: new Date('2024-03-10T18:40:00'), note: 'Preparation started' }
        ],
        createdAt: new Date('2024-03-10T18:30:00'),
        updatedAt: new Date('2024-03-10T18:40:00')
      },
      {
        id: 'order-3',
        orderNumber: 'GP-2024-003',
        customerId: 'user-6',
        customerName: 'John Martinez',
        customerEmail: 'john@example.com',
        customerPhone: '(555) 678-9012',
        customerAddress: '987 Gym Rd, Makati, Metro Manila 1210',
        sellerId: 'user-2',
        sellerName: 'Maria Santos',
        businessId: 'biz-1',
        businessName: 'FitFuel Kitchen',
        items: [
          {
            id: 'item-3',
            productId: 'prod-2',
            productName: 'Salmon Teriyaki Bowl',
            productImageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
            quantity: 1,
            unitPrice: 350.00,
            subtotal: 350.00,
            nutrition: {
              calories: 520,
              protein: 38,
              carbs: 42,
              fat: 18
            }
          },
          {
            id: 'item-4',
            productId: 'prod-5',
            productName: 'Berry Protein Smoothie',
            productImageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop',
            quantity: 1,
            unitPrice: 180.00,
            subtotal: 180.00,
            nutrition: {
              calories: 280,
              protein: 25,
              carbs: 32,
              fat: 4
            }
          },
          {
            id: 'item-5',
            productId: 'prod-4',
            productName: 'Greek Protein Salad',
            productImageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
            quantity: 1,
            unitPrice: 250.00,
            subtotal: 250.00,
            nutrition: {
              calories: 320,
              protein: 28,
              carbs: 18,
              fat: 16
            }
          }
        ],
        subtotal: 780.00,
        deliveryFee: 0,
        serviceFee: 39.00,
        total: 819.00,
        fulfillmentType: 'pickup' as FulfillmentType,
        paymentMethod: 'cash_on_pickup' as PaymentMethod,
        paymentStatus: 'pending' as PaymentStatus,
        status: 'pending' as OrderStatus,
        statusHistory: [
          { status: 'pending' as OrderStatus, timestamp: new Date('2024-03-11T11:00:00'), note: 'Order placed' }
        ],
        createdAt: new Date('2024-03-11T11:00:00'),
        updatedAt: new Date('2024-03-11T11:00:00')
      },
      {
        id: 'order-4',
        orderNumber: 'GP-2024-004',
        customerId: 'user-1',
        customerName: 'Alex Rivera',
        customerEmail: 'customer@gymplate.com',
        customerPhone: '(555) 123-4567',
        customerAddress: '123 Fitness Ave, Makati, Metro Manila 1200',
        sellerId: 'user-2',
        sellerName: 'Maria Santos',
        businessId: 'biz-1',
        businessName: 'FitFuel Kitchen',
        items: [
          {
            id: 'item-6',
            productId: 'prod-2',
            productName: 'Salmon Teriyaki Bowl',
            productImageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
            quantity: 1,
            unitPrice: 350.00,
            subtotal: 350.00,
            nutrition: {
              calories: 520,
              protein: 38,
              carbs: 42,
              fat: 18
            }
          },
          {
            id: 'item-7',
            productId: 'prod-5',
            productName: 'Berry Protein Smoothie',
            productImageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop',
            quantity: 1,
            unitPrice: 180.00,
            subtotal: 180.00,
            nutrition: {
              calories: 280,
              protein: 25,
              carbs: 32,
              fat: 4
            }
          }
        ],
        subtotal: 530.00,
        deliveryFee: 45.00,
        serviceFee: 26.50,
        total: 601.50,
        fulfillmentType: 'delivery' as FulfillmentType,
        paymentMethod: 'cash_on_delivery' as PaymentMethod,
        paymentStatus: 'paid' as PaymentStatus,
        status: 'delivered' as OrderStatus,
        specialInstructions: 'Please leave at the door and ring the bell.',
        statusHistory: [
          { status: 'pending' as OrderStatus, timestamp: new Date('2024-03-08T11:00:00'), note: 'Order placed' },
          { status: 'confirmed' as OrderStatus, timestamp: new Date('2024-03-08T11:05:00'), note: 'Order confirmed by FitFuel Kitchen' },
          { status: 'preparing' as OrderStatus, timestamp: new Date('2024-03-08T11:15:00'), note: 'Kitchen started meal preparation' },
          { status: 'out_for_delivery' as OrderStatus, timestamp: new Date('2024-03-08T11:45:00'), note: 'Courier dispatched order for delivery' },
          { status: 'delivered' as OrderStatus, timestamp: new Date('2024-03-08T12:15:00'), note: 'Order successfully delivered to customer address' }
        ],
        createdAt: new Date('2024-03-08T11:00:00'),
        updatedAt: new Date('2024-03-08T12:15:00')
      }
    ];
  }

  // ─── Reviews ─────────────────────────────────────────────────────────
  private getDefaultReviews(): Review[] {
    return [
      {
        id: 'review-1',
        orderId: 'order-1',
        customerId: 'user-1',
        customerName: 'Alex Rivera',
        sellerId: 'user-2',
        productId: 'prod-1',
        productName: 'Grilled Chicken Power Bowl',
        productImageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
        rating: 5,
        ratingLabel: 'Excellent',
        comment: 'Absolutely incredible! The chicken was perfectly grilled, seasoned just right, and the lemon-tahini drizzle brought everything together. Generous portion sizes and the macros are spot-on for my post-workout meal. Will definitely be ordering again!',
        createdAt: new Date('2024-02-16T08:30:00')
      }
    ];
  }

  // ─── Reports ─────────────────────────────────────────────────────────
  private getDefaultReports(): Report[] {
    return [
      {
        id: 'rep-1',
        referenceNumber: 'REP-2024-1001',
        orderId: 'order-1',
        orderNumber: 'GP-2024-001',
        customerId: 'user-1',
        customerName: 'Alex Rivera',
        customerEmail: 'customer@gymplate.com',
        customerPhone: '(555) 123-4567',
        sellerId: 'user-2',
        sellerName: 'Maria Santos',
        businessName: 'FitFuel Kitchen',
        productId: 'prod-1',
        productName: 'Grilled Chicken Power Bowl',
        productImageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
        reason: 'Incorrect nutritional information',
        description: 'The meal packaging label omitted the dressing breakdown, causing ambiguity in dietary fat intake.',
        evidenceImages: [],
        status: 'resolved',
        sellerResponse: {
          response: 'We have redesigned our nutrition labels to explicitly list dressing and base components separately. Apologies for the confusion!',
          respondedAt: new Date('2024-02-17T09:30:00'),
          respondedBy: 'Maria Santos (FitFuel Kitchen)'
        },
        adminResolution: {
          actionTaken: 'Labeling update verified & nutritional guide published',
          remarks: 'FitFuel Kitchen provided updated certified macro calculations. Customer notified.',
          resolvedAt: new Date('2024-02-18T14:00:00'),
          resolvedBy: 'GymPlate Compliance Admin'
        },
        history: [
          { timestamp: new Date('2024-02-16T10:00:00'), updatedBy: 'Customer: Alex Rivera', note: 'Report submitted by customer' },
          { timestamp: new Date('2024-02-17T09:30:00'), updatedBy: 'Seller: FitFuel Kitchen', note: 'Kitchen submitted formal response and revised label specifications' },
          { timestamp: new Date('2024-02-18T14:00:00'), updatedBy: 'Administrator', note: 'Report marked resolved with compliance verification' }
        ],
        createdAt: new Date('2024-02-16T10:00:00'),
        updatedAt: new Date('2024-02-18T14:00:00')
      },
      {
        id: 'rep-2',
        referenceNumber: 'REP-2024-1002',
        orderId: 'order-3',
        orderNumber: 'GP-2024-003',
        customerId: 'user-6',
        customerName: 'John Martinez',
        customerEmail: 'john@example.com',
        customerPhone: '(555) 678-9012',
        sellerId: 'user-2',
        sellerName: 'Maria Santos',
        businessName: 'FitFuel Kitchen',
        productId: 'prod-4',
        productName: 'Greek Protein Salad',
        productImageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
        reason: 'Food arrived damaged or spilled',
        description: 'The vinaigrette dressing container was cracked during transit, spilling across the fresh salad greens and paper packaging.',
        evidenceImages: [],
        status: 'under_review',
        sellerResponse: {
          response: 'We are investigating packaging integrity with our container supplier and have prepared a complimentary replacement voucher.',
          respondedAt: new Date('2024-03-11T14:20:00'),
          respondedBy: 'FitFuel Kitchen Dispatch'
        },
        history: [
          { timestamp: new Date('2024-03-11T12:00:00'), updatedBy: 'Customer: John Martinez', note: 'Report submitted by customer' },
          { timestamp: new Date('2024-03-11T14:20:00'), updatedBy: 'Seller: FitFuel Kitchen', note: 'Seller offered replacement meal' },
          { timestamp: new Date('2024-03-11T15:00:00'), updatedBy: 'Administrator', note: 'Administrator moved report to Under Review for courier audit' }
        ],
        createdAt: new Date('2024-03-11T12:00:00'),
        updatedAt: new Date('2024-03-11T15:00:00')
      }
    ];
  }

  // ─── Notifications ──────────────────────────────────────────────────
  private getDefaultNotifications(): Notification[] {
    return [
      // Customer notifications (user-1)
      {
        id: 'notif-1',
        userId: 'user-1',
        type: 'order' as NotificationType,
        title: 'Order Completed',
        message: 'Your order GP-2024-001 has been completed. Enjoy your meal!',
        isRead: true,
        link: '/customer/orders/order-1',
        createdAt: new Date('2024-02-15T12:50:00')
      },
      {
        id: 'notif-2',
        userId: 'user-1',
        type: 'order' as NotificationType,
        title: 'Order Being Prepared',
        message: 'Your order GP-2024-002 is now being prepared by FitFuel Kitchen.',
        isRead: false,
        link: '/customer/orders/order-2',
        createdAt: new Date('2024-03-10T18:40:00')
      },
      {
        id: 'notif-3',
        userId: 'user-1',
        type: 'system' as NotificationType,
        title: 'Welcome to GymPlate!',
        message: 'Thanks for joining GymPlate. Browse our sellers and find your next healthy meal!',
        isRead: true,
        createdAt: new Date('2024-01-15T08:00:00')
      },

      // Seller notifications (user-2)
      {
        id: 'notif-4',
        userId: 'user-2',
        type: 'application' as NotificationType,
        title: 'Application Approved',
        message: 'Congratulations! Your seller application for FitFuel Kitchen has been approved. You can now start listing your products.',
        isRead: true,
        link: '/seller/dashboard',
        createdAt: new Date('2024-01-20T14:00:00')
      },
      {
        id: 'notif-5',
        userId: 'user-2',
        type: 'order' as NotificationType,
        title: 'New Order Received',
        message: 'You have a new order GP-2024-003 from John Martinez. Please review and confirm.',
        isRead: false,
        link: '/seller/orders/order-3',
        createdAt: new Date('2024-03-11T11:00:00')
      },
      {
        id: 'notif-6',
        userId: 'user-2',
        type: 'review' as NotificationType,
        title: 'New Review',
        message: 'Alex Rivera left a 5-star review for Grilled Chicken Power Bowl.',
        isRead: false,
        link: '/seller/reviews',
        createdAt: new Date('2024-02-16T08:30:00')
      },
      {
        id: 'notif-7',
        userId: 'user-2',
        type: 'stock' as NotificationType,
        title: 'Product Out of Stock',
        message: 'Quinoa Veggie Bowl is now out of stock. Please restock or mark it as unavailable.',
        isRead: false,
        link: '/seller/products/prod-10',
        createdAt: new Date('2024-03-10T09:00:00')
      },

      // Admin notifications (user-3)
      {
        id: 'notif-8',
        userId: 'user-3',
        type: 'application' as NotificationType,
        title: 'New Seller Application',
        message: 'David Kim has submitted a new seller application for Green Bowl Cafe. Please review.',
        isRead: false,
        link: '/admin/applications/app-2',
        createdAt: new Date('2024-03-02T09:15:00')
      },
      {
        id: 'notif-9',
        userId: 'user-3',
        type: 'system' as NotificationType,
        title: 'System Report',
        message: 'Weekly platform report is ready. 3 new orders, 1 new user registered this week.',
        isRead: true,
        createdAt: new Date('2024-03-08T06:00:00')
      },

      // Pending seller notification (user-4)
      {
        id: 'notif-10',
        userId: 'user-4',
        type: 'application' as NotificationType,
        title: 'Application Submitted',
        message: 'Your seller application for Green Bowl Cafe has been submitted and is under review. We will notify you once a decision has been made.',
        isRead: true,
        createdAt: new Date('2024-03-02T09:15:00')
      },

      // Rejected seller notification (user-5)
      {
        id: 'notif-11',
        userId: 'user-5',
        type: 'application' as NotificationType,
        title: 'Application Rejected',
        message: 'Your seller application for PowerPlate has been rejected. Reason: Business permit expired. Please submit a current valid business permit.',
        isRead: false,
        link: '/seller/application',
        createdAt: new Date('2024-03-05T16:00:00')
      },

      // Second customer notification (user-6)
      {
        id: 'notif-12',
        userId: 'user-6',
        type: 'order' as NotificationType,
        title: 'Order Placed',
        message: 'Your order GP-2024-003 has been placed successfully. Waiting for seller confirmation.',
        isRead: false,
        link: '/customer/orders/order-3',
        createdAt: new Date('2024-03-11T11:00:00')
      }
    ];
  }

  // ─── Activity Logs ───────────────────────────────────────────────────
  private getDefaultActivityLogs(): ActivityLog[] {
    return [
      {
        id: 'log-1',
        adminId: 'user-3',
        adminName: 'James Chen',
        action: 'Approved seller application',
        targetType: 'application',
        targetId: 'app-1',
        details: 'Approved seller application for Maria Santos (FitFuel Kitchen). All documents verified, business permit and food safety certification valid.',
        timestamp: new Date('2024-01-20T14:00:00')
      },
      {
        id: 'log-2',
        adminId: 'user-3',
        adminName: 'James Chen',
        action: 'Rejected seller application',
        targetType: 'application',
        targetId: 'app-3',
        details: 'Rejected seller application for Sarah Johnson (PowerPlate). Business permit has expired.',
        reason: 'Business permit expired. Please submit a current valid business permit.',
        timestamp: new Date('2024-03-05T16:00:00')
      }
    ];
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PUBLIC GETTERS — return deep copies to prevent accidental mutation
  // ═══════════════════════════════════════════════════════════════════════

  getUsers(): User[] {
    return JSON.parse(JSON.stringify(this.users));
  }

  getSellerApplications(): SellerApplication[] {
    return JSON.parse(JSON.stringify(this.sellerApplications));
  }

  getBusinesses(): Business[] {
    return JSON.parse(JSON.stringify(this.businesses));
  }

  getProducts(): Product[] {
    return JSON.parse(JSON.stringify(this.products));
  }

  getCategories(): Category[] {
    return JSON.parse(JSON.stringify(this.categories));
  }

  getOrders(): Order[] {
    return JSON.parse(JSON.stringify(this.orders));
  }

  getReviews(): Review[] {
    return JSON.parse(JSON.stringify(this.reviews));
  }

  getNotifications(): Notification[] {
    return JSON.parse(JSON.stringify(this.notifications));
  }

  getActivityLogs(): ActivityLog[] {
    return JSON.parse(JSON.stringify(this.activityLogs));
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PUBLIC MUTATORS — modify data and persist to localStorage
  // ═══════════════════════════════════════════════════════════════════════

  updateUser(updatedUser: User): void {
    const index = this.users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      this.users[index] = { ...updatedUser };
      this.saveToLocalStorage();
    }
  }

  addUser(user: User): void {
    this.users.push({ ...user });
    this.saveToLocalStorage();
  }

  addSellerApplication(app: SellerApplication): void {
    this.sellerApplications.push({ ...app });
    this.saveToLocalStorage();
  }

  updateSellerApplication(app: SellerApplication): void {
    const index = this.sellerApplications.findIndex(a => a.id === app.id);
    if (index !== -1) {
      this.sellerApplications[index] = { ...app };
    } else {
      this.sellerApplications.push({ ...app });
    }
    this.saveToLocalStorage();
  }

  addBusiness(business: Business): void {
    this.businesses.push({ ...business });
    this.saveToLocalStorage();
  }

  updateBusiness(business: Business): void {
    const index = this.businesses.findIndex(b => b.id === business.id);
    if (index !== -1) {
      this.businesses[index] = { ...business };
      this.saveToLocalStorage();
    }
  }

  addProduct(product: Product): void {
    this.products.push({ ...product });
    this.saveToLocalStorage();
  }

  updateProduct(product: Product): void {
    const index = this.products.findIndex(p => p.id === product.id);
    if (index !== -1) {
      this.products[index] = { ...product };
      this.saveToLocalStorage();
    }
  }

  deleteProduct(productId: string): void {
    this.products = this.products.filter(p => p.id !== productId);
    this.saveToLocalStorage();
  }

  addOrder(order: Order): void {
    this.orders.push({ ...order });
    this.saveToLocalStorage();
  }

  updateOrder(order: Order): void {
    const index = this.orders.findIndex(o => o.id === order.id);
    if (index !== -1) {
      this.orders[index] = { ...order };
      this.saveToLocalStorage();
    }
  }

  addReview(review: Review): void {
    this.reviews.push({ ...review });
    const prodReviews = this.reviews.filter(r => r.productId === review.productId);
    if (prodReviews.length > 0) {
      const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
      const pIndex = this.products.findIndex(p => p.id === review.productId);
      if (pIndex !== -1) {
        this.products[pIndex].rating = Math.round(avg * 10) / 10;
        this.products[pIndex].reviewCount = prodReviews.length;
        this.products[pIndex].updatedAt = new Date();
      }
    }
    this.notifications.push({
      id: 'notif-' + Date.now(),
      userId: review.sellerId,
      type: 'review',
      title: 'New Customer Review',
      message: `${review.customerName} left a ${review.rating}-star review for ${review.productName}.`,
      isRead: false,
      link: '/seller/reviews',
      createdAt: new Date()
    });
    this.saveToLocalStorage();
  }

  addNotification(notification: Notification): void {
    this.notifications.push({ ...notification });
    this.saveToLocalStorage();
  }

  updateNotification(notification: Notification): void {
    const index = this.notifications.findIndex(n => n.id === notification.id);
    if (index !== -1) {
      this.notifications[index] = { ...notification };
      this.saveToLocalStorage();
    }
  }

  markNotificationRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      this.saveToLocalStorage();
    }
  }

  markAllNotificationsRead(userId: string): void {
    this.notifications
      .filter(n => n.userId === userId)
      .forEach(n => n.isRead = true);
    this.saveToLocalStorage();
  }

  addActivityLog(log: ActivityLog): void {
    this.activityLogs.push({ ...log });
    this.saveToLocalStorage();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CONVENIENCE QUERY METHODS
  // ═══════════════════════════════════════════════════════════════════════

  getUser(id: string): User | undefined {
    return this.getUserById(id);
  }

  getProduct(id: string): Product | undefined {
    return this.getProductById(id);
  }

  getOrder(id: string): Order | undefined {
    return this.getOrderById(id);
  }

  getBusiness(id: string): Business | undefined {
    return this.getBusinessById(id);
  }

  getSellerApplication(id: string): SellerApplication | undefined {
    const app = this.sellerApplications.find(a => a.id === id);
    return app ? JSON.parse(JSON.stringify(app)) : undefined;
  }

  getUserById(id: string): User | undefined {
    const user = this.users.find(u => u.id === id);
    return user ? { ...user } : undefined;
  }

  getUserByEmail(email: string): User | undefined {
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user ? { ...user } : undefined;
  }

  getSellerApplicationByUserId(userId: string): SellerApplication | undefined {
    const app = this.sellerApplications.find(a => a.userId === userId);
    return app ? JSON.parse(JSON.stringify(app)) : undefined;
  }

  getBusinessBySellerId(sellerId: string): Business | undefined {
    const biz = this.businesses.find(b => b.sellerId === sellerId);
    return biz ? { ...biz } : undefined;
  }

  getBusinessById(id: string): Business | undefined {
    const biz = this.businesses.find(b => b.id === id);
    return biz ? { ...biz } : undefined;
  }

  getProductsBySellerId(sellerId: string): Product[] {
    return JSON.parse(JSON.stringify(this.products.filter(p => p.sellerId === sellerId)));
  }

  getProductsByBusinessId(businessId: string): Product[] {
    return JSON.parse(JSON.stringify(this.products.filter(p => p.businessId === businessId)));
  }

  getProductById(id: string): Product | undefined {
    const product = this.products.find(p => p.id === id);
    return product ? { ...product } : undefined;
  }

  getOrdersByCustomerId(customerId: string): Order[] {
    return JSON.parse(JSON.stringify(this.orders.filter(o => o.customerId === customerId)));
  }

  getOrdersBySellerId(sellerId: string): Order[] {
    return JSON.parse(JSON.stringify(this.orders.filter(o => o.sellerId === sellerId)));
  }

  getOrderById(id: string): Order | undefined {
    const order = this.orders.find(o => o.id === id);
    return order ? JSON.parse(JSON.stringify(order)) : undefined;
  }

  getReviewsBySellerId(sellerId: string): Review[] {
    return JSON.parse(JSON.stringify(this.reviews.filter(r => r.sellerId === sellerId)));
  }

  getReviewsByProductId(productId: string): Review[] {
    return JSON.parse(JSON.stringify(this.reviews.filter(r => r.productId === productId)));
  }

  getNotificationsByUserId(userId: string): Notification[] {
    return JSON.parse(JSON.stringify(this.notifications.filter(n => n.userId === userId)));
  }

  getUnreadNotificationCount(userId: string): number {
    return this.notifications.filter(n => n.userId === userId && !n.isRead).length;
  }

  getReviewsByOrderId(orderId: string): Review[] {
    return JSON.parse(JSON.stringify(this.reviews.filter(r => r.orderId === orderId)));
  }

  hasReviewedItem(orderId: string, productId: string): boolean {
    return this.reviews.some(r => r.orderId === orderId && r.productId === productId);
  }

  getReviewForItem(orderId: string, productId: string): Review | undefined {
    const rev = this.reviews.find(r => r.orderId === orderId && r.productId === productId);
    return rev ? JSON.parse(JSON.stringify(rev)) : undefined;
  }

  // ─── Reports ─────────────────────────────────────────────────────────
  getReports(): Report[] {
    return JSON.parse(JSON.stringify(this.reports));
  }

  getReportsByCustomerId(customerId: string): Report[] {
    return JSON.parse(JSON.stringify(this.reports.filter(r => r.customerId === customerId)));
  }

  getReportsBySellerId(sellerId: string): Report[] {
    return JSON.parse(JSON.stringify(this.reports.filter(r => r.sellerId === sellerId)));
  }

  getReportsByOrderId(orderId: string): Report[] {
    return JSON.parse(JSON.stringify(this.reports.filter(r => r.orderId === orderId)));
  }

  getReportById(id: string): Report | undefined {
    const rep = this.reports.find(r => r.id === id || r.referenceNumber === id);
    return rep ? JSON.parse(JSON.stringify(rep)) : undefined;
  }

  addReport(report: Report): void {
    this.reports.unshift({ ...report });
    this.notifications.push({
      id: 'notif-' + Date.now() + '-s',
      userId: report.sellerId,
      type: 'system',
      title: 'Customer Food Report Filed',
      message: `A report (${report.referenceNumber}) was submitted for ${report.productName}: ${report.reason}.`,
      isRead: false,
      link: '/seller/customer-reports',
      createdAt: new Date()
    });
    const admins = this.users.filter(u => u.role === 'admin');
    admins.forEach(admin => {
      this.notifications.push({
        id: 'notif-' + Date.now() + '-a-' + admin.id,
        userId: admin.id,
        type: 'system',
        title: 'New Food & Order Report',
        message: `${report.referenceNumber} filed by ${report.customerName} against ${report.businessName}.`,
        isRead: false,
        link: '/admin/food-reports',
        createdAt: new Date()
      });
    });
    this.saveToLocalStorage();
  }

  updateReport(report: Report): void {
    const index = this.reports.findIndex(r => r.id === report.id);
    if (index !== -1) {
      this.reports[index] = { ...report, updatedAt: new Date() };
      this.saveToLocalStorage();
    }
  }

  addSellerResponse(reportId: string, response: string, sellerName: string): boolean {
    const report = this.reports.find(r => r.id === reportId);
    if (!report) return false;
    report.sellerResponse = {
      response,
      respondedAt: new Date(),
      respondedBy: sellerName
    };
    report.history.push({
      timestamp: new Date(),
      updatedBy: `Seller: ${sellerName}`,
      note: 'Seller provided official response'
    });
    if (report.status === 'submitted') {
      report.status = 'under_review';
    }
    report.updatedAt = new Date();
    this.notifications.push({
      id: 'notif-' + Date.now() + '-c',
      userId: report.customerId,
      type: 'order',
      title: 'Kitchen Responded to Your Report',
      message: `${sellerName} has provided a response regarding ${report.referenceNumber}.`,
      isRead: false,
      link: '/customer/orders/' + report.orderId,
      createdAt: new Date()
    });
    this.saveToLocalStorage();
    return true;
  }

  resolveReport(
    reportId: string,
    status: ReportStatus,
    remarks: string,
    actionTaken: string,
    adminName: string
  ): boolean {
    const report = this.reports.find(r => r.id === reportId);
    if (!report) return false;
    report.status = status;
    report.adminResolution = {
      actionTaken,
      remarks,
      resolvedAt: new Date(),
      resolvedBy: adminName
    };
    report.history.push({
      timestamp: new Date(),
      updatedBy: `Admin: ${adminName}`,
      note: `Status updated to "${status.replace('_', ' ').toUpperCase()}". Action: ${actionTaken}. ${remarks}`
    });
    report.updatedAt = new Date();

    this.notifications.push({
      id: 'notif-' + Date.now() + '-res-c',
      userId: report.customerId,
      type: 'order',
      title: `Report ${report.referenceNumber} ${status === 'resolved' ? 'Resolved' : 'Updated'}`,
      message: `GymPlate Administration has concluded the review: ${remarks}`,
      isRead: false,
      link: '/customer/orders/' + report.orderId,
      createdAt: new Date()
    });

    this.notifications.push({
      id: 'notif-' + Date.now() + '-res-s',
      userId: report.sellerId,
      type: 'system',
      title: `Resolution on Report ${report.referenceNumber}`,
      message: `Admin resolution: ${actionTaken}. Remarks: ${remarks}`,
      isRead: false,
      link: '/seller/customer-reports',
      createdAt: new Date()
    });

    this.saveToLocalStorage();
    return true;
  }

  getNextOrderNumber(): string {
    const maxNum = this.orders.reduce((max, o) => {
      const match = o.orderNumber.match(/GP-2024-(\d+)/);
      const num = match ? parseInt(match[1], 10) : 0;
      return num > max ? num : max;
    }, 0);
    return `GP-2024-${String(maxNum + 1).padStart(3, '0')}`;
  }

  generateId(prefix: string): string {
    const maxNum = (() => {
      switch (prefix) {
        case 'user': return this.users.reduce((m, u) => Math.max(m, parseInt(u.id.split('-')[1]) || 0), 0);
        case 'app': return this.sellerApplications.reduce((m, a) => Math.max(m, parseInt(a.id.split('-')[1]) || 0), 0);
        case 'biz': return this.businesses.reduce((m, b) => Math.max(m, parseInt(b.id.split('-')[1]) || 0), 0);
        case 'prod': return this.products.reduce((m, p) => Math.max(m, parseInt(p.id.split('-')[1]) || 0), 0);
        case 'order': return this.orders.reduce((m, o) => Math.max(m, parseInt(o.id.split('-')[1]) || 0), 0);
        case 'review': return this.reviews.reduce((m, r) => Math.max(m, parseInt(r.id.split('-')[1]) || 0), 0);
        case 'notif': return this.notifications.reduce((m, n) => Math.max(m, parseInt(n.id.split('-')[1]) || 0), 0);
        case 'log': return this.activityLogs.reduce((m, l) => Math.max(m, parseInt(l.id.split('-')[1]) || 0), 0);
        default: return Date.now();
      }
    })();
    return `${prefix}-${maxNum + 1}`;
  }
}
