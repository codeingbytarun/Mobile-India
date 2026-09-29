import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MarketplaceService } from '../../services/marketplace.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.css'
})
export class AuthModalComponent {
  marketplace = inject(MarketplaceService);
  private router = inject(Router);

  activeTab: 'buyer' | 'shopkeeper' = 'buyer';

  // Buyer Form
  buyerName = '';
  buyerPhone = '';

  // Shopkeeper Form
  shopkeeperPhone = '';

  close(): void {
    this.marketplace.isAuthModalOpen.set(false);
    this.marketplace.pendingInquiry.set(null);
  }

  submitBuyerLogin(): void {
    if (!this.buyerName.trim() || !this.buyerPhone.trim()) {
      alert('Please enter your Name and Mobile Number.');
      return;
    }
    this.marketplace.loginBuyer(this.buyerName, this.buyerPhone);
  }

  submitShopkeeperLogin(): void {
    if (!this.shopkeeperPhone.trim()) {
      alert('Please enter your registered shopkeeper mobile number.');
      return;
    }
    this.marketplace.loginShopkeeper(this.shopkeeperPhone);
    this.router.navigate(['/seller']);
  }
}
