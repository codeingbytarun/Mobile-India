import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MarketplaceService } from '../../services/marketplace.service';

@Component({
  selector: 'app-shop-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './shop-register.component.html',
  styleUrl: './shop-register.component.css'
})
export class ShopRegisterComponent {
  marketplace = inject(MarketplaceService);
  private router = inject(Router);

  shopData = {
    shopName: '',
    ownerName: '',
    phone: '',
    whatsapp: '',
    city: 'Jaipur',
    locality: '',
    address: '',
    googleMapsUrl: '',
    openHours: '10:00 AM - 9:30 PM',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80'
  };

  imageOptions = [
    { label: 'Modern Retail Storefront', url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80' },
    { label: 'Electronic Market Shop', url: 'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=600&auto=format&fit=crop&q=80' },
    { label: 'Smartphone Service Hub', url: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=600&auto=format&fit=crop&q=80' }
  ];

  onSubmit(): void {
    if (!this.shopData.shopName.trim() || !this.shopData.phone.trim() || !this.shopData.address.trim()) {
      alert('Please fill in required fields: Shop Name, Mobile Number, and Address.');
      return;
    }

    if (!this.shopData.whatsapp) {
      this.shopData.whatsapp = this.shopData.phone;
    }

    this.marketplace.registerShopkeeper(this.shopData);
    this.router.navigate(['/seller']);
  }
}
