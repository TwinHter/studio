
'use server'; 

import type { PredictionInput, PredictionOutput } from '@/ai/flows/price-prediction';
import type { RegionPriceInsightsInput, RegionPriceInsightsOutput } from '@/ai/flows/region-insights';
import type { Property, SalesmanInfo } from '@/types'; // General types
import { sampleProperties } from '@/lib/data/properties_data';
import { DEFAULT_SALESMAN_INFO, PLACEHOLDER_HINTS } from '@/lib/constants';

import { predictPrice as predictPriceFlow } from '@/ai/flows/price-prediction';
import { getRegionPriceInsights as getRegionPriceInsightsFlow } from '@/ai/flows/region-insights';

const apiDelay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

export const fetchPricePrediction = async (data: PredictionInput): Promise<PredictionOutput> => {
  await apiDelay(1200);
  const result = await predictPriceFlow(data);
  return result;
};

export const fetchRegionInsights = async (data: RegionPriceInsightsInput): Promise<RegionPriceInsightsOutput> => {
  await apiDelay(700);
  const result = await getRegionPriceInsightsFlow(data);
  return result;
};

export const fetchPropertyDetails = async (propertyId: string): Promise<Property | undefined> => {
  await apiDelay(300);
  const property = sampleProperties.find(p => p.id === propertyId);
  return property;
};

export const fetchSalesmanInfo = async (propertyId: string): Promise<SalesmanInfo> => {
  await apiDelay(400);
  // Return generic fake salesman info, could be varied by propertyId if needed in a real API
  // For now, using a slightly more dynamic placeholder based on a constant
  return {
    ...DEFAULT_SALESMAN_INFO, // Spread defaults
    name: "Emily Carter", // Specific example name
    email: "emily.carter@londondwellings.ai",
    phone: "+44 20 1234 5678",
    bio: "Your dedicated London property expert, specializing in matching clients with their ideal homes and investments. With years of experience in the London market, Emily provides personalized service and in-depth local knowledge.",
    imageUrl: `https://placehold.co/150x150.png`,
    dataAiHint: PLACEHOLDER_HINTS.salesmanPortrait
  };
};
