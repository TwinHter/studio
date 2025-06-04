
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

// Make 'liveProperties' a mutable, module-level variable, initialized with the JSON data.
// This array will be modified in memory by addFakePropertyForHook.
let liveProperties: Property[] = [...initialPropertiesDataFromFile] as Property[];


// Interface for the CSV row structure, matching public/data.csv
interface CsvRow {
  outcode: string;
  sale_year: number;
  sale_month: number;
  price: number;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  tenure: Tenure;
  currentEnergyRating: EnergyRating;
  floorAreaSqM: number;
  fullAddress: string;
  name: string;
  description: string;
  image: string;
  dataAiHint: string;
  longitude?: number;
  latitude?: number;
}

export const fetchPricePrediction = async (data: PredictionInput): Promise<PredictionOutput> => {
  const result = await predictPriceFlow(data);
  return result;
};

export const fetchPropertyDetails = async (propertyId: string): Promise<Property | undefined> => {
  // Read from the potentially modified in-memory array
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
  // Return a copy of the potentially modified in-memory array
  return [...liveProperties];
};

export const addFakePropertyForHook = async (
  propertyData: Omit<Property, 'id'> & { image: string; longitude?: number; latitude?: number; sale_month: number; sale_year: number; }
): Promise<Property> => {
  const newProperty: Property = {
    ...propertyData,
    id: Date.now().toString(),
  };
  liveProperties.unshift(newProperty); // Add to the beginning to show up first
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
    
    // Skip header row by starting map from index 1
    parsedCsvData = lines.slice(1).map(line => {
      const values = line.split(',');
      // Assuming CSV columns are in the exact order of CsvRow interface fields
      return {
        outcode: values[0],
        sale_year: parseInt(values[1]),
        sale_month: parseInt(values[2]),
        price: parseFloat(values[3]),
        propertyType: values[4] as PropertyType,
        bedrooms: parseInt(values[5]),
        bathrooms: parseInt(values[6]),
        tenure: values[7] as Tenure,
        currentEnergyRating: values[8] as EnergyRating,
        floorAreaSqM: parseFloat(values[9]),
        fullAddress: values[10],
        name: values[11],
        description: values[12],
        image: values[13],
        dataAiHint: values[14],
        longitude: values[15] ? parseFloat(values[15]) : undefined,
        latitude: values[16] ? parseFloat(values[16]) : undefined,
      } as CsvRow;
    }).filter(row => row.outcode && !isNaN(row.price)); // Basic validation
  } catch (error) {
    console.error("Failed to read or parse data.csv:", error);
    // Fallback or throw error - for now, continue with empty data which will show 'N/A' or default region avg.
    // Depending on requirements, might throw new Error("Could not load regional market data source.");
  }

  const regionSales = parsedCsvData.filter(sale => sale.outcode === regionId);

  const quarterlyPrices: Record<string, { total: number, count: number }> = {};
  const currentFullYear = new Date().getFullYear();
  const threeYearsAgo = currentFullYear - 3;

  regionSales.forEach(sale => {
    if (sale.sale_year >= threeYearsAgo) {
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
  for (let year = threeYearsAgo; year <= currentFullYear; year++) {
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
         if (year < currentFullYear || (year === currentFullYear && q < getQuarter(new Date().getMonth() +1))) {
            const previousQuarterData = quarterlyPriceHistory.length > 0 ? quarterlyPriceHistory[quarterlyPriceHistory.length -1] : null;
            quarterlyPriceHistory.push({
                quarter: key,
                price: previousQuarterData ? previousQuarterData.price : Math.round(regionDetails.avgPrice * (0.95 + Math.random() * 0.1) / 1000) * 1000
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
  });

  const sortedRegions = [...outcodesWithCsvAvgPrice].sort((a, b) => b.avgPrice - a.avgPrice);
  const rank = sortedRegions.findIndex(r => r.id === regionId) + 1;
  const totalRegions = sortedRegions.length;
  const priceRank = `Rank: ${rank} of ${totalRegions}`;

  return {
    regionId: regionDetails.id,
    regionName: regionDetails.name,
    currentAveragePrice,
    quarterlyPriceHistory: limitedQuarterlyPriceHistory.length > 0 ? limitedQuarterlyPriceHistory : [{ quarter: "N/A", price: currentAveragePrice }],
    priceRank,
  };
};

    