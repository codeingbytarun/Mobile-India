# MobiMarket — Local Shop Marketplace for Used Phones

> **Connecting Local Shops. Empowering Every Buyer.**  
> A hyper-local, two-sided marketplace web application connecting smartphone buyers with verified local second-hand mobile phone retail shops across Indian cities.

---

## 📌 1. Project Overview & Vision

Unlike C2C platforms like OLX or Quikr (which suffer from fraud, scams, meeting strangers, and non-working devices) or refurbished aggregators like Cashify (which impose 30-40% price markups), **MobiMarket** empowers physical, verified mobile shopkeepers:
- **Trust & Inspection**: Buyers inspect the device in-person at a physical shop with a physical bill and warranty.
- **Fair Pricing**: Directly access competitive local market prices with side-by-side comparison.
- **Digital Storefront for Shops**: Local shop owners get an effortless web catalog with a shareable WhatsApp link (`mobimarket.in/shop/sharma-telecom`).
- **Zero-Friction Communication**: Direct WhatsApp Click-to-Chat with pre-filled phone specs.

---

## 🏗️ 2. Architecture & Phased Strategy

```
┌────────────────────────────────────────────────────────┐
│               PHASE 1 (CURRENT): FRONTEND              │
│  Angular 19 (Standalone Components, Signals, Clean CSS) │
│  Responsive Mobile + Desktop, Mock Data, WhatsApp API  │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│              PHASE 2: BACKEND & DATABASE               │
│   Node.js / Express or Firebase / Supabase PostgreSQL   │
│   Phone OTP Authentication, Cloud Storage (Cloudinary) │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│         PHASE 3: ANDROID PACKAGING (PLAY STORE)        │
│          Capacitor / Trusted Web Activity (TWA)        │
└────────────────────────────────────────────────────────┘
```

---

## 🔌 3. Complete Backend REST API Specification

