import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketplaceService } from '../../services/marketplace.service';
import { PhoneCardComponent } from '../../components/phone-card/phone-card.component';
import { PhoneCondition } from '../../models/phone.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, PhoneCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  marketplace = inject(MarketplaceService);

  conditions: PhoneCondition[] = ['Pristine', 'Like New', 'Good', 'Fair'];
  storages: string[] = ['64GB', '128GB', '256GB', '512GB'];

  // Temporary filter binds for sliders
  maxPrice = 80000;
  maxDistance = 25;

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
