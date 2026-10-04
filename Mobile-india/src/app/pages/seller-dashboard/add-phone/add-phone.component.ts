import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-add-phone',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="add-phone-container">
      <div class="card add-phone-card">
        <div class="form-header">
          <div class="header-left">
            <a routerLink="/seller/dashboard" class="back-link">&larr; Back to Dashboard</a>
            <h2>➕ Add New Phone Listing</h2>
            <p>List a verified pre-owned smartphone on MobiMarket</p>
          </div>
        </div>

        @if (errorMessage()) {
          <div class="alert error-alert">{{ errorMessage() }}</div>
        }
        @if (successMessage()) {
          <div class="alert success-alert">{{ successMessage() }}</div>
        }

        <form (ngSubmit)="submitListing()">
          <div class="form-row">
            <div class="form-group">
              <label>Brand *</label>
              <select [(ngModel)]="phoneData.brand" name="brand" class="form-input" required>
                <option value="Apple">Apple iPhone</option>
                <option value="Samsung">Samsung Galaxy</option>
                <option value="OnePlus">OnePlus</option>
                <option value="Xiaomi">Xiaomi / Redmi</option>
                <option value="Vivo">Vivo</option>
                <option value="Oppo">Oppo</option>
                <option value="Realme">Realme</option>
                <option value="Google">Google Pixel</option>
              </select>
            </div>

            <div class="form-group">
              <label>Model Name *</label>
              <input
                type="text"
                class="form-input"
                placeholder="e.g. iPhone 14 Pro, Galaxy S23 Ultra"
                [(ngModel)]="phoneData.model"
                name="model"
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>RAM</label>
              <input type="text" class="form-input" placeholder="8GB" [(ngModel)]="phoneData.ram" name="ram" />
            </div>

            <div class="form-group">
              <label>Storage *</label>
              <input type="text" class="form-input" placeholder="128GB" [(ngModel)]="phoneData.storage" name="storage" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Selling Price (₹) *</label>
              <input type="number" class="form-input" placeholder="42999" [(ngModel)]="phoneData.price" name="price" required />
            </div>

            <div class="form-group">
              <label>Condition *</label>
              <select [(ngModel)]="phoneData.condition" name="condition" class="form-input">
                <option value="Like New">Like New (Flawless)</option>
                <option value="Superb">Superb (Minor Scratches)</option>
                <option value="Good">Good (Signs of Regular Use)</option>
                <option value="Fair">Fair (Heavy Cosmetic Wear)</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Image URL</label>
            <input
              type="url"
              class="form-input"
              placeholder="https://images.unsplash.com/photo-..."
              [(ngModel)]="phoneData.imageUrl"
              name="imageUrl"
            />
          </div>

          <button type="submit" class="btn btn-primary submit-btn" [disabled]="isSubmitting()">
            {{ isSubmitting() ? 'Publishing Listing...' : 'Publish Phone to Marketplace &rarr;' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .add-phone-container {
      max-width: 760px;
      margin: 32px auto;
      padding: 0 16px;
    }
    .add-phone-card {
      background: #ffffff;
      padding: 32px;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .form-header {
      margin-bottom: 24px;
    }
    .back-link {
      font-size: 13px;
      font-weight: 600;
      color: #4f46e5;
      text-decoration: none;
      display: inline-block;
      margin-bottom: 8px;
    }
    .form-header h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
    }
    .form-header p {
      margin: 4px 0 0 0;
      font-size: 14px;
      color: #64748b;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 16px;
    }
    .form-group label {
      font-size: 13px;
      font-weight: 700;
      color: #334155;
    }
    .form-input {
      padding: 10px 14px;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    .form-input:focus {
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
    }
    .btn {
      padding: 12px 20px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
      border: none;
      transition: background 0.2s;
    }
    .btn-primary {
      background: #4f46e5;
      color: #ffffff;
      width: 100%;
    }
    .btn-primary:hover:not(:disabled) {
      background: #4338ca;
    }
    .btn-primary:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }
    .alert {
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 16px;
    }
    .error-alert {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }
    .success-alert {
      background: #f0fdf4;
      color: #16a34a;
      border: 1px solid #bbf7d0;
    }
    @media (max-width: 600px) {
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class AddPhoneComponent {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);

  isSubmitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  phoneData = {
    brand: 'Apple',
    model: '',
    ram: '6GB',
    storage: '128GB',
    price: 35000,
    condition: 'Like New',
    imageUrl: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&auto=format&fit=crop&q=80'
  };

  submitListing() {
    if (!this.phoneData.model.trim()) {
      this.errorMessage.set('Please enter a phone model name');
      return;
    }
    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const user = this.authService.currentUser();
    const payload = {
      ...this.phoneData,
      shopId: user?.shopId || 'shop_01',
      images: [this.phoneData.imageUrl]
    };

    this.http.post<any>(`${environment.apiUrl}/phones`, payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.successMessage.set('Phone listing published successfully!');
        setTimeout(() => this.router.navigate(['/seller/dashboard']), 800);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/seller/dashboard']);
      }
    });
  }
}