> 📖 **Full Comprehensive API Documentation:** See [API_DOCUMENTATION.md](file:///d:/mobi%20market/Mobile-india/API_DOCUMENTATION.md) for complete schemas, request/response payloads, database ERD, and error codes across all 45 platform endpoints.

### Base URL: `/api/v1` (Staging: `https://api.mobimarket.in/api/v1`)

---

### A. Authentication & Shopkeeper Profile

#### `POST /auth/send-otp`
Sends an SMS OTP to the shopkeeper's mobile number.
- **Request Body**:
  ```json
  {
    "phone": "+919876543210"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "OTP sent successfully",
    "sessionToken": "jwt_or_temp_token"
  }
  ```

#### `POST /auth/verify-otp`
Verifies OTP and returns auth JWT token.
- **Request Body**:
  ```json
  {
    "phone": "+919876543210",
    "otp": "482910"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "token": "eyJhbGciOi...",
    "shop": {
      "id": "shop_01",
      "name": "Sharma Telecom",
      "phone": "+919876543210",
      "verified": true
    }
  }
  ```

---

### B. Shops API

#### `GET /shops`
Fetch all registered shops in a selected city.
- **Query Params**: `city=Jaipur&locality=Malviya%20Nagar&verifiedOnly=true`
- **Response `200 OK`**:
  ```json
  [
    {
      "id": "shop_01",
      "name": "Sharma Telecom",
      "ownerName": "Rajesh Sharma",
      "verified": true,
      "rating": 4.9,
      "reviewsCount": 142,
      "address": "Shop 14, Main Market, Malviya Nagar",
      "locality": "Malviya Nagar",
      "city": "Jaipur",
      "phone": "+919829012345",
      "whatsapp": "+919829012345",
      "image": "https://images.unsplash.com/photo-...",
      "openHours": "10:00 AM - 9:30 PM",
      "lat": 26.8530,
      "lng": 75.8050,
      "activeListingsCount": 14
    }
  ]
  ```

#### `GET /shops/:id`
Fetch single shop profile and its full phone inventory.
- **Response `200 OK`**:
  ```json
  {
    "shop": { "id": "shop_01", "name": "Sharma Telecom", ... },
    "inventory": [ ...phones ]
  }
  ```

#### `POST /shops/register`
Register a new physical mobile shopkeeper.
- **Request Body**:
  ```json
  {
    "shopName": "Balaji Mobile World",
    "ownerName": "Rajesh Kumar",
    "phone": "+919829012345",
    "whatsapp": "+919829012345",
    "city": "Jaipur",
    "locality": "Malviya Nagar",
    "address": "Shop 12, Ground Floor, Central Plaza",
    "openHours": "10:00 AM - 9:30 PM",
    "image": "https://images.unsplash.com/..."
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "shopId": "shop_171000",
    "slug": "balaji-mobile-world",
    "token": "jwt_token..."
  }
  ```

#### `PUT /shops/:id`
Update shop profile (address, opening hours, storefront photo).

---

### C. Buyer Cart & Reservation API

#### `GET /buyer/cart`
Retrieve list of phones reserved in the buyer's cart.
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**:
  ```json
  {
    "itemsCount": 2,
    "totalPrice": 61499,
    "totalSavings": 43400,
    "phones": [ ...phones ]
  }
  ```

#### `POST /buyer/cart`
Add phone to buyer cart.
- **Request Body**: `{ "phoneId": "ph_01" }`

#### `DELETE /buyer/cart/:phoneId`
Remove phone from buyer cart.

---

### C. Phones & Inventory API

#### `GET /phones`
Retrieve filtered phone listings for buyers.
- **Query Parameters**:
  - `city` (string, default: `Jaipur`)
  - `brand` (string, e.g. `Apple`, `OnePlus`)
  - `minPrice` & `maxPrice` (numbers)
  - `condition` (`Pristine`, `Like New`, `Good`, `Fair`)
  - `storage` (`64GB`, `128GB`, `256GB`, `512GB`)
  - `maxDistanceKm` (number)
  - `search` (string, searches brand, model, keywords)
- **Response `200 OK`**:
  ```json
  {
    "total": 48,
    "phones": [
      {
        "id": "phone_101",
        "brand": "Apple",
        "model": "iPhone 13",
        "ram": "4GB",
        "storage": "128GB",
        "color": "Midnight Blue",
        "price": 34999,
        "mrp": 59900,
        "condition": "Like New",
        "batteryHealth": 89,
        "billBoxAvailable": true,
        "warranty": "30-Day Testing Warranty",
        "shopId": "shop_01",
        "shopName": "Sharma Telecom",
        "shopLocality": "Malviya Nagar",
        "shopDistanceKm": 1.2,
        "images": [
          "https://images.unsplash.com/photo-..."
        ],
        "isSold": false,
        "isFeatured": true,
        "viewsCount": 184,
        "leadsCount": 19,
        "createdAt": "2026-03-20T10:00:00Z"
      }
    ]
  }
  ```

#### `GET /phones/:id`
Get full device details, verified inspection tags, and shop contact information.

#### `GET /phones/compare`
Side-by-side comparison for a specific model across multiple shops in the city.
- **Query Params**: `model=iPhone%2013&storage=128GB&city=Jaipur`
- **Response `200 OK`**:
  ```json
  {
    "model": "iPhone 13 128GB",
    "lowestPrice": 33500,
    "shopsCount": 3,
    "listings": [
      { "shopId": "shop_02", "shopName": "Apex Mobile Hub", "price": 33500, "batteryHealth": 84, ... },
      { "shopId": "shop_01", "shopName": "Sharma Telecom", "price": 34999, "batteryHealth": 89, ... },
      { "shopId": "shop_04", "shopName": "City Cellular", "price": 36000, "batteryHealth": 95, ... }
    ]
  }
  ```

#### `POST /phones` (Protected: Shopkeeper Auth required)
Add a new phone listing.
- **Request Body**:
  ```json
  {
    "brand": "OnePlus",
    "model": "11R 5G",
    "ram": "16GB",
    "storage": "256GB",
    "color": "Galactic Silver",
    "price": 26500,
    "mrp": 44999,
    "condition": "Like New",
    "batteryHealth": 94,
    "billBoxAvailable": true,
    "warranty": "15-Day Shop Warranty",
    "images": ["url1", "url2"]
  }
  ```

#### `PATCH /phones/:id/sold` (Protected)
1-Tap instant inventory status toggle.
- **Request Body**: `{ "isSold": true }`

#### `PATCH /phones/:id/price` (Protected)
Quick inline price update.
- **Request Body**: `{ "price": 33999 }`

#### `DELETE /phones/:id` (Protected)
Removes a listing.

---

### D. Leads & Analytics API

#### `POST /analytics/lead`
Triggered whenever a buyer clicks **"Chat on WhatsApp"** or **"Call Shop"**.
- **Request Body**:
  ```json
  {
    "phoneId": "phone_101",
    "shopId": "shop_01",
    "channel": "whatsapp" // or "call"
  }
  ```

#### `GET /analytics/dashboard/:shopId` (Protected)
Returns shopkeeper metrics:
```json
{
  "viewsToday": 142,
  "leadsToday": 19,
  "activePhones": 14,
  "soldThisMonth": 12,
  "topViewedModels": [
    { "model": "iPhone 13", "views": 58 },
    { "model": "OnePlus 11R", "views": 34 }
  ]
}
```

---

## 💻 4. Running the Frontend Locally

### Prerequisites
- Node.js `^18.x`, `^20.x`, or `^24.x`
- npm `^10.x` or `^11.x`

### Commands
```bash
# Install dependencies
npm install

# Start local dev server (default port 4200)
npm start

# Build production bundle
npm run build
```

---

## 📱 5. Packaging into Android APK (Future Step)
```bash
# Add Capacitor Android platform
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init MobiMarket com.mobimarket.app --web-dir dist/mobi-market/browser
npx cap add android
npx cap copy
npx cap open android
```
