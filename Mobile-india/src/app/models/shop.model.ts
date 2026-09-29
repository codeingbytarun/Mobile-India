export interface Shop {
  id: string;
  name: string;
  ownerName: string;
  verified: boolean;
  rating: number;
  reviewsCount: number;
  address: string;
  locality: string;
  city: string;
  phone: string;
  whatsapp: string;
  image: string;
  openHours: string;
  distanceKm: number;
  activeListingsCount: number;
  lat: number;
  lng: number;
  slug: string;
  googleMapsUrl?: string;
}
