
'use server'; 

import type { PredictionInput, PredictionOutput } from '@/ai/flows/price-prediction';
import type { RegionPriceInsightsInput, RegionPriceInsightsOutput } from '@/ai/flows/region-insights';
import type { Property, SalesmanInfo } from '@/types'; // General types
import { sampleProperties as initialProperties } from '@/lib/data/properties_data';
import { DEFAULT_SALESMAN_INFO, PLACEHOLDER_HINTS } from '@/lib/constants';

// These functions call the actual Genkit flows
import { predictPrice as predictPriceFlow } from '@/ai/flows/price-prediction';
import { getRegionPriceInsights as getRegionPriceInsightsFlow } from '@/ai/flows/region-insights';

// Import fake data for hook-specific service functions
import fakePredictionData from '@/lib/data/fake_prediction_output.json';
import fakeRegionInsightsData from '@/lib/data/fake_region_insights.json';

// --- Original Service Functions (Potentially for real backend/Genkit calls) ---

export const fetchPricePrediction = async (data: PredictionInput): Promise<PredictionOutput> => {
  // This function still calls the Genkit flow as per original setup
  const result = await predictPriceFlow(data);
  return result;
};

export const fetchRegionInsights = async (data: RegionPriceInsightsInput): Promise<RegionPriceInsightsOutput> => {
  // This function still calls the Genkit flow
  const result = await getRegionPriceInsightsFlow(data);
  return result;
};

export const fetchPropertyDetails = async (propertyId: string): Promise<Property | undefined> => {
  const property = initialProperties.find(p => p.id === propertyId);
  return property;
};

export const fetchSalesmanInfo = async (propertyId: string): Promise<SalesmanInfo> => {
  return {
    ...DEFAULT_SALESMAN_INFO,
    name: "Emily Carter",
    email: "emily.carter@londondwellings.ai",
    phone: "+44 20 1234 5678",
    bio: "Your dedicated London property expert, specializing in matching clients with their ideal homes and investments. With years of experience in the London market, Emily provides personalized service and in-depth local knowledge.",
    imageUrl: `https://placehold.co/150x150.png`,
    dataAiHint: PLACEHOLDER_HINTS.salesmanPortrait
  };
};

// --- New Service Functions for Hooks (Using Fake JSON Data) ---

export const fetchFakePredictionForHook = async (input: PredictionInput): Promise<PredictionOutput> => {
  // Simulate some variation based on input, e.g. area
  const basePrice = fakePredictionData.predictedPrice;
  const areaModifier = input.area ? (input.area / 100) * 50000 : 0;
  const finalPredictedPrice = Math.round((basePrice + areaModifier) / 1000) * 1000;
  
  return {
    ...fakePredictionData,
    predictedPrice: finalPredictedPrice,
    averageAreaPrice: Math.round((finalPredictedPrice * 0.95) / 1000) * 1000,
    // You could make priceHistoryChartData dynamic based on input too if needed
  };
};

export const fetchFakePropertiesForHook = async (): Promise<Property[]> => {
  return [...initialProperties]; // Return a copy
};

export const addFakePropertyForHook = async (propertyData: Omit<Property, 'id' | 'image'> & { image: string }): Promise<Property> => {
  const newProperty: Property = {
    ...propertyData,
    id: Date.now().toString(), // Generate a unique ID
    // Image is already a data URL string passed in propertyData
  };
  // In a real scenario, this would interact with a backend.
  // For now, we just return the new property. The hook will manage the state.
  return newProperty;
};

export const fetchFakeRegionInsightsForHook = async (input: RegionPriceInsightsInput): Promise<RegionPriceInsightsOutput> => {
  const regionKey = input.region as keyof typeof fakeRegionInsightsData;
  const insight = fakeRegionInsightsData[regionKey] || fakeRegionInsightsData['DEFAULT'];
  return insight;
};

