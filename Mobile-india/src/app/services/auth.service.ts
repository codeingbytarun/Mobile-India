import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { 
  UserSession, 
  AuthVerifyResponse, 
  SendOtpResponse, 
  ShopRegistrationData 
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  readonly currentUser = signal<UserSession | null>(this.loadStoredUser());
  readonly isAuthenticated = signal<boolean>(!!localStorage.getItem('mobimarket_token'));

  /**
   * 1. Send OTP
   * - If email is passed: delivers 6-digit OTP directly to email inbox.
   * - If phone is passed: automatically finds registered shopkeeper/user email & sends OTP there!
   */
  sendOtp(target: { email?: string; phone?: string; channel?: 'email' | 'sms' }): Observable<ApiResponse<SendOtpResponse>> {
    return this.http.post<ApiResponse<SendOtpResponse>>(`${this.baseUrl}/send-otp`, target);
  }

  /**
   * 2. Verify OTP & Auto-Register / Login
   * Works with either email or phone + OTP code
   */
  verifyOtp(payload: {
    email?: string;
    phone?: string;
    otp: string;
    sessionId?: string;
    roleHint?: 'buyer' | 'shopkeeper';
    name?: string;
  }): Observable<ApiResponse<AuthVerifyResponse>> {
    return this.http.post<ApiResponse<AuthVerifyResponse>>(`${this.baseUrl}/verify-otp`, payload).pipe(
      tap(res => {
        if (res.success && res.data) {
          localStorage.setItem('mobimarket_token', res.data.token);
          localStorage.setItem('mobimarket_refresh_token', res.data.refreshToken);
          localStorage.setItem('mobimarket_user', JSON.stringify(res.data.user));
          this.currentUser.set(res.data.user);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  /**
   * 3. Resend OTP
   */
  resendOtp(payload: { sessionId?: string; email?: string; phone?: string }): Observable<ApiResponse<SendOtpResponse>> {
    return this.http.post<ApiResponse<SendOtpResponse>>(`${this.baseUrl}/resend-otp`, payload);
  }

  /**
   * 4. Register Shopkeeper (Business Email must be unique)
   */
  registerShopkeeper(shopData: ShopRegistrationData): Observable<ApiResponse<{ token: string; shop: any }>> {
    return this.http.post<ApiResponse<{ token: string; shop: any }>>(`${this.baseUrl}/register-shopkeeper`, shopData).pipe(
      tap(res => {
        if (res.success && res.data?.token) {
          localStorage.setItem('mobimarket_token', res.data.token);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  /**
   * 5. Logout
   */
  logout(): void {
    localStorage.removeItem('mobimarket_token');
    localStorage.removeItem('mobimarket_refresh_token');
    localStorage.removeItem('mobimarket_user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  private loadStoredUser(): UserSession | null {
    try {
      const stored = localStorage.getItem('mobimarket_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}
