import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PhoneDetailComponent } from './pages/phone-detail/phone-detail.component';
import { CompareComponent } from './pages/compare/compare.component';
import { ShopViewComponent } from './pages/shop-view/shop-view.component';
import { SellerDashboardComponent } from './pages/seller-dashboard/seller-dashboard.component';
import { BuyerDashboardComponent } from './pages/buyer-dashboard/buyer-dashboard.component';
import { ShopRegisterComponent } from './pages/shop-register/shop-register.component';
import { AddPhoneComponent } from './pages/seller-dashboard/add-phone/add-phone.component';
import { sellerGuard } from './guards/seller.guard';
import { marketplaceGuard } from './guards/marketplace.guard';
import { buyerGuard } from './guards/buyer.guard';

export const routes: Routes = [
  // 1. Public Marketplace for Guests & Buyers (Sellers are blocked and redirected to seller dashboard)
  {
    path: '',
    canActivate: [marketplaceGuard],
    component: HomeComponent,
    title: 'MobiMarket — Used Phones from Verified Local Shops'
  },
  // 2. Separate Seller Dashboard for Shopkeepers (Protected for sellers only)
  {
    path: 'seller/dashboard',
    canActivate: [sellerGuard],
    component: SellerDashboardComponent,
    title: 'Shopkeeper Merchant Control Center — MobiMarket'
  },
  {
    path: 'seller/add-phone',
    canActivate: [sellerGuard],
    component: AddPhoneComponent,
    title: 'List New Smartphone — MobiMarket Seller'
  },
  {
    path: 'seller',
    redirectTo: 'seller/dashboard',
    pathMatch: 'full'
  },
  // 3. Separate Buyer Dashboard (For buyers only)
  {
    path: 'buyer',
    canActivate: [buyerGuard],
    component: BuyerDashboardComponent,
    title: 'My Cart & Buyer Dashboard — MobiMarket'
  },
  {
    path: 'buyer/dashboard',
    redirectTo: 'buyer'
  },
  {
    path: 'buyer/cart',
    redirectTo: 'buyer'
  },
  {
    path: 'buyer/my-inquiries',
    redirectTo: 'buyer'
  },
  // 4. Other Public Pages
  {
    path: 'compare',
    canActivate: [marketplaceGuard],
    component: CompareComponent,
    title: 'Compare Local Shop Prices — MobiMarket'
  },
  {
    path: 'phone/:id',
    component: PhoneDetailComponent,
    title: 'Device Details & Shop WhatsApp — MobiMarket'
  },
  {
    path: 'shop/:id',
    component: ShopViewComponent,
    title: 'Shop Digital Storefront — MobiMarket'
  },
  {
    path: 'shops/:id',
    redirectTo: 'shop/:id'
  },
  {
    path: 'register-shop',
    component: ShopRegisterComponent,
    title: 'Register Your Mobile Shop — MobiMarket Partner'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
