# MobiMarket — Complete Backend REST API Documentation & Specification

> **Version:** 1.0.0  
> **Environment:** Staging / Production  
> **Base URL:** `https://api.mobimarket.in/api/v1` (Local Dev: `http://localhost:3000/api/v1`)  
> **Protocol:** HTTPS / JSON REST  
> **Frontend Target:** Angular 19 (`Mobile-india`)

---

## 📑 Table of Contents

1. [Executive Summary & Total API Inventory](#1-executive-summary--total-api-inventory)
2. [Global Architecture & API Standards](#2-global-architecture--api-standards)
3. [Database Schema & Entity Relationships](#3-database-schema--entity-relationships)
4. [Module 1: Authentication & Authorization (7 APIs)](#module-1-authentication--authorization-7-apis)
5. [Module 2: Shops & Digital Storefronts (7 APIs)](#module-2-shops--digital-storefronts-7-apis)
6. [Module 3: Phone Listings & Inventory Management (10 APIs)](#module-3-phone-listings--inventory-management-10-apis)
7. [Module 4: Buyer Cart & Device Reservations (5 APIs)](#module-4-buyer-cart--device-reservations-5-apis)
8. [Module 5: Leads & WhatsApp Inquiries (4 APIs)](#module-5-leads--whatsapp-inquiries-4-apis)
9. [Module 6: Analytics & Merchant Dashboard (3 APIs)](#module-6-analytics--merchant-dashboard-3-apis)
10. [Module 7: Media & Cloud Image Uploads (2 APIs)](#module-7-media--cloud-image-uploads-2-apis)
11. [Module 8: Master Data, Geo & Catalog (3 APIs)](#module-8-master-data-geo--catalog-3-apis)
12. [Module 9: Admin, KYC & Platform Moderation (4 APIs)](#module-9-admin-kyc--platform-moderation-4-apis)
13. [Frontend Integration Guide (Angular 19 Service Migration)](#13-frontend-integration-guide)

---

## 1. Executive Summary & Total API Inventory

To transform the MobiMarket frontend from its current mock-state into a production-grade commercial platform, **a total of 45 REST API endpoints** are defined across **9 functional modules**.

### 📊 API Breakdown by Implementation Tier

| Tier | Scope | Total Endpoints | Priority | Description |
| :--- | :--- | :---: | :---: | :--- |
| **Tier 1: Core MVP** | Essential Frontend Flow | **14 Endpoints** | 🔴 **Immediate** | Replaces mock data in `marketplace.service.ts` (Login, Browse, Filter, Detail, Add Phone, Lead Record, Cart). |
| **Tier 2: Production Commerce** | Full Merchant & Buyer Ops | **18 Endpoints** | 🟡 **Phase 2** | Image uploads, Shop Storefront management, OTP verification, Shop reviews, Lead status tracking. |
| **Tier 3: Platform & Admin** | Scale, KYC & Master Catalog | **13 Endpoints** | 🟢 **Phase 3** | KYC verification of physical shops, Admin moderation dashboard, Master cities/brands lookup. |
| **TOTAL** | **Entire Ecosystem** | **45 Endpoints** | — | **100% full coverage of all web & future mobile app capabilities.** |

---

## 2. Global Architecture & API Standards

### 2.1 Standard JSON Response Envelope

All API responses follow a uniform JSON envelope structure:

#### Success Response
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

#### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "error": "BAD_REQUEST",
  "message": "Validation failed: 'price' must be a positive number",
  "timestamp": "2026-03-29T18:00:00.000Z",
  "path": "/api/v1/phones"
}
```

### 2.2 Standard HTTP Status Codes

| Code | Status | Usage in MobiMarket |
| :--- | :--- | :--- |
| `200` | **OK** | Standard successful response for `GET`, `PUT`, `PATCH`. |
| `201` | **Created** | Successful resource creation (`POST /phones`, `POST /shops/register`). |
| `204` | **No Content** | Successful deletion with no body returned (`DELETE`). |
| `400` | **Bad Request** | Missing required fields or payload validation error. |
| `401` | **Unauthorized** | Missing or expired JWT bearer token. |
| `403` | **Forbidden** | User does not have ownership or required role (`shopkeeper` vs `admin`). |
| `404` | **Not Found** | Phone listing or shop ID does not exist. |
| `409` | **Conflict** | Duplicate registration (e.g., phone number already exists). |
| `429` | **Too Many Requests** | Rate limit exceeded (e.g., OTP dispatch throttling). |
| `500` | **Internal Server Error** | Unhandled server exception. |

### 2.3 Authentication & Authorization

- **Scheme:** Bearer Token via HTTP Header: `Authorization: Bearer <jwt_access_token>`
- **Token Format:** Signed JWT containing `{ sub: userId, role: 'buyer' | 'shopkeeper' | 'admin', shopId?: string }`
- **Expiry:** Access token (2 hours), Refresh token (30 days in HTTP-only cookie).

---

## 3. Database Schema & Entity Relationships

```
┌──────────────────┐          ┌───────────────────────┐          ┌───────────────────┐
│     Users        │ 1      1 │        Shops          │ 1      N │   PhoneListings   │
│──────────────────│──────────│───────────────────────│──────────│───────────────────│
│ id (PK)          │          │ id (PK)               │          │ id (PK)           │
│ phone (Unique)   │          │ userId (FK -> Users)  │          │ shopId (FK->Shops)│
│ name             │          │ name                  │          │ brand             │
│ role             │          │ slug (Unique)         │          │ model             │
│ isPhoneVerified  │          │ address, locality     │          │ price, mrp        │
│ createdAt        │          │ city, lat, lng        │          │ condition         │
└────────┬─────────┘          │ verified (Boolean)    │          │ batteryHealth     │
         │                    │ rating, reviewsCount  │          │ billBoxAvailable  │
         │ 1                  └───────────┬───────────┘          │ warranty          │
         │                                │ 1                    │ isSold (Boolean)  │
         │ N                              │                      │ viewsCount        │
┌────────▼─────────┐                      │ N                    │ leadsCount        │
│    CartItems     │             ┌────────▼──────────┐           └─────────┬─────────┘
│──────────────────│             │    ShopReviews    │                     │ 1
│ id (PK)          │             │───────────────────│                     │
│ buyerId (FK)     │             │ id (PK)           │                     │ N
│ phoneId (FK)     │             │ shopId (FK)       │           ┌─────────▼─────────┐
│ createdAt        │             │ buyerId (FK)      │           │       Leads       │
└──────────────────┘             │ rating (1-5)      │           │───────────────────│
                                 │ comment           │           │ id (PK)           │
                                 │ createdAt         │           │ phoneId (FK)      │
                                 └───────────────────┘           │ shopId (FK)       │
                                                                 │ buyerName, phone  │
                                                                 │ channel (wa/call) │
                                                                 │ status, createdAt │
                                                                 └───────────────────┘
```

---

## Module 1: Authentication & Authorization (7 APIs)

### 1.1 `POST /auth/send-otp`
Sends an SMS or WhatsApp OTP to the user's mobile number.

- **Access:** Public
- **Rate Limit:** 3 requests per phone per 10 minutes
- **Request Body:**
  ```json
  {
    "phone": "9829012345",
    "channel": "sms" // "sms" or "whatsapp"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "6-digit OTP sent successfully to +91 9829012345",
    "data": {
      "sessionId": "otp_sess_9a8f23bc11"
    }
  }
  ```

---

### 1.2 `POST /auth/verify-otp`
Validates the OTP code, logs the user in (or registers a buyer automatically), and issues JWT tokens.

- **Access:** Public
- **Request Body:**
  ```json
  {
    "phone": "9829012345",
    "otp": "482910",
    "sessionId": "otp_sess_9a8f23bc11",
    "roleHint": "buyer", // "buyer" | "shopkeeper"
    "name": "Tarun Baliyan" // required if first time buyer
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "refreshToken": "ref_904df8...",
      "user": {
        "id": "usr_9921",
        "name": "Tarun Baliyan",
        "phone": "9829012345",
        "role": "buyer",
        "shopId": null
      }
    }
  }
  ```

---

### 1.3 `POST /auth/register-shopkeeper`
Dedicated endpoint to onboard a physical shop owner with full store details in one atomic transaction.

- **Access:** Public (or authenticated buyer upgrading to shopkeeper)
- **Request Body:**
  ```json
  {
    "ownerName": "Rajesh Sharma",
    "phone": "9829012345",
    "whatsapp": "9829012345",
    "shopName": "Sharma Telecom",
    "address": "Shop 14, Main Market, Malviya Nagar",
    "locality": "Malviya Nagar",
    "city": "Jaipur",
    "openHours": "10:00 AM - 9:30 PM",
    "image": "https://images.unsplash.com/photo-1598327105666-5b89351aff97",
    "googleMapsUrl": "https://maps.google.com/?q=Sharma+Telecom+Malviya+Nagar+Jaipur"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Shop registered successfully. Pending physical verification.",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "shop": {
        "id": "shop_01",
        "slug": "sharma-telecom",
        "name": "Sharma Telecom",
        "ownerName": "Rajesh Sharma",
        "verified": false,
        "rating": 5.0,
        "reviewsCount": 0
      }
    }
  }
  ```

---

### 1.4 `GET /auth/me`
Retrieves current profile and active session using bearer token.

- **Access:** Authenticated (`Bearer <token>`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "usr_102",
      "name": "Rajesh Sharma",
      "phone": "9829012345",
      "role": "shopkeeper",
      "shop": {
        "id": "shop_01",
        "name": "Sharma Telecom",
        "verified": true,
        "activeListingsCount": 6
      }
    }
  }
  ```

---

### 1.5 `POST /auth/refresh-token`
Exchanges a valid refresh token for a fresh access token.

- **Access:** Public
- **Request Body:**
  ```json
  {
    "refreshToken": "ref_904df8..."
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsIn..."
    }
  }
  ```

---

### 1.6 `POST /auth/logout`
Invalidates session and revokes refresh token.

- **Access:** Authenticated
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

---

### 1.7 `POST /auth/resend-otp`
Re-dispatches OTP if previous one timed out or was not delivered.

- **Access:** Public
- **Request Body:**
  ```json
  {
    "sessionId": "otp_sess_9a8f23bc11"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "OTP re-sent successfully"
  }
  ```

---

## Module 2: Shops & Digital Storefronts (7 APIs)

### 2.1 `GET /shops`
Lists registered mobile shops in the selected city with filtering, geo-sorting, and search.

- **Access:** Public
- **Query Parameters:**
  - `city` (string, required, e.g. `Jaipur`)
  - `locality` (string, optional, e.g. `Malviya Nagar`)
  - `verifiedOnly` (boolean, optional, default: `false`)
  - `userLat` & `userLng` (floats, optional, for calculating `distanceKm`)
  - `limit` (integer, default: `20`)
  - `page` (integer, default: `1`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
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
        "phone": "9829012345",
        "whatsapp": "919829012345",
        "image": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600",
        "openHours": "10:00 AM - 9:30 PM",
        "distanceKm": 1.2,
        "activeListingsCount": 5,
        "lat": 26.8530,
        "lng": 75.8050,
        "slug": "sharma-telecom",
        "googleMapsUrl": "https://maps.google.com/?q=Sharma+Telecom+Malviya+Nagar+Jaipur"
      }
    ]
  }
  ```

---

### 2.2 `GET /shops/:idOrSlug`
Retrieves full shop storefront profile and its live device inventory. Used by the shop catalog route `/shop/:id`.

- **Access:** Public
- **Path Parameters:**
  - `idOrSlug` (`shop_01` or `sharma-telecom`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "shop": {
        "id": "shop_01",
        "name": "Sharma Telecom",
        "ownerName": "Rajesh Sharma",
        "verified": true,
        "rating": 4.9,
        "reviewsCount": 142,
        "address": "Shop 14, Main Market, Malviya Nagar",
        "locality": "Malviya Nagar",
        "city": "Jaipur",
        "phone": "9829012345",
        "whatsapp": "919829012345",
        "image": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600",
        "openHours": "10:00 AM - 9:30 PM",
        "googleMapsUrl": "https://maps.google.com/?q=Sharma+Telecom"
      },
      "inventory": [
        {
          "id": "ph_01",
          "brand": "Apple",
          "model": "iPhone 13",
          "storage": "128GB",
          "price": 34999,
          "condition": "Like New",
          "isSold": false
        }
      ]
    }
  }
  ```

---

### 2.3 `PUT /shops/:id`
Updates storefront details, business hours, and contact details.

- **Access:** Protected (`shopkeeper` owner of this shop ID)
- **Request Body:**
  ```json
  {
    "name": "Sharma Telecom & Mobile Care",
    "openHours": "09:30 AM - 10:00 PM",
    "address": "Shop 14-B, Main Market, Malviya Nagar",
    "googleMapsUrl": "https://maps.google.com/?q=Sharma+Telecom+Jaipur",
    "image": "https://cloudinary.com/new-shop-facade.jpg"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Shop profile updated successfully",
    "data": { ...updatedShop }
  }
  ```

---

### 2.4 `GET /shops/:id/qr`
Generates an on-demand high-resolution SVG/PNG QR Code pointing directly to the shop's shareable web catalog (`mobimarket.in/shop/<slug>`).

- **Access:** Public
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "qrCodeDataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
      "catalogUrl": "https://mobimarket.in/shop/sharma-telecom"
    }
  }
  ```

---

### 2.5 `GET /shops/:id/reviews`
Retrieves paginated customer reviews and ratings for a shop.

- **Access:** Public
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "rev_01",
        "buyerName": "Amit Meena",
        "rating": 5,
        "comment": "Genuine shop! Tested iPhone 13 before buying, got physical GST bill and 30-day warranty.",
        "createdAt": "2026-03-24T12:00:00.000Z"
      }
    ]
  }
  ```

---

### 2.6 `POST /shops/:id/reviews`
Submits a rating and testimonial for a shop.

- **Access:** Protected (Authenticated Buyer)
- **Request Body:**
  ```json
  {
    "rating": 5,
    "comment": "Super clean device, exactly as shown on MobiMarket!"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Thank you for reviewing Sharma Telecom!"
  }
  ```

---

### 2.7 `GET /shops/check-slug/:slug`
Validates whether a custom store URL slug is available.

- **Access:** Public
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "isAvailable": true
  }
  ```

---

## Module 3: Phone Listings & Inventory Management (10 APIs)

### 3.1 `GET /phones`
Core search & multi-facet filtering endpoint powering the homepage, search bar, and filter drawer.

- **Access:** Public
- **Query Parameters:**
  - `city` (string, default: `Jaipur`)
  - `q` (string, free-text search across brand, model, color, shop name)
  - `brand` (`Apple`, `Samsung`, `OnePlus`, `Xiaomi`, `Vivo`, `Realme`, `Google`)
  - `minPrice` & `maxPrice` (numbers)
  - `condition` (`Pristine`, `Like New`, `Good`, `Fair`)
  - `storage` (`64GB`, `128GB`, `256GB`, `512GB`)
  - `maxDistanceKm` (number, default: `25`)
  - `onlyBillBox` (boolean, default: `false`)
  - `onlyWithWarranty` (boolean, default: `false`)
  - `sortBy` (`price_asc`, `price_desc`, `distance_asc`, `newest`)
  - `page` (number, default: `1`)
  - `limit` (number, default: `24`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "ph_01",
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
        "shopCity": "Jaipur",
        "shopPhone": "9829012345",
        "shopWhatsapp": "919829012345",
        "shopDistanceKm": 1.2,
        "images": [
          "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800"
        ],
        "isSold": false,
        "isFeatured": true,
        "viewsCount": 184,
        "leadsCount": 19,
        "createdAt": "2026-03-18"
      }
    ],
    "meta": {
      "total": 48,
      "page": 1,
      "limit": 24
    }
  }
  ```

---

### 3.2 `GET /phones/featured`
Returns top curated, inspected, high-demand devices for the homepage spotlight carousel.

- **Access:** Public
- **Query Parameters:** `city=Jaipur`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [ ...featuredPhones ]
  }
  ```

---

### 3.3 `GET /phones/:id`
Retrieves granular specifications, shop contact details, inspection tags, and increments the view counter.

- **Access:** Public
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "ph_01",
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
      "shopCity": "Jaipur",
      "shopPhone": "9829012345",
      "shopWhatsapp": "919829012345",
      "shopDistanceKm": 1.2,
      "images": [
        "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800",
        "https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800"
      ],
      "isSold": false,
      "viewsCount": 185,
      "leadsCount": 19,
      "createdAt": "2026-03-18"
    }
  }
  ```

---

### 3.4 `GET /phones/compare`
Compares listings of the same phone model across registered shops in the user's city sorted by lowest price.

- **Access:** Public
- **Query Parameters:** `model=iPhone 13&city=Jaipur`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "model": "iPhone 13",
      "lowestPrice": 33500,
      "highestSavings": 26400,
      "shopsCount": 3,
      "listings": [
        {
          "id": "ph_02",
          "shopName": "Apex Mobile Hub",
          "price": 33500,
          "condition": "Good",
          "batteryHealth": 84,
          "billBoxAvailable": false,
          "warranty": "15-Day Shop Warranty",
          "shopDistanceKm": 3.2
        },
        {
          "id": "ph_01",
          "shopName": "Sharma Telecom",
          "price": 34999,
          "condition": "Like New",
          "batteryHealth": 89,
          "billBoxAvailable": true,
          "warranty": "30-Day Testing Warranty",
          "shopDistanceKm": 1.2
        }
      ]
    }
  }
  ```

---

### 3.5 `POST /phones`
Creates a new phone listing in the merchant's digital inventory.

- **Access:** Protected (`shopkeeper`)
- **Request Body:**
  ```json
  {
    "brand": "OnePlus",
    "model": "11R 5G",
    "ram": "16GB",
    "storage": "256GB",
    "color": "Galactic Silver",
    "price": 26500,
    "mrp": 44999,
    "condition": "Pristine",
    "batteryHealth": 96,
    "billBoxAvailable": true,
    "warranty": "45-Day Shop Warranty",
    "images": [
      "https://cloudinary.com/mobimarket/oneplus-1.jpg"
    ]
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Listing published successfully",
    "data": {
      "id": "ph_1711739281",
      "isSold": false,
      "viewsCount": 1,
      "leadsCount": 0
    }
  }
  ```

---

### 3.6 `PUT /phones/:id`
Full update of an existing phone listing (specs, description, images).

- **Access:** Protected (`shopkeeper` owner of listing)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Listing updated successfully"
  }
  ```

---

### 3.7 `PATCH /phones/:id/price`
Instant 1-tap quick price adjustment from the Seller Dashboard table.

- **Access:** Protected (`shopkeeper` owner)
- **Request Body:**
  ```json
  {
    "price": 33999
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Price updated to ₹33,999"
  }
  ```

---

### 3.8 `PATCH /phones/:id/sold`
1-Tap instant inventory status toggle between Active (`isSold: false`) and Sold Out (`isSold: true`).

- **Access:** Protected (`shopkeeper` owner)
- **Request Body:**
  ```json
  {
    "isSold": true
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Listing marked as Sold"
  }
  ```

---

### 3.9 `PATCH /phones/:id/images`
Updates or reorders device photos.

- **Access:** Protected (`shopkeeper` owner)
- **Request Body:**
  ```json
  {
    "images": [
      "https://url1.jpg",
      "https://url2.jpg"
    ]
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Images updated"
  }
  ```

---

### 3.10 `DELETE /phones/:id`
Deletes/archives a phone listing.

- **Access:** Protected (`shopkeeper` owner)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Listing deleted successfully"
  }
  ```

---

## Module 4: Buyer Cart & Device Reservations (5 APIs)

Used by the Buyer Dashboard (`/buyer`) to manage saved devices and track potential savings.

### 4.1 `GET /buyer/cart`
Fetches full details of all phones currently in the buyer's reserved cart, including aggregate savings.

- **Access:** Protected (`buyer`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "itemsCount": 2,
      "totalPrice": 61499,
      "totalMrp": 104899,
      "totalSavings": 43400,
      "items": [
        {
          "id": "ph_01",
          "brand": "Apple",
          "model": "iPhone 13",
          "storage": "128GB",
          "price": 34999,
          "mrp": 59900,
          "shopName": "Sharma Telecom",
          "shopLocality": "Malviya Nagar",
          "shopPhone": "9829012345",
          "shopWhatsapp": "919829012345"
        }
      ]
    }
  }
  ```

