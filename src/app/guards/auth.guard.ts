import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  return true;
};

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
      router.navigate(['/auth/login']);
      return false;
    }

    const role = authService.userRole();
    if (!role || !allowedRoles.includes(role)) {
      router.navigate(['/']);
      return false;
    }

    return true;
  };
};

export const customerGuard: CanActivateFn = roleGuard(['customer']);
export const sellerGuard: CanActivateFn = roleGuard(['seller']);
export const adminGuard: CanActivateFn = roleGuard(['admin']);

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    const role = authService.userRole();
    switch (role) {
      case 'customer': router.navigate(['/customer']); break;
      case 'seller': router.navigate(['/seller']); break;
      case 'admin': router.navigate(['/admin']); break;
      default: router.navigate(['/']);
    }
    return false;
  }
  return true;
};
