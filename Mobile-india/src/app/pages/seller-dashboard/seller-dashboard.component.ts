import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MarketplaceService } from '../../services/marketplace.service';
import { PhoneListing, PhoneCondition } from '../../models/phone.model';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './seller-dashboard.component.html',
  styleUrl: './seller-dashboard.component.css'
})
export class SellerDashboardComponent {
  marketplace = inject(MarketplaceService);

  showAddModal = false;
  editingPricePhoneId: string | null = null;
  newPriceValue: number = 0;

  // Add listing state
  inputImageUrl: string = '';
  isDragging: boolean = false;

  // Edit existing listing photos state
  editingPhotosPhone: PhoneListing | null = null;
  editingPhoneImages: string[] = [];
  editingInputImageUrl: string = '';
  isEditingDragging: boolean = false;

  // Curated sample smartphone photos for quick 1-click addition
  readonly presetPhotos = [
    { label: 'Front Display View', url: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&auto=format&fit=crop&q=80' },
    { label: 'Back & Camera Lens', url: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800&auto=format&fit=crop&q=80' },
    { label: 'Side Angles & Frame', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80' },
    { label: 'Device with Box & Charger', url: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80' }
  ];

  newPhone: {
    brand: PhoneListing['brand'];
    model: string;
    ram: string;
    storage: string;
    color: string;
    price: number;
    mrp: number;
    condition: PhoneCondition;
    batteryHealth: number | undefined;
    billBoxAvailable: boolean;
    warranty: string;
    images: string[];
  } = {
    brand: 'Apple',
    model: '',
    ram: '6GB',
    storage: '128GB',
    color: '',
    price: 0,
    mrp: 0,
    condition: 'Like New',
    batteryHealth: 90,
    billBoxAvailable: true,
    warranty: '30-Day Testing Warranty',
    images: [
      'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&auto=format&fit=crop&q=80'
    ]
  };

  get user() {
    return this.marketplace.currentUser();
  }

  get isShopkeeperLoggedIn(): boolean {
    return this.user?.role === 'shopkeeper';
  }

  get shop() {
    return this.marketplace.activeMerchantShop();
  }

  get myInventory(): PhoneListing[] {
    return this.marketplace.getPhonesByShop(this.shop.id, true);
  }

  get activeInventoryCount(): number {
    return this.myInventory.filter(p => !p.isSold).length;
  }

  get soldInventoryCount(): number {
    return this.myInventory.filter(p => p.isSold).length;
  }

  get totalViews(): number {
    return this.myInventory.reduce((acc, p) => acc + p.viewsCount, 0);
  }

  get totalLeads(): number {
    return this.myInventory.reduce((acc, p) => acc + p.leadsCount, 0);
  }

  openShopkeeperLogin(): void {
    this.marketplace.isAuthModalOpen.set(true);
  }

  toggleSold(phoneId: string): void {
    this.marketplace.markAsSold(phoneId);
  }

  startPriceEdit(phone: PhoneListing): void {
    this.editingPricePhoneId = phone.id;
    this.newPriceValue = phone.price;
  }

  savePriceEdit(phoneId: string): void {
    if (this.newPriceValue > 0) {
      this.marketplace.updatePrice(phoneId, this.newPriceValue);
    }
    this.editingPricePhoneId = null;
  }

  cancelPriceEdit(): void {
    this.editingPricePhoneId = null;
  }

  deletePhone(phoneId: string): void {
    if (confirm('Are you sure you want to remove this listing?')) {
      this.marketplace.deletePhone(phoneId);
    }
  }

  // --- Photo Management Methods for "Add New Phone" Form ---

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.processUploadedFiles(Array.from(input.files), this.newPhone.images);
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.processUploadedFiles(Array.from(event.dataTransfer.files), this.newPhone.images);
    }
  }

  addImageFromUrl(): void {
    const url = this.inputImageUrl.trim();
    if (!url) return;
    this.newPhone.images.push(url);
    this.inputImageUrl = '';
  }

  addPresetImage(url: string): void {
    if (!this.newPhone.images.includes(url)) {
      this.newPhone.images.push(url);
    }
  }

  setAsCover(index: number): void {
    if (index <= 0 || index >= this.newPhone.images.length) return;
    const [selected] = this.newPhone.images.splice(index, 1);
    this.newPhone.images.unshift(selected);
  }

  moveImage(fromIndex: number, toIndex: number): void {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= this.newPhone.images.length || toIndex >= this.newPhone.images.length) return;
    const [item] = this.newPhone.images.splice(fromIndex, 1);
    this.newPhone.images.splice(toIndex, 0, item);
  }

  moveImageStep(index: number, direction: -1 | 1): void {
    const targetIndex = index + direction;
    if (targetIndex >= 0 && targetIndex < this.newPhone.images.length) {
      this.moveImage(index, targetIndex);
    }
  }

  removeImage(index: number): void {
    this.newPhone.images.splice(index, 1);
  }

  // --- Photo Management Methods for "Manage Photos" (Existing Listing) ---

  openPhotoManager(phone: PhoneListing): void {
    this.editingPhotosPhone = phone;
    this.editingPhoneImages = [...phone.images];
    this.editingInputImageUrl = '';
  }

  closePhotoManager(): void {
    this.editingPhotosPhone = null;
    this.editingPhoneImages = [];
    this.editingInputImageUrl = '';
  }

  savePhotoManager(): void {
    if (!this.editingPhotosPhone) return;
    if (this.editingPhoneImages.length === 0) {
      alert('Please keep at least 1 photo for this phone listing.');
      return;
    }
    this.marketplace.updatePhoneImages(this.editingPhotosPhone.id, this.editingPhoneImages);
    this.closePhotoManager();
  }

  onExistingFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.processUploadedFiles(Array.from(input.files), this.editingPhoneImages);
    input.value = '';
  }

  onExistingDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isEditingDragging = true;
  }

  onExistingDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isEditingDragging = false;
  }

  onExistingFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isEditingDragging = false;
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.processUploadedFiles(Array.from(event.dataTransfer.files), this.editingPhoneImages);
    }
  }

  addExistingImageUrl(): void {
    const url = this.editingInputImageUrl.trim();
    if (!url) return;
    this.editingPhoneImages.push(url);
    this.editingInputImageUrl = '';
  }

  addExistingPreset(url: string): void {
    if (!this.editingPhoneImages.includes(url)) {
      this.editingPhoneImages.push(url);
    }
  }

  setExistingAsCover(index: number): void {
    if (index <= 0 || index >= this.editingPhoneImages.length) return;
    const [selected] = this.editingPhoneImages.splice(index, 1);
    this.editingPhoneImages.unshift(selected);
  }

  moveExistingImage(fromIndex: number, toIndex: number): void {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= this.editingPhoneImages.length || toIndex >= this.editingPhoneImages.length) return;
    const [item] = this.editingPhoneImages.splice(fromIndex, 1);
    this.editingPhoneImages.splice(toIndex, 0, item);
  }

  moveExistingImageStep(index: number, direction: -1 | 1): void {
    const targetIndex = index + direction;
    if (targetIndex >= 0 && targetIndex < this.editingPhoneImages.length) {
      this.moveExistingImage(index, targetIndex);
    }
  }

  removeExistingImage(index: number): void {
    this.editingPhoneImages.splice(index, 1);
  }

  // --- Helper to process uploaded files with FileReader ---

  private processUploadedFiles(files: File[], targetList: string[]): void {
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          targetList.push(result);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  // --- Submit New Phone Listing ---

  submitNewPhone(): void {
    if (!this.newPhone.model || !this.newPhone.price) {
      alert('Please fill in Phone Model and Price');
      return;
    }

    const finalImages = this.newPhone.images.length > 0
      ? [...this.newPhone.images]
      : ['https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&auto=format&fit=crop&q=80'];

    this.marketplace.addPhone({
      brand: this.newPhone.brand,
      model: this.newPhone.model,
      ram: this.newPhone.ram,
      storage: this.newPhone.storage,
      color: this.newPhone.color || 'Black',
      price: Number(this.newPhone.price),
      mrp: Number(this.newPhone.mrp) || Number(this.newPhone.price) * 1.4,
      condition: this.newPhone.condition,
      batteryHealth: this.newPhone.batteryHealth ? Number(this.newPhone.batteryHealth) : undefined,
      billBoxAvailable: this.newPhone.billBoxAvailable,
      warranty: this.newPhone.warranty,
      shopId: this.shop.id,
      shopName: this.shop.name,
      shopLocality: this.shop.locality,
      shopCity: this.shop.city,
      shopPhone: this.shop.phone,
      shopWhatsapp: this.shop.whatsapp,
      shopDistanceKm: this.shop.distanceKm,
      images: finalImages,
      isSold: false
    });

    this.showAddModal = false;
    this.resetNewPhone();
  }

  resetNewPhone(): void {
    this.newPhone = {
      brand: 'Apple',
      model: '',
      ram: '6GB',
      storage: '128GB',
      color: '',
      price: 0,
      mrp: 0,
      condition: 'Like New',
      batteryHealth: 90,
      billBoxAvailable: true,
      warranty: '30-Day Testing Warranty',
      images: [
        'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&auto=format&fit=crop&q=80'
      ]
    };
    this.inputImageUrl = '';
  }

  shareStorefrontOnWhatsApp(): void {
    const text = `Namaste! Check out my shop's live second-hand smartphone inventory on MobiMarket with verified testing warranty: ${window.location.origin}/shop/${this.shop.id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }
}
