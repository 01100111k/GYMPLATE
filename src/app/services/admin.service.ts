import { Injectable } from '@angular/core';
import { User, ActivityLog } from '../models';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private mockData: MockDataService) {}

  getAllUsers(): User[] {
    return this.mockData.getUsers();
  }

  getCustomers(): User[] {
    return this.mockData.getUsers().filter(u => u.role === 'customer');
  }

  getSellers(): User[] {
    return this.mockData.getUsers().filter(u => u.role === 'seller');
  }

  suspendUser(userId: string, adminId: string, reason: string): void {
    const user = this.mockData.getUser(userId);
    if (!user) return;
    this.mockData.updateUser({ ...user, accountStatus: 'suspended', updatedAt: new Date() });
    this.logActivity(adminId, 'Suspended account', user.role === 'seller' ? 'seller' : 'customer', userId,
      `Suspended ${user.firstName} ${user.lastName}'s account`, reason);
  }

  reactivateUser(userId: string, adminId: string, reason: string): void {
    const user = this.mockData.getUser(userId);
    if (!user) return;
    this.mockData.updateUser({ ...user, accountStatus: 'active', updatedAt: new Date() });
    this.logActivity(adminId, 'Reactivated account', user.role === 'seller' ? 'seller' : 'customer', userId,
      `Reactivated ${user.firstName} ${user.lastName}'s account`, reason);
  }

  disableProduct(productId: string, adminId: string, reason: string): void {
    const product = this.mockData.getProduct(productId);
    if (!product) return;
    this.mockData.updateProduct({ ...product, isDisabled: true, disableReason: reason, updatedAt: new Date() });
    this.logActivity(adminId, 'Disabled product', 'product', productId,
      `Disabled product "${product.name}"`, reason);
  }

  enableProduct(productId: string, adminId: string): void {
    const product = this.mockData.getProduct(productId);
    if (!product) return;
    this.mockData.updateProduct({ ...product, isDisabled: false, disableReason: undefined, updatedAt: new Date() });
    this.logActivity(adminId, 'Enabled product', 'product', productId,
      `Re-enabled product "${product.name}"`);
  }

  getActivityLogs(): ActivityLog[] {
    return this.mockData.getActivityLogs()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  logActivity(adminId: string, action: string, targetType: ActivityLog['targetType'], targetId: string, details: string, reason?: string): void {
    const admin = this.mockData.getUser(adminId);
    this.mockData.addActivityLog({
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      adminId,
      adminName: admin ? `${admin.firstName} ${admin.lastName}` : 'Unknown',
      action,
      targetType,
      targetId,
      details,
      reason,
      timestamp: new Date()
    });
  }

  getDashboardStats(): {
    totalCustomers: number;
    totalSellers: number;
    pendingApplications: number;
    approvedSellers: number;
    totalProducts: number;
    totalOrders: number;
    completedOrders: number;
    totalOrderValue: number;
  } {
    const users = this.mockData.getUsers();
    const applications = this.mockData.getSellerApplications();
    const products = this.mockData.getProducts();
    const orders = this.mockData.getOrders();

    return {
      totalCustomers: users.filter(u => u.role === 'customer').length,
      totalSellers: users.filter(u => u.role === 'seller').length,
      pendingApplications: applications.filter(a => a.status === 'pending').length,
      approvedSellers: applications.filter(a => a.status === 'approved').length,
      totalProducts: products.length,
      totalOrders: orders.length,
      completedOrders: orders.filter(o => o.status === 'completed').length,
      totalOrderValue: orders.reduce((sum, o) => sum + o.total, 0)
    };
  }
}
