import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface DashboardMetrics {
  viewsToday: number;
  viewsTotal: number;
  leadsToday: number;
  leadsTotal: number;
  activeInventoryCount: number;
  soldCount: number;
  totalInventoryValue: number;
  conversionRatePercent: number;
}

export interface TopModelMetric {
  model: string;
  views: number;
  leads: number;
}

export interface TrendMetric {
  date: string;
  views: number;
  leads: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/analytics`;

  readonly dashboard = signal<DashboardMetrics | null>(null);
  readonly topModels = signal<TopModelMetric[]>([]);
  readonly trends = signal<TrendMetric[]>([]);
  readonly isLoading = signal<boolean>(false);

  // 6.1 Real-Time KPIs
  getDashboard(shopId: string): Observable<ApiResponse<DashboardMetrics>> {
    this.isLoading.set(true);
    return this.http.get<ApiResponse<DashboardMetrics>>(`${this.baseUrl}/dashboard/${shopId}`).pipe(
      tap(res => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.dashboard.set(res.data);
        }
      })
    );
  }

  // 6.2 Top Viewed & Inquired Models
  getTopModels(shopId: string): Observable<ApiResponse<TopModelMetric[]>> {
    return this.http.get<ApiResponse<TopModelMetric[]>>(`${this.baseUrl}/top-models/${shopId}`).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.topModels.set(res.data);
        }
      })
    );
  }

  // 6.3 30-Day Trends
  getTrends(shopId: string, days: number = 30): Observable<ApiResponse<TrendMetric[]>> {
    const params = new HttpParams().set('days', String(days));
    return this.http.get<ApiResponse<TrendMetric[]>>(`${this.baseUrl}/trends/${shopId}`, { params }).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.trends.set(res.data);
        }
      })
    );
  }
}