---

### 4.2 `POST /buyer/cart`
Adds a phone listing to the buyer's cart.

- **Access:** Protected (`buyer`)
- **Request Body:**
  ```json
  {
    "phoneId": "ph_01"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Phone added to cart",
    "data": { "cartCount": 2 }
  }
  ```

---

### 4.3 `DELETE /buyer/cart/:phoneId`
Removes a phone listing from the buyer's cart.

- **Access:** Protected (`buyer`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Item removed from cart"
  }
  ```

---

### 4.4 `DELETE /buyer/cart`
Clears all items from the buyer's cart.

- **Access:** Protected (`buyer`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Cart cleared"
  }
  ```

---

### 4.5 `POST /buyer/cart/sync`
Synchronizes local offline cart items stored in `localStorage` into the buyer's database account upon login.

- **Access:** Protected (`buyer`)
- **Request Body:**
  ```json
  {
    "phoneIds": ["ph_01", "ph_03"]
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": { "itemsCount": 2 }
  }
  ```

---

## Module 5: Leads & WhatsApp Inquiries (4 APIs)

Tracks every buyer lead generated when a buyer clicks **"Chat on WhatsApp"** or **"Call Shop"**.

### 5.1 `POST /leads`
Records an inquiry attempt, increments listing & shop metrics, and returns the pre-formatted WhatsApp deep link.

