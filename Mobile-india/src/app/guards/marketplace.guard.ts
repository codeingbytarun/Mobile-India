import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * marketplaceGuard:
 * Prevents sellers (shopkeepers) from viewing the public buyer marketplace.
 * Sellers must only see their own dedicated seller dashboard.
 */
export const marketplaceGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();

  if (authService.isAuthenticated() && user?.role === 'shopkeeper') {
    router.navigate(['/seller/dashboard']);
    return false;
  }

  return true;
};
