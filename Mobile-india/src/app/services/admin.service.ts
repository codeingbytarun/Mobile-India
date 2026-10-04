import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Shop } from '../models/shop.model';

export interface PlatformStats {
  totalUsers: number;
  totalShops: number;
  verifiedShops: number;
  activeListings: number;
  totalLeads: number;
  totalViews: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin`;

  readonly pendingShops = signal<Shop[]>([]);
  readonly platformStats = signal<PlatformStats | null>(null);

  // 9.1 Pending Storefronts
  getPendingShops(): Observable<ApiResponse<Shop[]>> {
    return this.http.get<ApiResponse<Shop[]>>(`${this.baseUrl}/shops/pending`).pipe(
      tap(res => {
        if (res.success && Array.isArray(res.data)) {
          this.pendingShops.set(res.data);
        }
      })
    );
  }

  // 9.2 Physical Store Verification
  verifyShop(shopId: string, verified: boolean = true, notes?: string): Observable<ApiResponse<Shop>> {
    return this.http.patch<ApiResponse<Shop>>(`${this.baseUrl}/shops/${shopId}/verify`, { verified, notes }).pipe(
      tap(res => {
        if (res.success) {
          this.pendingShops.update(list => list.filter(s => s.id !== shopId));
        }
      })
    );
  }

  // 9.3 Platform-wide Statistics
  getPlatformStats(): Observable<ApiResponse<PlatformStats>> {
    return this.http.get<ApiResponse<PlatformStats>>(`${this.baseUrl}/stats`).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.platformStats.set(res.data);
        }
      })
    );
  }

  // 9.4 Moderation Flag / Hide / Restore
  flagListing(phoneId: string, action: 'hide' | 'restore' | 'delete', reason?: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.baseUrl}/listings/${phoneId}/flag`, { action, reason });
  }
}
