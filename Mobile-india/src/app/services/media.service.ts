import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface UploadMediaResponse {
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
}

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/media`;

  // 7.1 Upload Device Photos
  uploadImage(file: File): Observable<ApiResponse<UploadMediaResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<UploadMediaResponse>>(`${this.baseUrl}/upload`, formData);
  }

  // 7.2 Delete Media Asset
  deleteImage(url: string): Observable<ApiResponse<null>> {
    return this.http.request<ApiResponse<null>>('DELETE', this.baseUrl, {
      body: { url }
    });
  }
}
