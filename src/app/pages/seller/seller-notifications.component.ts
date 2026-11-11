import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models';
import { SellerSidebarComponent } from '../../shared/components/seller-sidebar.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-seller-notifications',
  standalone: true,
  imports: [CommonModule, SellerSidebarComponent, IconComponent],
  template: `
    <div class="seller-layout">
      <app-seller-sidebar></app-seller-sidebar>

      <main class="seller-main-content">
        <div class="seller-container container-narrow">
          <div class="page-header flex justify-between items-center mb-6">
            <div>
              <span class="text-xs font-bold uppercase text-primary">Alerts & System Messages</span>
              <h1>Kitchen Notifications</h1>
              <p class="text-xs text-secondary">Real-time alerts for incoming orders, review updates, and compliance notes.</p>
            </div>
            <button class="btn btn-secondary btn-sm" (click)="markAllRead()">
              Mark all as read
            </button>
          </div>

          <div class="card notif-card">
            <div class="notif-list" *ngIf="notifications().length > 0">
              <div
                class="notif-row"
                *ngFor="let n of notifications()"
                [class.unread]="!n.isRead"
                (click)="markAsRead(n)"
              >
                <div class="icon-wrap">
                  <app-icon [name]="getIconName(n.type)" [size]="18" color="var(--color-primary)"></app-icon>
                </div>
                <div class="notif-details">
                  <div class="flex justify-between items-center">
                    <strong class="text-xs">{{ n.title }}</strong>
                    <small class="text-tertiary">{{ n.createdAt | date:'short' }}</small>
                  </div>
                  <p class="text-xs text-secondary mt-1">{{ n.message }}</p>
                </div>
              </div>
            </div>

            <div class="empty-state py-8 text-center" *ngIf="notifications().length === 0">
              <app-icon name="bell" [size]="32" color="var(--color-text-tertiary)"></app-icon>
              <p class="text-xs text-secondary mt-2">No notifications yet.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .seller-layout {
      display: flex;
      min-height: 100vh;
      background: var(--color-bg-secondary);
    }
    .seller-main-content {
      flex: 1;
      margin-left: var(--sidebar-width);
      padding: var(--space-8) var(--space-6);
    }
    .seller-container {
      max-width: var(--container-narrow);
      margin: 0 auto;
    }
    .notif-card {
      border: 1px solid var(--color-border);
      background: white;
    }
    .notif-row {
      display: flex;
      gap: var(--space-4);
      padding: var(--space-4);
      border-bottom: 1px solid var(--color-border);
      cursor: pointer;
      transition: background var(--transition-fast);
    }
    .notif-row:hover {
      background: var(--color-bg-secondary);
    }
    .notif-row.unread {
      background: var(--color-primary-lighter);
    }
    .notif-details {
      flex: 1;
    }

    @media (max-width: 900px) {
      .seller-main-content {
        margin-left: 0;
        padding: var(--space-4);
      }
    }
  `]
})
export class SellerNotificationsComponent {
  constructor(private notificationService: NotificationService) {}

  notifications(): Notification[] {
    return this.notificationService.getNotifications();
  }

  getIconName(type: string): string {
    switch (type) {
      case 'order': return 'clipboard-list';
      case 'application': return 'file-text';
      case 'review': return 'star';
      case 'stock': return 'box';
      default: return 'bell';
    }
  }

  markAsRead(n: Notification) {
    this.notificationService.markAsRead(n.id);
  }

  markAllRead() {
    this.notificationService.markAllAsRead();
  }
}
