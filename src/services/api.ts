
'use server'; 

import type { PredictionInput, PredictionOutput } from '@/ai/flows/price-prediction';
import type { Property, SalesmanInfo, RegionMarketData, QuarterlyPricePoint } from '@/types'; 
import initialPropertiesData from '@/lib/data/properties.json'; 
import { londonOutcodes } from '@/lib/data/london_outcodes_data';
import { DEFAULT_SALESMAN_INFO, PLACEHOLDER_HINTS } from '@/lib/constants';

import { predictPrice as predictPriceFlow } from '@/ai/flows/price-prediction';
import fakePredictionDataJson from '@/lib/data/fake_prediction_output.json'; 

// Ensure initialPropertiesData is correctly typed as Property[]
const initialProperties: Property[] = initialPropertiesData as Property[];


export const fetchPricePrediction = async (data: PredictionInput): Promise<PredictionOutput> => {
  const result = await predictPriceFlow(data);
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


export const fetchFakePredictionForHook = async (input: PredictionInput): Promise<PredictionOutput> => {
  const basePredictedPrice = fakePredictionDataJson.price;
  const areaModifier = input.floorAreaSqM ? (input.floorAreaSqM / 100) * 30000 : 0;
  const finalPredictedPrice = Math.round((basePredictedPrice + areaModifier + (input.sale_year - 2023) * 5000) / 1000) * 1000;
  
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
    isStable: fakePredictionDataJson.isStable,
    averageAreaPrice: Math.round((finalPredictedPrice * (0.90 + Math.random()*0.15)) / 1000) * 1000,
    priceHistoryChartData: priceHistoryChartData,
  };
};

export const fetchFakePropertiesForHook = async (): Promise<Property[]> => {
  return [...initialProperties];
};

export const addFakePropertyForHook = async (
  propertyData: Omit<Property, 'id'> & { image: string; }
): Promise<Property> => {
  const newProperty: Property = {
    ...propertyData,
    id: Date.now().toString(), 
  };
  return newProperty;
};

export const fetchFakeRegionMarketDataForHook = async (regionId: string): Promise<RegionMarketData> => {
  const regionDetails = londonOutcodes.find(r => r.id === regionId);
  if (!regionDetails) {
    throw new Error(`Region ${regionId} not found.`);
  }

  const currentAveragePrice = regionDetails.avgPrice;
  const quarterlyPriceHistory: QuarterlyPricePoint[] = [];
  const currentYear = new Date().getFullYear();
  let priceFluctuationBase = currentAveragePrice;

  for (let year = currentYear - 2; year <= currentYear; year++) {
    for (let q = 1; q <= 4; q++) {
      let quarterPrice = priceFluctuationBase * (1 + (Math.random() - 0.5) * 0.05); 
      quarterPrice = Math.round(quarterPrice / 1000) * 1000;
      quarterlyPriceHistory.push({
        quarter: `Q${q} ${year}`,
        price: quarterPrice,
      });
      priceFluctuationBase = quarterPrice * (1 + (Math.random() - 0.45) * 0.01); 
    }
  }
  if (quarterlyPriceHistory.length > 0) {
    quarterlyPriceHistory[quarterlyPriceHistory.length -1].price = Math.round(currentAveragePrice * (0.98 + Math.random()*0.04) /1000) *1000;
  }

  const sortedRegions = [...londonOutcodes].sort((a, b) => b.avgPrice - a.avgPrice);
  const rank = sortedRegions.findIndex(r => r.id === regionId) + 1;
  const totalRegions = sortedRegions.length;
  const priceRank = `Rank: ${rank} of ${totalRegions}`;

  return {
    regionId: regionDetails.id,
    regionName: regionDetails.name,
    currentAveragePrice,
    quarterlyPriceHistory,
    priceRank,
  };
};
