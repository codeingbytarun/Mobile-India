import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { PhoneListing } from '../models/phone.model';

export interface LeadItem {
  id: string;
  phoneId: string;
  shopId: string;
  buyerName: string;
  phone: string;
  channel: 'whatsapp' | 'call';
  status: 'New' | 'Contacted' | 'Visited Store' | 'Sold' | 'Lost';
  createdAt: string;
  phoneDetails?: PhoneListing;
}

@Injectable({
  providedIn: 'root'
})
export class LeadService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/leads`;

  readonly shopLeads = signal<LeadItem[]>([]);
  readonly myInquiries = signal<LeadItem[]>([]);
  readonly isLoading = signal<boolean>(false);

  // 5.1 Initiate WhatsApp or Call Lead (redirects seamlessly)
  initiateInquiry(phoneId: string, channel: 'whatsapp' | 'call' = 'whatsapp'): Observable<ApiResponse<{ leadId: string; redirectUrl: string }>> {
    return this.http.post<ApiResponse<{ leadId: string; redirectUrl: string }>>(this.baseUrl, { phoneId, channel }).pipe(
      tap(res => {
        if (res.success && res.data?.redirectUrl) {
          if (channel === 'call') {
            window.location.href = res.data.redirectUrl;
          } else {
            window.open(res.data.redirectUrl, '_blank');
          }
        }
      })
    );
  }

  // 5.2 Get Shop CRM Inquiries
  getShopLeads(shopId: string): Observable<ApiResponse<LeadItem[]>> {
    this.isLoading.set(true);
    return this.http.get<ApiResponse<LeadItem[]>>(`${this.baseUrl}/shop/${shopId}`).pipe(
      tap(res => {
        this.isLoading.set(false);
        if (res.success && Array.isArray(res.data)) {
          this.shopLeads.set(res.data);
        }
      })
    );
  }

  // 5.3 Update Inquiry Status
  updateStatus(leadId: string, status: 'New' | 'Contacted' | 'Visited Store' | 'Sold' | 'Lost'): Observable<ApiResponse<LeadItem>> {
    return this.http.patch<ApiResponse<LeadItem>>(`${this.baseUrl}/${leadId}/status`, { status }).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.shopLeads.update(list => list.map(l => l.id === leadId ? { ...l, status } : l));
        }
      })
    );
  }

  // 5.4 Get My Inquiries (Buyer)
  getMyInquiries(): Observable<ApiResponse<LeadItem[]>> {
    this.isLoading.set(true);
    return this.http.get<ApiResponse<LeadItem[]>>(`${this.baseUrl}/buyer/my-inquiries`).pipe(
      tap(res => {
        this.isLoading.set(false);
        if (res.success && Array.isArray(res.data)) {
          this.myInquiries.set(res.data);
        }
      })
    );
  }
}
