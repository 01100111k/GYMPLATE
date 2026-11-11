import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { ActivityLog } from '../../models';
import { AdminSidebarComponent } from '../../shared/components/admin-sidebar.component';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'app-admin-activity-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  template: `
    <div class="admin-layout">
      <app-admin-sidebar></app-admin-sidebar>

      <main class="admin-main-content">
        <div class="admin-container">
          <div class="page-header mb-6">
            <span class="text-xs font-bold uppercase text-warning">Security & Accountability</span>
            <h1>Administrator Audit Trail</h1>
            <p class="text-xs text-secondary">Cryptographically timestamped log of all governance, moderation, and suspension actions.</p>
          </div>

          <!-- Activity Log Table -->
          <div class="card table-panel">
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Administrator</th>
                    <th>Action Executed</th>
                    <th>Target Type & ID</th>
                    <th>Details</th>
                    <th>Justification Reason</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let log of logs">
                    <td class="text-xs text-secondary font-mono">{{ log.timestamp | date:'short' }}</td>
                    <td>
                      <strong class="text-xs block">{{ log.adminName }}</strong>
                      <small class="text-tertiary">ID: {{ log.adminId }}</small>
                    </td>
                    <td>
                      <span class="badge badge-warning text-xs font-semibold">{{ log.action }}</span>
                    </td>
                    <td>
                      <span class="badge badge-neutral text-xs uppercase">{{ log.targetType }}</span>
                      <small class="text-tertiary font-mono block mt-1">{{ log.targetId }}</small>
                    </td>
                    <td class="text-xs">{{ log.details }}</td>
                    <td class="text-xs text-secondary italic">
                      {{ log.reason || 'Standard operational protocol' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="empty-state py-8 text-center" *ngIf="logs.length === 0">
              <p class="text-xs text-secondary">No recorded administrator logs.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
      background: var(--color-bg-secondary);
    }
    .admin-main-content {
      flex: 1;
      margin-left: var(--sidebar-width);
      padding: var(--space-8) var(--space-6);
    }
    .admin-container {
      max-width: var(--container-max);
      margin: 0 auto;
    }
    .table-panel {
      border: 1px solid var(--color-border);
      background: white;
    }

    @media (max-width: 900px) {
      .admin-main-content {
        margin-left: 0;
        padding: var(--space-4);
      }
    }
  `]
})
export class AdminActivityLogsComponent implements OnInit {
  logs: ActivityLog[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.logs = this.adminService.getActivityLogs();
  }
}
