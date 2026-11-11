import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole } from '../models';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = signal<User | null>(null);
  
  readonly user = this.currentUser.asReadonly();
  readonly isLoggedIn = computed(() => !!this.currentUser());
  readonly userRole = computed(() => this.currentUser()?.role ?? null);
  readonly isCustomer = computed(() => this.currentUser()?.role === 'customer');
  readonly isSeller = computed(() => this.currentUser()?.role === 'seller');
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  constructor(private mockData: MockDataService, private router: Router) {
    this.restoreSession();
  }

  private restoreSession(): void {
    const sessionUserId = localStorage.getItem('gymplate_session_user_id');
    if (sessionUserId) {
      const user = this.mockData.getUser(sessionUserId);
      if (user && user.accountStatus === 'active') {
        this.currentUser.set(user);
      } else {
        localStorage.removeItem('gymplate_session_user_id');
      }
    }
  }

  login(email: string, password: string): { success: boolean; message: string; user?: User } {
    const user = this.mockData.getUserByEmail(email);
    if (!user) {
      return { success: false, message: 'No account found with this email address.' };
    }
    // Demo auth: compare base64 hash. NOT secure for production.
    const hash = this.mockData.simpleHash(password);
    if (user.passwordHash !== hash) {
      return { success: false, message: 'Incorrect password. Please try again.' };
    }
    if (user.accountStatus === 'suspended') {
      return { success: false, message: 'Your account has been suspended. Please contact support.' };
    }
    this.currentUser.set(user);
    // Store only the user ID for session restoration - not sensitive data
    localStorage.setItem('gymplate_session_user_id', user.id);
    return { success: true, message: 'Login successful!', user };
  }

  adminLogin(email: string, password: string): { success: boolean; message: string; user?: User } {
    const result = this.login(email, password);
    if (result.success && result.user?.role !== 'admin') {
      this.logout();
      return { success: false, message: 'This login is for administrators only.' };
    }
    return result;
  }

  register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: 'customer' | 'seller';
  }): { success: boolean; message: string; user?: User } {
    const existing = this.mockData.getUserByEmail(userData.email);
    if (existing) {
      return { success: false, message: 'An account with this email already exists.' };
    }
    const newUser: User = {
      id: 'user-' + Date.now(),
      email: userData.email,
      passwordHash: this.mockData.simpleHash(userData.password),
      role: userData.role,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      address: '',
      city: '',
      state: '',
      zipCode: '',
      accountStatus: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mockData.addUser(newUser);
    this.currentUser.set(newUser);
    localStorage.setItem('gymplate_session_user_id', newUser.id);
    return { success: true, message: 'Account created successfully!', user: newUser };
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('gymplate_session_user_id');
    this.router.navigate(['/']);
  }

  updateProfile(updates: Partial<User>): boolean {
    const user = this.currentUser();
    if (!user) return false;
    const updated = { ...user, ...updates, updatedAt: new Date() };
    this.mockData.updateUser(updated);
    this.currentUser.set(updated);
    return true;
  }

  refreshUser(): void {
    const user = this.currentUser();
    if (user) {
      const fresh = this.mockData.getUser(user.id);
      if (fresh) this.currentUser.set(fresh);
    }
  }

  getDemoCredentials(): { role: string; email: string; password: string }[] {
    return [
      { role: 'Customer', email: 'customer@gymplate.com', password: 'Customer123!' },
      { role: 'Seller (Approved)', email: 'seller@gymplate.com', password: 'Seller123!' },
      { role: 'Administrator', email: 'admin@gymplate.com', password: 'Admin123!' }
    ];
  }

  quickLogin(role: 'customer' | 'seller' | 'admin'): boolean {
    const creds: Record<string, { email: string; pass: string }> = {
      customer: { email: 'customer@gymplate.com', pass: 'Customer123!' },
      seller: { email: 'seller@gymplate.com', pass: 'Seller123!' },
      admin: { email: 'admin@gymplate.com', pass: 'Admin123!' }
    };
    const target = creds[role];
    if (!target) return false;
    const result = this.login(target.email, target.pass);
    return result.success;
  }
}