- **Access:** Protected (`buyer`)
- **Request Body:**
  ```json
  {
    "phoneId": "ph_01",
    "channel": "whatsapp" // "whatsapp" | "call"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "leadId": "lead_9182",
      "redirectUrl": "https://wa.me/919829012345?text=Namaste%20Sharma%20Telecom!..."
    }
  }
  ```

---

### 5.2 `GET /leads/shop/:shopId`
Retrieves all customer inquiries received by a specific shop.

- **Access:** Protected (`shopkeeper` of that shop)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "lead_9182",
        "buyerName": "Tarun Baliyan",
        "buyerPhone": "9829012345",
        "phoneModel": "iPhone 13 128GB",
        "price": 34999,
        "channel": "whatsapp",
        "status": "New", // "New" | "Contacted" | "Sold" | "Lost"
        "createdAt": "2026-03-29T17:30:00.000Z"
      }
    ]
  }
  ```

---

### 5.3 `PATCH /leads/:id/status`
Updates status of an inquiry in the merchant's CRM.

- **Access:** Protected (`shopkeeper`)
- **Request Body:**
  ```json
  {
    "status": "Sold" // "New" | "Contacted" | "Visited Store" | "Sold" | "Lost"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Lead status updated"
  }
  ```

---

### 5.4 `GET /leads/buyer/my-inquiries`
Returns history of inquiries initiated by the logged-in buyer.

- **Access:** Protected (`buyer`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [ ...buyerInquiries ]
  }
  ```

