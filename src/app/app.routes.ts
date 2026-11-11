import { Routes } from '@angular/router';
import { customerGuard, sellerGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Public
  { path: '', loadComponent: () => import('./pages/public/landing.component').then(m => m.LandingComponent) },
  { path: 'explore', loadComponent: () => import('./pages/public/explore.component').then(m => m.ExploreComponent) },
  { path: 'about', loadComponent: () => import('./pages/public/about.component').then(m => m.AboutComponent) },
  { path: 'faqs', redirectTo: '', pathMatch: 'full' },
  { path: 'faq', redirectTo: '', pathMatch: 'full' },

  // Auth
  { path: 'auth/login', loadComponent: () => import('./pages/auth/login.component').then(m => m.LoginComponent) },
  { path: 'auth/register', loadComponent: () => import('./pages/auth/register-select.component').then(m => m.RegisterSelectComponent) },
  { path: 'auth/register-select', loadComponent: () => import('./pages/auth/register-select.component').then(m => m.RegisterSelectComponent) },
  { path: 'auth/customer-register', loadComponent: () => import('./pages/auth/register.component').then(m => m.RegisterComponent) },
  { path: 'auth/seller-register', loadComponent: () => import('./pages/auth/seller-register.component').then(m => m.SellerRegisterComponent) },
  { path: 'auth/admin-login', loadComponent: () => import('./pages/auth/admin-login.component').then(m => m.AdminLoginComponent) },
  { path: 'auth/forgot-password', loadComponent: () => import('./pages/auth/forgot-password.component').then(m => m.ForgotPasswordComponent) },

  // Customer
  {
    path: 'customer',
    canActivate: [customerGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/customer/customer-home.component').then(m => m.CustomerHomeComponent) },
      { path: 'explore', loadComponent: () => import('./pages/customer/customer-explore.component').then(m => m.CustomerExploreComponent) },
      { path: 'product/:id', loadComponent: () => import('./pages/customer/product-detail.component').then(m => m.ProductDetailComponent) },
      { path: 'cart', loadComponent: () => import('./pages/customer/cart.component').then(m => m.CartComponent) },
      { path: 'checkout', loadComponent: () => import('./pages/customer/checkout.component').then(m => m.CheckoutComponent) },
      { path: 'orders', loadComponent: () => import('./pages/customer/customer-orders.component').then(m => m.CustomerOrdersComponent) },
      { path: 'orders/:id', loadComponent: () => import('./pages/customer/order-detail.component').then(m => m.OrderDetailComponent) },
      { path: 'nutrition', loadComponent: () => import('./pages/customer/nutrition-summary.component').then(m => m.NutritionSummaryComponent) },
      { path: 'profile', loadComponent: () => import('./pages/customer/customer-profile.component').then(m => m.CustomerProfileComponent) },
    ]
  },

  // Seller
  {
    path: 'seller',
    canActivate: [sellerGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/seller/seller-dashboard.component').then(m => m.SellerDashboardComponent) },
      { path: 'products', loadComponent: () => import('./pages/seller/seller-products.component').then(m => m.SellerProductsComponent) },
      { path: 'products/add', loadComponent: () => import('./pages/seller/add-product.component').then(m => m.AddProductComponent) },
      { path: 'products/edit/:id', loadComponent: () => import('./pages/seller/edit-product.component').then(m => m.EditProductComponent) },
      { path: 'orders', loadComponent: () => import('./pages/seller/seller-orders.component').then(m => m.SellerOrdersComponent) },
      { path: 'orders/:id', loadComponent: () => import('./pages/seller/seller-order-detail.component').then(m => m.SellerOrderDetailComponent) },
      { path: 'inventory', loadComponent: () => import('./pages/seller/seller-inventory.component').then(m => m.SellerInventoryComponent) },
      { path: 'reports', loadComponent: () => import('./pages/seller/seller-reports.component').then(m => m.SellerReportsComponent) },
      { path: 'customer-reports', loadComponent: () => import('./pages/seller/seller-customer-reports.component').then(m => m.SellerCustomerReportsComponent) },
      { path: 'reviews', loadComponent: () => import('./pages/seller/seller-reviews.component').then(m => m.SellerReviewsComponent) },
      { path: 'business', loadComponent: () => import('./pages/seller/seller-business.component').then(m => m.SellerBusinessComponent) },
      { path: 'notifications', loadComponent: () => import('./pages/seller/seller-notifications.component').then(m => m.SellerNotificationsComponent) },
      { path: 'settings', loadComponent: () => import('./pages/seller/seller-settings.component').then(m => m.SellerSettingsComponent) },
      { path: 'pending', loadComponent: () => import('./pages/seller/seller-pending.component').then(m => m.SellerPendingComponent) },
    ]
  },

  // Admin
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'applications', loadComponent: () => import('./pages/admin/admin-applications.component').then(m => m.AdminApplicationsComponent) },
      { path: 'applications/:id', loadComponent: () => import('./pages/admin/admin-application-detail.component').then(m => m.AdminApplicationDetailComponent) },
      { path: 'sellers', loadComponent: () => import('./pages/admin/admin-sellers.component').then(m => m.AdminSellersComponent) },
      { path: 'customers', loadComponent: () => import('./pages/admin/admin-customers.component').then(m => m.AdminCustomersComponent) },
      { path: 'products', loadComponent: () => import('./pages/admin/admin-products.component').then(m => m.AdminProductsComponent) },
      { path: 'orders', loadComponent: () => import('./pages/admin/admin-orders.component').then(m => m.AdminOrdersComponent) },
      { path: 'orders/:id', loadComponent: () => import('./pages/admin/admin-order-detail.component').then(m => m.AdminOrderDetailComponent) },
      { path: 'categories', loadComponent: () => import('./pages/admin/admin-categories.component').then(m => m.AdminCategoriesComponent) },
      { path: 'reports', loadComponent: () => import('./pages/admin/admin-reports.component').then(m => m.AdminReportsComponent) },
      { path: 'food-reports', loadComponent: () => import('./pages/admin/admin-food-reports.component').then(m => m.AdminFoodReportsComponent) },
      { path: 'activity-logs', loadComponent: () => import('./pages/admin/admin-activity-logs.component').then(m => m.AdminActivityLogsComponent) },
      { path: 'settings', loadComponent: () => import('./pages/admin/admin-settings.component').then(m => m.AdminSettingsComponent) },
    ]
  },

  // Fallback
  { path: '**', redirectTo: '' }
];
