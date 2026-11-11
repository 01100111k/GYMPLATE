export type NotificationType = 'order' | 'application' | 'system' | 'review' | 'stock';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

export interface ActivityLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: 'seller' | 'customer' | 'product' | 'order' | 'application';
  targetId: string;
  details: string;
  reason?: string;
  timestamp: Date;
}