---

## Module 6: Analytics & Merchant Dashboard (3 APIs)

Powers the KPI dashboard on `/seller`.

### 6.1 `GET /analytics/dashboard/:shopId`
Returns real-time shop performance indicators.

- **Access:** Protected (`shopkeeper`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "viewsToday": 184,
      "viewsTotal": 1420,
      "leadsToday": 19,
      "leadsTotal": 86,
      "activeInventoryCount": 6,
      "soldCount": 4,
      "totalInventoryValue": 194500,
      "conversionRatePercent": 10.3
    }
  }
  ```

---

### 6.2 `GET /analytics/top-models/:shopId`
Top viewed and most inquired device models for inventory planning.

- **Access:** Protected (`shopkeeper`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      { "model": "iPhone 13", "views": 310, "leads": 38 },
      { "model": "OnePlus 11R 5G", "views": 142, "leads": 16 },
      { "model": "Samsung Galaxy S23", "views": 95, "leads": 11 }
    ]
  }
  ```

---

### 6.3 `GET /analytics/trends/:shopId`
Daily timeseries chart data of views and leads over the past 30 days.

- **Access:** Protected (`shopkeeper`)
- **Query Parameters:** `days=30`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      { "date": "2026-03-28", "views": 120, "leads": 14 },
      { "date": "2026-03-29", "views": 184, "leads": 19 }
    ]
  }
  ```

---

## Module 7: Media & Cloud Image Uploads (2 APIs)

Handles multi-image device photos and storefront banner uploads.

### 7.1 `POST /media/upload`
Uploads raw image files (JPEG, PNG, WebP) to cloud storage (Cloudinary / AWS S3 / Supabase) and returns CDN URLs.

- **Access:** Protected (`shopkeeper`)
- **Content-Type:** `multipart/form-data`
- **Request Body:** Form-data with key `file` (single or multiple)
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "url": "https://cdn.mobimarket.in/uploads/phones/ph_1711_01.webp",
      "thumbnailUrl": "https://cdn.mobimarket.in/uploads/phones/thumb_ph_1711_01.webp",
      "width": 1200,
      "height": 900,
      "format": "webp",
      "bytes": 142800
    }
  }
  ```

