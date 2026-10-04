import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MarketplaceService } from '../../services/marketplace.service';
import { MetaService } from '../../services/meta.service';
import { AuthService } from '../../services/auth.service';
import { PhoneListing } from '../../models/phone.model';

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './compare.component.html',
  styleUrl: './compare.component.css'
})
export class CompareComponent implements OnInit {
  marketplace = inject(MarketplaceService);
  authService = inject(AuthService);
  private metaService = inject(MetaService);

  comparableModels: string[] = ['iPhone 13', 'OnePlus 11R 5G', 'Galaxy S21 FE 5G', 'Pixel 7'];
  selectedModel = 'iPhone 13';
  comparisonListings: PhoneListing[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.metaService.getBrands().subscribe(res => {
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const dynamicModels: string[] = [];
        res.data.forEach(brand => {
          if (brand.models && Array.isArray(brand.models)) {
            dynamicModels.push(...brand.models);
          }
        });
        if (dynamicModels.length > 0) {
          this.comparableModels = dynamicModels;
          if (!this.comparableModels.includes(this.selectedModel)) {
            this.selectedModel = this.comparableModels[0];
          }
        }
      }
      this.updateComparison();
    });

    if (this.comparisonListings.length === 0) {
      this.updateComparison();
    }
  }

  onModelChange(): void {
    this.updateComparison();
  }

  updateComparison(): void {
    this.isLoading = true;
    this.marketplace.comparePhones(this.selectedModel, this.marketplace.currentCity()).subscribe(res => {
      this.isLoading = false;
      if (res.success && Array.isArray(res.data)) {
        this.comparisonListings = res.data;
      } else {
        this.comparisonListings = this.marketplace.getCompareListings(this.selectedModel);
      }
    });
  }

  get lowestPrice(): number {
    if (this.comparisonListings.length === 0) return 0;
    return Math.min(...this.comparisonListings.map(p => p.price));
  }

  openWhatsApp(phone: PhoneListing): void {
    this.marketplace.requestInquiry(phone, 'whatsapp');
  }
}
