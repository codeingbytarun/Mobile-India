import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * buyerGuard:
 * Protects buyer dashboard.
 * If a seller visits, redirects them to /seller/dashboard.
 */
export const buyerGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();

  if (authService.isAuthenticated() && user?.role === 'shopkeeper') {
    router.navigate(['/seller/dashboard']);
    return false;
  }

  return true;
};
