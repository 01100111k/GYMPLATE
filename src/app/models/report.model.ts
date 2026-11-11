export type ReportReason =
  | 'Food quality issue'
  | 'Incorrect or missing food item'
  | 'Food arrived damaged or spilled'
  | 'Food does not match its description'
  | 'Incorrect nutritional information'
  | 'Food safety or hygiene concern'
  | 'Other';

export type ReportStatus = 'submitted' | 'under_review' | 'resolved' | 'rejected';

export interface ReportUpdate {
  timestamp: Date;
  updatedBy: string;
  note: string;
}

export interface Report {
  id: string;
  referenceNumber: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  sellerId: string;
  sellerName?: string;
  businessId?: string;
  businessName: string;
  productId: string;
  productName: string;
  productImageUrl?: string;
  reason: ReportReason;
  description: string;
  evidenceImages: string[];
  status: ReportStatus;
  sellerResponse?: {
    response: string;
    respondedAt: Date;
    respondedBy: string;
  };
  adminResolution?: {
    actionTaken: string;
    remarks: string;
    resolvedAt: Date;
    resolvedBy: string;
  };
  history: ReportUpdate[];
  createdAt: Date;
  updatedAt: Date;
}
