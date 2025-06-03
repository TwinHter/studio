
'use server'; // Can be used if these functions are called from Server Components or Actions, but React Query hooks are client-side.

// For client-side React Query, we don't strictly need 'use server' here,
// as these functions will be imported and used by client components.
// However, the Genkit flows themselves are marked 'use server'.

import type { PredictionInput, PredictionOutput } from '@/ai/flows/price-prediction';
import type { RegionPriceInsightsInput, RegionPriceInsightsOutput } from '@/ai/flows/region-insights';
import type { Property } from '@/lib/data/properties_data';
import { sampleProperties } from '@/lib/data/properties_data';
import type { SalesmanInfo } from '@/types'; // Assuming types are in src/types/index.ts

// Re-importing the Genkit flows. In a real scenario with a separate backend,
// you would use axios.post() to an API endpoint that then calls these flows.
// Since Genkit flows can be called directly from server-side or RSC context,
// and for this "fake API" setup with React Query, we simulate the API call.
import { predictPrice as predictPriceFlow } from '@/ai/flows/price-prediction';
import { getRegionPriceInsights as getRegionPriceInsightsFlow } from '@/ai/flows/region-insights';

// Simulating API latency
const apiDelay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

export const fetchPricePrediction = async (data: PredictionInput): Promise<PredictionOutput> => {
  // console.log('API Service: Simulating fetching price prediction for', data.fullAddress);
  await apiDelay(1200); // Simulate network delay
  // This directly calls the (already faked) Genkit flow
  const result = await predictPriceFlow(data);
  // console.log('API Service: Received prediction result:', result);
  return result;
};

export const fetchRegionInsights = async (data: RegionPriceInsightsInput): Promise<RegionPriceInsightsOutput> => {
  // console.log('API Service: Simulating fetching region insights for', data.region);
  await apiDelay(700);
  const result = await getRegionPriceInsightsFlow(data);
  // console.log('API Service: Received region insights:', result);
  return result;
};

export const fetchPropertyDetails = async (propertyId: string): Promise<Property | undefined> => {
  // console.log('API Service: Simulating fetching property details for ID:', propertyId);
  await apiDelay(300);
  const property = sampleProperties.find(p => p.id === propertyId);
  if (!property) {
    // In a real API, you might throw an error or return a specific not-found response
    // For React Query, returning undefined is fine and can be handled in the component
    // console.warn('API Service: Property not found for ID:', propertyId);
  }
  return property;
};

export const fetchSalesmanInfo = async (propertyId: string): Promise<SalesmanInfo> => {
  // console.log('API Service: Simulating fetching salesman info for property ID:', propertyId);
  await apiDelay(400);
  // Return generic fake salesman info, could be varied by propertyId if needed
  return {
    name: "Emily Carter",
    email: "emily.carter@londondwellings.ai",
    phone: "+44 20 1234 5678",
    bio: "Your dedicated London property expert, specializing in matching clients with their ideal homes and investments. With years of experience in the London market, Emily provides personalized service and in-depth local knowledge.",
    imageUrl: `https://placehold.co/150x150.png`, // Placeholder image
    dataAiHint: "professional portrait"
  };
};
