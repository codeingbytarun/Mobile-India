import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MarketplaceService } from '../../services/marketplace.service';
import { MetaService } from '../../services/meta.service';
import { AuthService } from '../../services/auth.service';
import { PhoneCardComponent } from '../../components/phone-card/phone-card.component';
import { PhoneCondition } from '../../models/phone.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, PhoneCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  marketplace = inject(MarketplaceService);
  authService = inject(AuthService);
  meta = inject(MetaService);
  private router = inject(Router);

  conditions: PhoneCondition[] = ['Pristine', 'Like New', 'Good', 'Fair'];
  storages: string[] = ['64GB', '128GB', '256GB', '512GB'];

  // Temporary filter binds for sliders
  maxPrice = 80000;
  maxDistance = 25;

  ngOnInit(): void {
    // If seller is logged in, never show common marketplace phones; redirect to seller dashboard
    if (this.authService.currentUser()?.role === 'shopkeeper') {
      this.router.navigate(['/seller/dashboard']);
      return;
    }

    this.marketplace.loadPhones().subscribe();
    this.marketplace.loadFeatured().subscribe();
    this.meta.getBrands().subscribe();
  }

  get availableBrands(): string[] {
    const metaBrands = this.meta.brands();
    if (metaBrands.length > 0) {
      return metaBrands.map(b => b.brand);
    }
    return this.marketplace.brands;
  }

  onBrandSelect(brand: string | null): void {
    this.marketplace.setBrand(brand);
  }

  onPriceChange(): void {
    this.marketplace.setPriceRange(0, this.maxPrice);
  }

  onDistanceChange(): void {
    this.marketplace.setMaxDistance(this.maxDistance);
  }

  onConditionSelect(condition: PhoneCondition): void {
    this.marketplace.setCondition(condition);
  }

  onStorageSelect(storage: string): void {
    this.marketplace.setStorage(storage);
  }

  toggleBillBox(): void {
    this.marketplace.toggleBillBox();
  }

  resetFilters(): void {
    this.maxPrice = 80000;
    this.maxDistance = 25;
    this.marketplace.resetFilters();
  }
}
