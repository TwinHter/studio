
'use server';

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { PredictionInput, PredictionOutput } from '@/ai/flows/price-prediction';
import type { Property, SalesmanInfo, RegionMarketData, QuarterlyPricePoint, PropertyType, Tenure, EnergyRating } from '@/types';
import initialPropertiesDataFromFile from '@/lib/data/properties.json';
import { londonOutcodes } from '@/lib/data/london_outcodes_data';
import { DEFAULT_SALESMAN_INFO, PLACEHOLDER_HINTS } from '@/lib/constants';

import { predictPrice as predictPriceFlow } from '@/ai/flows/price-prediction';
import fakePredictionDataJson from '@/lib/data/fake_prediction_output.json';
import axios from 'axios';

let liveProperties: Property[] = [...initialPropertiesDataFromFile] as Property[];

// Interface for the CSV row structure
interface CsvRow {
  id: string;
  fullAddress: string;
  postcode: string;
  country: string;
  outcode: string;
  latitude?: number;
  longitude?: number;
  bathrooms: number;
  bedrooms: number;
  floorAreaSqM: number;
  livingRooms: number;
  tenure: Tenure;
  propertyType: PropertyType;
  currentEnergyRating: EnergyRating;
  sale_month: number;
  sale_year: number;
  price: number;
}

export const fetchPricePrediction = async (data: PredictionInput): Promise<PredictionOutput> => {
  const result = await predictPriceFlow(data);
  return result;
};

export const fetchPropertyDetails = async (propertyId: string): Promise<Property | undefined> => {
  const property = liveProperties.find(p => p.id === propertyId);
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
  return [...liveProperties];
};

export const addFakePropertyForHook = async (
  propertyData: Omit<Property, 'id'> & { image: string; longitude?: number; latitude?: number; sale_month: number; sale_year: number; }
): Promise<Property> => {
  const newProperty: Property = {
    ...propertyData,
    id: Date.now().toString(),
  };
  liveProperties.unshift(newProperty);
  return newProperty;
};

function getQuarter(month: number): number {
  if (month <= 3) return 1;
  if (month <= 6) return 2;
  if (month <= 9) return 3;
  return 4;
}

