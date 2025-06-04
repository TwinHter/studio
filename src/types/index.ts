
// Basic Property Types
export type PropertyType = 'Flat' | 'Detached' | 'Terraced' | 'Semi-detached' | 'Bungalow' | 'Maisonette';
export type EnergyRating = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
export type Tenure = 'Freehold' | 'Leasehold';

// Main Data Structures
export interface Property {
  id: string;
  name: string;
  fullAddress: string; // Renamed from address
  price: number;
  propertyType: PropertyType; // Renamed from type
  bedrooms: number;
  bathrooms: number;
  livingRooms: number; // Renamed from receptionRooms
  floorAreaSqM?: number; // Renamed from area
  currentEnergyRating: EnergyRating; // Renamed from energyRating
  tenure: Tenure;
  outcode: string; // Renamed from region
  image: string;
  description: string;
  dataAiHint?: string;
  longitude?: number;
  latitude?: number;
  sale_month: number; // Ensured presence
  sale_year: number; // Ensured presence
}

export interface OutcodeData {
  id: string; // This is the outcode
  name: string;
  avgPrice: number;
  priceCategory: 'low' | 'medium' | 'high';
  description: string;
}

export interface SalesmanInfo {
  name: string;
  email: string;
  phone: string;
  bio: string;
  imageUrl?: string;
  dataAiHint?: string;
}

export interface QuarterlyPricePoint {
  quarter: string; // e.g., "Q1 2023"
  price: number;
}

export interface RegionMarketData {
  regionId: string; // This is the outcode
  regionName: string;
  quarterlyPriceHistory: QuarterlyPricePoint[];
  currentAveragePrice: number;
  priceRank: string; // e.g., "Rank: 5 of 50" or "Top 10%"
}

// Note: AI Flow specific Input/Output types (PredictionInput, PredictionOutput, etc.)
// will continue to be defined and exported from their respective flow files (e.g., src/ai/flows/price-prediction.ts)
// as they are directly inferred from Zod schemas. Components should import them from there.

