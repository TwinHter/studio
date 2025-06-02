export type PropertyType = 'Flat' | 'Detached' | 'Terraced' | 'Semi-detached' | 'Bungalow' | 'Maisonette';
export type EnergyRating = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
export type Tenure = 'Freehold' | 'Leasehold';

export type Property = {
  id: string;
  name: string;
  address: string;
  price: number;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  receptionRooms: number;
  area?: number; // Square meters
  energyRating: EnergyRating;
  tenure: Tenure;
  region: string; // outcode like E1
  image: string;
  description: string;
  dataAiHint?: string;
};

export const sampleProperties: Property[] = [
  { id: '1', name: 'Charming Victorian Terrace in E1', address: '12 Willow Lane, Whitechapel, E1', price: 720000, type: 'Terraced', bedrooms: 3, bathrooms: 1, receptionRooms: 2, area: 120, energyRating: 'D', tenure: 'Freehold', region: 'E1', image: 'https://placehold.co/600x400.png', description: 'A beautiful terraced house in the heart of E1, retaining many original features, close to amenities and transport links.', dataAiHint: 'victorian house' },
  { id: '2', name: 'Modern 2-Bed Flat, City Views', address: 'Apt 15, Skyline Apartments, Westminster, SW1', price: 1800000, type: 'Flat', bedrooms: 2, bathrooms: 2, receptionRooms: 1, area: 100, energyRating: 'B', tenure: 'Leasehold', region: 'SW1', image: 'https://placehold.co/600x400.png', description: 'Luxury flat in a prestigious SW1 development, offering stunning panoramic city views and concierge service.', dataAiHint: 'modern apartment' },
  { id: '3', name: 'Spacious Detached Family Home', address: 'Oakwood House, Barnsbury, N1', price: 1200000, type: 'Detached', bedrooms: 4, bathrooms: 2, receptionRooms: 3, area: 180, energyRating: 'C', tenure: 'Freehold', region: 'N1', image: 'https://placehold.co/600x400.png', description: 'Perfect for families, this detached N1 home boasts a large garden, off-street parking, and proximity to excellent schools.', dataAiHint: 'family home suburb' },
  { id: '4', name: 'Cosy Semi-Detached Cottage', address: 'Rose Cottage, Bermondsey Street, SE1', price: 650000, type: 'Semi-detached', bedrooms: 2, bathrooms: 1, receptionRooms: 1, area: 85, energyRating: 'E', tenure: 'Freehold', region: 'SE1', image: 'https://placehold.co/600x400.png', description: 'A charming and characterful semi-detached cottage in a sought-after SE1 location, with a private garden and period features.', dataAiHint: 'cottage garden' },
  { id: '5', name: 'Affordable Starter Flat in Ilford', address: '2B, Union Court, Ilford, IG1', price: 320000, type: 'Flat', bedrooms: 1, bathrooms: 1, receptionRooms: 1, area: 50, energyRating: 'C', tenure: 'Leasehold', region: 'IG1', image: 'https://placehold.co/600x400.png', description: 'An ideal first-time buy or investment property in IG1, offering great value, modern interiors, and excellent transport links.', dataAiHint: 'starter flat building' },
  { id: '6', name: 'Large Detached House, Croydon', address: 'The Beeches, Addiscombe Road, CR0', price: 950000, type: 'Detached', bedrooms: 5, bathrooms: 3, receptionRooms: 3, area: 250, energyRating: 'D', tenure: 'Freehold', region: 'CR0', image: 'https://placehold.co/600x400.png', description: 'An expansive detached residence in CR0 with modern amenities, multiple reception rooms, a large driveway, and a substantial garden.', dataAiHint: 'luxury house driveway' },
  { id: '7', name: 'Stylish Apartment in Mayfair', address: 'Park Lane Chambers, Mayfair, W1', price: 3500000, type: 'Flat', bedrooms: 3, bathrooms: 3, receptionRooms: 2, area: 150, energyRating: 'B', tenure: 'Leasehold', region: 'W1', image: 'https://placehold.co/600x400.png', description: 'An exquisitely designed apartment in W1, offering the pinnacle of luxury living, high-end finishes, and porterage in central London.', dataAiHint: 'luxury apartment interior' },
  { id: '8', name: 'Riverside Flat with Balcony', address: 'Tower Bridge Wharf, SE1', price: 850000, type: 'Flat', bedrooms: 2, bathrooms: 2, receptionRooms: 1, area: 90, energyRating: 'B', tenure: 'Leasehold', region: 'SE1', image: 'https://placehold.co/600x400.png', description: 'A stunning riverside apartment in SE1 with a private balcony overlooking the Thames, secure parking, and residents\' gym.', dataAiHint: 'riverside apartment balcony' },
];

export const propertyTypeOptions: PropertyType[] = ['Flat', 'Detached', 'Terraced', 'Semi-detached', 'Bungalow', 'Maisonette'];
export const energyRatingOptions: EnergyRating[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
export const tenureOptions: Tenure[] = ['Freehold', 'Leasehold'];

export const bedroomOptions = [1, 2, 3, 4, 5, 6]; // Added 6 for more range
export const bathroomOptions = [1, 2, 3, 4, 5];
export const receptionOptions = [1, 2, 3, 4];

export const regionOptions = Array.from(new Set(sampleProperties.map(p => p.region))).sort();