export const fetchFakeRegionMarketDataForHook = async (regionId: string): Promise<RegionMarketData> => {
  const regionDetails = londonOutcodes.find(r => r.id === regionId);
  if (!regionDetails) {
    throw new Error(`Region ${regionId} not found.`);
  }

  let parsedCsvData: CsvRow[] = [];
  try {
    const csvFilePath = path.join(process.cwd(), 'public', 'data.csv');
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
    const lines = fileContent.trim().split(/\r?\n/);
    
    parsedCsvData = lines.slice(1).map(line => {
      const values = line.split(',');
      // Mapping based on the CSV structure:
      // ID,fullAddress,postcode,country,outcode,latitude,longitude,bathrooms,bedrooms,floorAreaSqM,livingRooms,tenure,propertyType,currentEnergyRating,sale_month,sale_year,price
      return {
        id: values[0],
        fullAddress: values[1],
        postcode: values[2],
        country: values[3],
        outcode: values[4],
        latitude: values[5] && values[5] !== '' ? parseFloat(values[5]) : undefined,
        longitude: values[6] && values[6] !== '' ? parseFloat(values[6]) : undefined,
        bathrooms: parseInt(values[7]),
        bedrooms: parseInt(values[8]),
        floorAreaSqM: parseFloat(values[9]),
        livingRooms: parseInt(values[10]),
        tenure: values[11] as Tenure,
        propertyType: values[12] as PropertyType,
        currentEnergyRating: values[13] as EnergyRating,
        sale_month: parseInt(values[14]),
        sale_year: parseInt(values[15]),
        price: parseFloat(values[16]),
      } as CsvRow;
    }).filter(row => row.outcode && !isNaN(row.price) && row.sale_year && row.sale_month && row.price > 0);
  } catch (error) {
    console.error("Failed to read or parse data.csv:", error);
  }

  const regionSales = parsedCsvData.filter(sale => sale.outcode === regionId);

  const quarterlyPrices: Record<string, { total: number, count: number }> = {};
  const currentFullYear = new Date().getFullYear();
  const fiveYearsAgo = currentFullYear - 5; // Changed from 3 to 5 years

  regionSales.forEach(sale => {
    if (sale.sale_year >= fiveYearsAgo) { // Updated condition to use fiveYearsAgo
      const quarter = getQuarter(sale.sale_month);
      const key = `Q${quarter} ${sale.sale_year}`;
      if (!quarterlyPrices[key]) {
        quarterlyPrices[key] = { total: 0, count: 0 };
      }
      quarterlyPrices[key].total += sale.price;
      quarterlyPrices[key].count += 1;
    }
  });

  const quarterlyPriceHistory: QuarterlyPricePoint[] = [];
  for (let year = fiveYearsAgo; year <= currentFullYear; year++) { // Updated loop start year
    for (let q = 1; q <= 4; q++) {
      if (year === currentFullYear && q > getQuarter(new Date().getMonth() + 1)) {
        break; 
      }
      const key = `Q${q} ${year}`;
      if (quarterlyPrices[key] && quarterlyPrices[key].count > 0) {
        quarterlyPriceHistory.push({
          quarter: key,
          price: Math.round(quarterlyPrices[key].total / quarterlyPrices[key].count / 1000) * 1000,
        });
      } else {
         // Fill in missing quarters with previous data or a calculated estimate if at the beginning
         if (year < currentFullYear || (year === currentFullYear && q < getQuarter(new Date().getMonth() +1))) {
            const previousQuarterData = quarterlyPriceHistory.length > 0 ? quarterlyPriceHistory[quarterlyPriceHistory.length -1] : null;
            let estimatedPriceForMissingQuarter = regionDetails.avgPrice * (0.95 + Math.random() * 0.1); // Default estimate
            if(previousQuarterData) {
                estimatedPriceForMissingQuarter = previousQuarterData.price * (0.995 + Math.random() * 0.01); // Slight variation from previous
            }
            quarterlyPriceHistory.push({
                quarter: key,
                price: Math.round(estimatedPriceForMissingQuarter / 1000) * 1000
            });
         }
      }
    }
  }
  
  quarterlyPriceHistory.sort((a, b) => {
    const [aQStr, aYStr] = a.quarter.split(" ");
    const [bQStr, bYStr] = b.quarter.split(" ");
    const aY = parseInt(aYStr);
    const bY = parseInt(bYStr);
    const aQ = parseInt(aQStr.substring(1));
    const bQ = parseInt(bQStr.substring(1));
    if (aY !== bY) return aY - bY;
    return aQ - bQ;
  });
  
  // Keep displaying up to the last 12 quarters for chart readability, from the 5-year data window
  const limitedQuarterlyPriceHistory = quarterlyPriceHistory.slice(-12); 

  let currentAveragePrice = regionDetails.avgPrice;
  const allRegionSalesPrices = regionSales.map(s => s.price);
  if (allRegionSalesPrices.length > 0) {
    currentAveragePrice = Math.round(allRegionSalesPrices.reduce((sum, p) => sum + p, 0) / allRegionSalesPrices.length / 1000) * 1000;
  }
  
  const outcodesWithCsvAvgPrice = londonOutcodes.map(oc => {
    const salesInOutcode = parsedCsvData.filter(s => s.outcode === oc.id);
    if (salesInOutcode.length > 0) {
      const avg = salesInOutcode.reduce((sum, s) => sum + s.price, 0) / salesInOutcode.length;
      return { ...oc, avgPrice: Math.round(avg / 1000) * 1000 };
    }
    return oc; 
  }).filter(oc => oc.avgPrice > 0); 

  const sortedRegions = [...outcodesWithCsvAvgPrice].sort((a, b) => b.avgPrice - a.avgPrice);
  const rank = sortedRegions.findIndex(r => r.id === regionId) + 1;
  const totalRegions = sortedRegions.length;
  const priceRank = totalRegions > 0 && rank > 0 ? `Rank: ${rank} of ${totalRegions}` : "Rank: N/A";


  return {
    regionId: regionDetails.id,
    regionName: regionDetails.name,
    currentAveragePrice,
    // Ensure at least one data point if history is empty, using currentAveragePrice
    quarterlyPriceHistory: limitedQuarterlyPriceHistory.length > 0 ? limitedQuarterlyPriceHistory : [{ quarter: `Current Avg.`, price: currentAveragePrice }],
    priceRank,
  };
};

    