---

### 7.2 `DELETE /media`
Deletes an uploaded asset from cloud storage.

- **Access:** Protected (`shopkeeper` or `admin`)
- **Request Body:**
  ```json
  {
    "url": "https://cdn.mobimarket.in/uploads/phones/ph_1711_01.webp"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "File deleted"
  }
  ```

---

## Module 8: Master Data, Geo & Catalog (3 APIs)

### 8.1 `GET /meta/cities`
Returns all supported Indian cities along with their verified localities and bounding coordinates.

- **Access:** Public
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "name": "Jaipur",
        "state": "Rajasthan",
        "centerLat": 26.9124,
        "centerLng": 75.7873,
        "localities": [
          "Malviya Nagar",
          "Raja Park",
          "Mansarovar",
          "Vaishali Nagar",
          "C-Scheme",
          "Tonk Road"
        ]
      },
      {
        "name": "Delhi NCR",
        "state": "Delhi",
        "centerLat": 28.6139,
        "centerLng": 77.2090,
        "localities": ["Nehru Place", "Karol Bagh", "Lajpat Nagar", "Noida", "Gurugram"]
      },
      {
        "name": "Mumbai",
        "state": "Maharashtra",
        "centerLat": 19.0760,
        "centerLng": 72.8777,
        "localities": ["Lamington Road", "Bandra", "Andheri", "Thane"]
      },
      {
        "name": "Bengaluru",
        "state": "Karnataka",
        "centerLat": 12.9716,
        "centerLng": 77.5946,
        "localities": ["SP Road", "Koramangala", "Indiranagar", "HSR Layout"]
      }
    ]
  }
  ```

---

### 8.2 `GET /meta/brands`
Returns master list of smartphone manufacturers and popular models for autocomplete and filtering.

- **Access:** Public
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "brand": "Apple",
        "models": ["iPhone 15 Pro Max", "iPhone 15", "iPhone 14 Pro", "iPhone 14", "iPhone 13", "iPhone 12", "iPhone 11"]
      },
      {
        "brand": "Samsung",
        "models": ["Galaxy S24 Ultra", "Galaxy S23", "Galaxy S21 FE", "Galaxy A54", "Galaxy Z Flip 5"]
      },
      {
        "brand": "OnePlus",
        "models": ["OnePlus 12", "OnePlus 11R 5G", "OnePlus 10T", "OnePlus Nord CE 3"]
      }
    ]
  }
  ```

