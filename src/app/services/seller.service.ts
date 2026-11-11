import { Injectable } from '@angular/core';
import { SellerApplication, Business, SellerStatus } from '../models';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class SellerService {
  constructor(private mockData: MockDataService) {}

  getApplication(userId: string): SellerApplication | undefined {
    return this.mockData.getSellerApplicationByUserId(userId);
  }

  submitApplication(application: SellerApplication): void {
    this.mockData.addSellerApplication(application);
  }

  updateApplication(application: SellerApplication): void {
    this.mockData.updateSellerApplication(application);
  }

  getBusiness(sellerId: string): Business | undefined {
    return this.mockData.getBusinessBySellerId(sellerId);
  }

  updateBusiness(business: Business): void {
    this.mockData.updateBusiness(business);
  }

  isApproved(userId: string): boolean {
    const app = this.getApplication(userId);
    return app?.status === 'approved';
  }

  getSellerStatus(userId: string): SellerStatus | null {
    const app = this.getApplication(userId);
    return app?.status || null;
  }

  getAllApplications(): SellerApplication[] {
    return this.mockData.getSellerApplications();
  }

  getAllBusinesses(): Business[] {
    return this.mockData.getBusinesses();
  }

  approveApplication(applicationId: string, adminId: string): void {
    const app = this.mockData.getSellerApplication(applicationId);
    if (!app) return;

    const updated: SellerApplication = {
      ...app,
      status: 'approved',
      reviewedBy: adminId,
      reviewedAt: new Date(),
      updatedAt: new Date()
    };
    this.mockData.updateSellerApplication(updated);

    // Create business for seller
    const business: Business = {
      id: 'biz-' + Date.now(),
      sellerId: app.userId,
      businessName: app.businessInfo.businessName,
      businessType: app.businessInfo.businessType,
      description: app.businessInfo.businessDescription,
      address: app.businessInfo.businessAddress,
      city: app.businessInfo.businessCity,
      state: app.businessInfo.businessState,
      zipCode: app.businessInfo.businessZipCode,
      phone: app.businessInfo.businessPhone,
      email: app.businessInfo.businessEmail,
      operatingHours: app.businessInfo.operatingHours,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mockData.addBusiness(business);
  }

  rejectApplication(applicationId: string, adminId: string, reason: string): void {
    const app = this.mockData.getSellerApplication(applicationId);
    if (!app) return;

    const updated: SellerApplication = {
      ...app,
      status: 'rejected',
      rejectionReason: reason,
      reviewedBy: adminId,
      reviewedAt: new Date(),
      updatedAt: new Date()
    };
    this.mockData.updateSellerApplication(updated);
  }

  requestMoreInfo(applicationId: string, adminId: string, reason: string): void {
    const app = this.mockData.getSellerApplication(applicationId);
    if (!app) return;

    const updated: SellerApplication = {
      ...app,
      status: 'info_required',
      infoRequestReason: reason,
      reviewedBy: adminId,
      reviewedAt: new Date(),
      updatedAt: new Date()
    };
    this.mockData.updateSellerApplication(updated);
  }
}
