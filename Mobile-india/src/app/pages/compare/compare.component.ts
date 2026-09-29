import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MarketplaceService } from '../../services/marketplace.service';
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

  comparableModels = ['iPhone 13', 'OnePlus 11R 5G', 'Galaxy S21 FE 5G', 'Pixel 7'];
  selectedModel = 'iPhone 13';
  comparisonListings: PhoneListing[] = [];

  ngOnInit(): void {
    this.updateComparison();
  }

  onModelChange(): void {
    this.updateComparison();
  }

  updateComparison(): void {
    this.comparisonListings = this.marketplace.getCompareListings(this.selectedModel);
  }

  get lowestPrice(): number {
    if (this.comparisonListings.length === 0) return 0;
    return Math.min(...this.comparisonListings.map(p => p.price));
  }

  openWhatsApp(phone: PhoneListing): void {
    this.marketplace.recordLead(phone.id);
    const url = this.marketplace.getWhatsAppUrl(phone);
    window.open(url, '_blank');
  }
}