---

### 8.3 `GET /meta/price-estimator`
Fair-market valuation algorithm calculating estimated resale prices based on model, age, condition, and battery health.

- **Access:** Public
- **Query Parameters:** `model=iPhone 13&storage=128GB&condition=Like New&batteryHealth=89`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "model": "Apple iPhone 13 (128GB)",
      "estimatedMin": 33000,
      "estimatedMax": 36000,
      "averageMarketPrice": 34500,
      "suggestedListPrice": 34999
    }
  }
  ```

---

## Module 9: Admin, KYC & Platform Moderation (4 APIs)

### 9.1 `GET /admin/shops/pending`
Lists new shopkeeper registrations awaiting physical store verification.

- **Access:** Protected (`admin`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [ ...pendingShops ]
  }
  ```

---

### 9.2 `PATCH /admin/shops/:id/verify`
Marks a physical shop as verified (enabling the blue verified badge on all its listings).

- **Access:** Protected (`admin`)
- **Request Body:**
  ```json
  {
    "verified": true,
    "notes": "Storefront inspected physically. GSTIN verified."
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Shop verified successfully"
  }
  ```

---

### 9.3 `GET /admin/stats`
Platform-wide high-level metrics.

- **Access:** Protected (`admin`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "totalRegisteredShops": 42,
      "verifiedShops": 38,
      "activeListings": 284,
      "totalLeadsGenerated": 1820,
      "estimatedGmv": 9845000
    }
  }
  ```

---

### 9.4 `PATCH /admin/listings/:id/flag`
Allows admin or moderators to flag, hide, or remove suspicious listings.

- **Access:** Protected (`admin`)
- **Request Body:**
  ```json
  {
    "action": "hide", // "hide" | "restore" | "delete"
    "reason": "Suspicious IMEI or duplicate serial number"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Listing status updated"
  }
  ```

---

## 13. Frontend Integration Guide

To connect the Angular 19 frontend to your new backend API, update `src/app/services/marketplace.service.ts`:

### 13.1 Add `provideHttpClient()` to `app.config.ts`:
```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch())
  ]
};
```

### 13.2 Inject `HttpClient` in `MarketplaceService`:
```typescript
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

export class MarketplaceService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'https://api.mobimarket.in/api/v1';

  loadPhones() {
    this.http.get<ApiResponse<PhoneListing[]>>(`${this.apiUrl}/phones`, {
      params: { city: this.currentCity() }
    }).subscribe(res => {
      if (res.success) {
        this.phones.set(res.data);
      }
    });
  }
}
```

---

## 📌 Summary Checklist for Backend Developers

- [ ] Setup Node.js / Express or NestJS or FastAPI server.
- [ ] Connect PostgreSQL or MongoDB database with provided schemas.
- [ ] Implement SMS/WhatsApp OTP service (Twilio, MSG91, or Fast2SMS).
- [ ] Integrate Cloudinary or AWS S3 bucket for phone photos.
- [ ] Set up JWT authentication middleware with role-based checks (`buyer`, `shopkeeper`, `admin`).
- [ ] Enable CORS for `http://localhost:4200` and `https://mobimarket.in`.
- [ ] Run test suite against this specification.
