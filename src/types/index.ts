
// Basic Property Types
export type PropertyType = 'Flat' | 'Detached' | 'Terraced' | 'Semi-detached' | 'Bungalow' | 'Maisonette';
export type EnergyRating = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
export type Tenure = 'Freehold' | 'Leasehold';

// Main Data Structures
export interface Property {
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
}

export interface OutcodeData {
  id: string;
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
  regionId: string;
  regionName: string;
  quarterlyPriceHistory: QuarterlyPricePoint[];
  currentAveragePrice: number;
  priceRank: string; // e.g., "Rank: 5 of 50" or "Top 10%"
}

// Note: AI Flow specific Input/Output types (PredictionInput, PredictionOutput, etc.)
// will continue to be defined and exported from their respective flow files (e.g., src/ai/flows/price-prediction.ts)
// as they are directly inferred from Zod schemas. Components should import them from there.

