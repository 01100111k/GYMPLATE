export type UserRole = 'customer' | 'seller' | 'admin';
export type SellerStatus = 'pending' | 'approved' | 'rejected' | 'info_required' | 'suspended';
export type AccountStatus = 'active' | 'suspended';

export interface User {
  id: string;
  email: string;
  passwordHash: string; // In demo, we store a simple hash - NOT production secure
  role: UserRole;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  avatarUrl?: string;
  accountStatus: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface SellerApplication {
  id: string;
  userId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  businessInfo: {
    businessName: string;
    businessType: string;
    businessAddress: string;
    businessCity: string;
    businessState: string;
    businessZipCode: string;
    businessDescription: string;
    businessPhone: string;
    businessEmail: string;
    operatingHours: string;
  };
  documents: {
    governmentId?: { name: string; url: string; type: string };
    businessPermit?: { name: string; url: string; type: string };
    supportingDocs?: { name: string; url: string; type: string }[];
  };
  status: SellerStatus;
  reviewNotes?: string;
  rejectionReason?: string;
  infoRequestReason?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  submittedAt: Date;
  updatedAt: Date;
}

export interface Business {
  id: string;
  sellerId: string;
  businessName: string;
  businessType: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  operatingHours: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
