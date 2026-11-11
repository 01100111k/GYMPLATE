import { Injectable } from '@angular/core';
import { Report, ReportStatus, ReportReason } from '../models';
import { MockDataService } from './mock-data.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(
    private mockData: MockDataService,
    private authService: AuthService
  ) {}

  getAllReports(): Report[] {
    return this.mockData.getReports();
  }

  getCustomerReports(customerId: string): Report[] {
    return this.mockData.getReportsByCustomerId(customerId);
  }

  getSellerReports(sellerId: string): Report[] {
    return this.mockData.getReportsBySellerId(sellerId);
  }

  getOrderReports(orderId: string): Report[] {
    return this.mockData.getReportsByOrderId(orderId);
  }

  getReportById(id: string): Report | undefined {
    return this.mockData.getReportById(id);
  }

  submitReport(params: {
    orderId: string;
    orderNumber: string;
    sellerId: string;
    businessName: string;
    productId: string;
    productName: string;
    productImageUrl?: string;
    reason: ReportReason;
    description: string;
    evidenceImages: string[];
  }): { success: boolean; message: string; report?: Report } {
    const user = this.authService.user();
    if (!user) {
      return { success: false, message: 'You must be logged in to submit a report.' };
    }

    if (!params.description || params.description.trim().length < 10) {
      return { success: false, message: 'Please provide a detailed description (at least 10 characters).' };
    }

    const refNum = `REP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReport: Report = {
      id: 'rep-' + Date.now(),
      referenceNumber: refNum,
      orderId: params.orderId,
      orderNumber: params.orderNumber,
      customerId: user.id,
      customerName: `${user.firstName} ${user.lastName}`,
      customerEmail: user.email,
      customerPhone: user.phone,
      sellerId: params.sellerId,
      businessName: params.businessName,
      productId: params.productId,
      productName: params.productName,
      productImageUrl: params.productImageUrl,
      reason: params.reason,
      description: params.description.trim(),
      evidenceImages: params.evidenceImages || [],
      status: 'submitted',
      history: [
        {
          timestamp: new Date(),
          updatedBy: `Customer: ${user.firstName} ${user.lastName}`,
          note: `Report filed for ${params.productName} (${params.reason})`
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.mockData.addReport(newReport);
    return {
      success: true,
      message: `Report ${refNum} has been officially recorded and dispatched to GymPlate Moderation and Kitchen Management.`,
      report: newReport
    };
  }

  respondAsSeller(reportId: string, responseText: string, sellerName: string): boolean {
    if (!responseText || !responseText.trim()) return false;
    return this.mockData.addSellerResponse(reportId, responseText.trim(), sellerName);
  }

  resolveAsAdmin(
    reportId: string,
    status: ReportStatus,
    remarks: string,
    actionTaken: string,
    adminName: string
  ): boolean {
    return this.mockData.resolveReport(reportId, status, remarks, actionTaken, adminName);
  }
}
