
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
import fakePredictionDataJson from '@/lib/data/fake_prediction_output.json'; // Updated to new structure
import fakeRegionInsightsData from '@/lib/data/fake_region_insights.json';

// --- Original Service Functions (Potentially for real backend/Genkit calls) ---

// This function will call the Genkit flow, which now expects the new input and returns new output.
export const fetchPricePrediction = async (data: PredictionInput): Promise<PredictionOutput> => {
  const result = await predictPriceFlow(data);
  return result;
};

export const fetchRegionInsights = async (data: RegionPriceInsightsInput): Promise<RegionPriceInsightsOutput> => {
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

// This function now simulates the NEW output structure.
// The input 'input' to this function will be of the new PredictionInput type from the flow.
export const fetchFakePredictionForHook = async (input: PredictionInput): Promise<PredictionOutput> => {
  const basePredictedPrice = fakePredictionDataJson.price;
  // Simulate some variation based on input, e.g. floorAreaSqM
  const areaModifier = input.floorAreaSqM ? (input.floorAreaSqM / 100) * 30000 : 0; // Adjusted calculation
  const finalPredictedPrice = Math.round((basePredictedPrice + areaModifier + (input.sale_year - 2023) * 5000) / 1000) * 1000;
  
  // Generate dynamic priceHistoryChartData based on input sale_month and sale_year
  const priceHistoryChartData = [];
  let lastPrice = finalPredictedPrice * 0.98; 
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  for (let i = 0; i < 12; i++) {
    const date = new Date(input.sale_year, input.sale_month - 1 + i, 1);
    const chartMonth = monthNames[date.getMonth()];
    const chartYear = date.getFullYear();
    lastPrice = lastPrice * (1 + (Math.random() * 0.015 - 0.005));
    priceHistoryChartData.push({
      month: `${chartMonth} ${chartYear}`,
      price: Math.round(lastPrice / 1000) * 1000,
    });
  }
  if (priceHistoryChartData.length > 0) {
    priceHistoryChartData[0].price = Math.round((finalPredictedPrice * (0.995 + Math.random() * 0.01)) /1000) * 1000;
  }


  return {
    price: finalPredictedPrice,
    isStable: fakePredictionDataJson.isStable, // Keep isStable from JSON or make it dynamic
    averageAreaPrice: Math.round((finalPredictedPrice * (0.90 + Math.random()*0.15)) / 1000) * 1000, // Make average area price dynamic
    priceHistoryChartData: priceHistoryChartData,
  };
};

export const fetchFakePropertiesForHook = async (): Promise<Property[]> => {
  return [...initialProperties]; 
};

export const addFakePropertyForHook = async (propertyData: Omit<Property, 'id' | 'image'> & { image: string }): Promise<Property> => {
  const newProperty: Property = {
    ...propertyData,
    id: Date.now().toString(), 
  };
  return newProperty;
};

export const fetchFakeRegionInsightsForHook = async (input: RegionPriceInsightsInput): Promise<RegionPriceInsightsOutput> => {
  const regionKey = input.region as keyof typeof fakeRegionInsightsData;
  const insight = fakeRegionInsightsData[regionKey] || fakeRegionInsightsData['DEFAULT'];
  return insight;
};
