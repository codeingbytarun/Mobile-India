import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PhoneDetailComponent } from './pages/phone-detail/phone-detail.component';
import { CompareComponent } from './pages/compare/compare.component';
import { ShopViewComponent } from './pages/shop-view/shop-view.component';
import { SellerDashboardComponent } from './pages/seller-dashboard/seller-dashboard.component';
import { BuyerDashboardComponent } from './pages/buyer-dashboard/buyer-dashboard.component';
import { ShopRegisterComponent } from './pages/shop-register/shop-register.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'MobiMarket — Used Phones from Verified Local Shops'
  },
  {
    path: 'phone/:id',
    component: PhoneDetailComponent,
    title: 'Device Details & Shop WhatsApp — MobiMarket'
  },
  {
    path: 'compare',
    component: CompareComponent,
    title: 'Compare Local Shop Prices — MobiMarket'
  },
  {
    path: 'shop/:id',
    component: ShopViewComponent,
    title: 'Shop Digital Storefront — MobiMarket'
  },
  {
    path: 'buyer',
    component: BuyerDashboardComponent,
    title: 'My Cart & Buyer Dashboard — MobiMarket'
  },
  {
    path: 'seller',
    component: SellerDashboardComponent,
    title: 'Shopkeeper Merchant Control Center — MobiMarket'
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
