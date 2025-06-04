
'use server';

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { PredictionInput, PredictionOutput } from '@/ai/flows/price-prediction';
import type { Property, RegionMarketData, QuarterlyPricePoint, PropertyType, Tenure, EnergyRating } from '@/types';
import initialPropertiesDataFromFile from '@/lib/data/properties.json';
import { londonOutcodes } from '@/lib/data/london_outcodes_data';
// import { DEFAULT_SALESMAN_INFO, PLACEHOLDER_HINTS } from '@/lib/constants'; // DEFAULT_SALESMAN_INFO might still be useful for fallbacks

import { predictPrice as predictPriceFlow } from '@/ai/flows/price-prediction';
import fakePredictionDataJson from '@/lib/data/fake_prediction_output.json';
// import axios from 'axios'; // Not used currently

// Path to the properties.json file
const propertiesFilePath = path.join(process.cwd(), 'src', 'lib', 'data', 'properties.json');

// Initialize liveProperties from the file. This copy will be mutated for in-session updates.
let liveProperties: Property[] = [...initialPropertiesDataFromFile] as Property[];

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

export const fetchPropertyDetails = async (propertyId: string): Promise<Property | null> => {
  // For consistency, especially if file was modified externally, could re-read here.
  // However, for this setup, liveProperties should be up-to-date for the session.
  const property = liveProperties.find(p => p.id === propertyId);
  return property || null;
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
  // Optionally, re-read from file here if strict sync with file is needed on every fetch
  // For now, rely on liveProperties being updated by addFakePropertyForHook
  return [...liveProperties];
};

export const addFakePropertyForHook = async (
  propertyData: Omit<Property, 'id'> & {
    image: string; // data URL
    longitude?: number;
    latitude?: number;
    sale_month: number;
    sale_year: number;
    uploaderName: string;
    uploaderEmail: string;
    uploaderPhone?: string;
  }
): Promise<Property> => {
  const newProperty: Property = {
    ...propertyData,
    id: Date.now().toString(),
  };

  try {
    // Read current properties from file
    const fileContent = fs.readFileSync(propertiesFilePath, 'utf-8');
    const currentPropertiesFromFile: Property[] = JSON.parse(fileContent);

    // Add new property to the beginning
    currentPropertiesFromFile.unshift(newProperty);

    // Write updated properties back to file
    fs.writeFileSync(propertiesFilePath, JSON.stringify(currentPropertiesFromFile, null, 2), 'utf-8');

    // Update in-memory liveProperties as well for immediate reflection in the current session
    liveProperties = [...currentPropertiesFromFile];

  } catch (error) {
    console.error("Failed to write property to JSON file:", error);
    // If file write fails, still update in-memory for the session as a fallback,
    // but the change won't persist across server restarts.
    liveProperties.unshift(newProperty);
    // Optionally, re-throw or handle the error (e.g., return an error state to the client)
    // For now, it will proceed with the in-memory update.
  }

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

    const header = lines[0].split(',');
    const expectedHeaders = ['ID','fullAddress','postcode','country','outcode','latitude','longitude','bathrooms','bedrooms','floorAreaSqM','livingRooms','tenure','propertyType','currentEnergyRating','sale_month','sale_year','price'];
    const headerMap = header.reduce((acc, h, i) => {
      acc[h.trim()] = i;
      return acc;
    }, {} as Record<string, number>);

    // Basic header validation
    const missingHeaders = expectedHeaders.filter(eh => !(eh in headerMap));
    if (missingHeaders.length > 0) {
        console.warn(`CSV file is missing expected headers: ${missingHeaders.join(', ')}. Data parsing might be incorrect.`);
    }
    
    parsedCsvData = lines.slice(1).map((line, lineIndex) => {
      const values = line.split(',');
      // Fallback to index if headerMap is incomplete due to warnings
      const getVal = (colName: string, index: number, isNumeric = false, isFloat = false) => {
        const valIndex = headerMap[colName] !== undefined ? headerMap[colName] : index;
        if (valIndex >= values.length) return undefined; // out of bounds
        const rawVal = values[valIndex];
        if (rawVal === undefined || rawVal.trim() === '') return undefined;
        if (isNumeric) {
          return isFloat ? parseFloat(rawVal) : parseInt(rawVal, 10);
        }
        return rawVal;
      };

      const rowData = {
        id: getVal('ID', 0) || `row_${lineIndex}`,
        fullAddress: getVal('fullAddress', 1) || '',
        postcode: getVal('postcode', 2) || '',
        country: getVal('country', 3) || '',
        outcode: getVal('outcode', 4) || '',
        latitude: getVal('latitude', 5, true, true),
        longitude: getVal('longitude', 6, true, true),
        bathrooms: getVal('bathrooms', 7, true) || 0,
        bedrooms: getVal('bedrooms', 8, true) || 0,
        floorAreaSqM: getVal('floorAreaSqM', 9, true, true) || 0,
        livingRooms: getVal('livingRooms', 10, true) || 0,
        tenure: (getVal('tenure', 11) || 'Unknown') as Tenure,
        propertyType: (getVal('propertyType', 12) || 'Unknown') as PropertyType,
        currentEnergyRating: (getVal('currentEnergyRating', 13) || 'Unknown') as EnergyRating,
        sale_month: getVal('sale_month', 14, true) || 0,
        sale_year: getVal('sale_year', 15, true) || 0,
        price: getVal('price', 16, true, true) || 0,
      } as CsvRow;
      
      return rowData;

    }).filter(row => row.outcode && !isNaN(row.price) && row.sale_year && row.sale_month && row.price > 0);
  } catch (error) {
    console.error("Failed to read or parse data.csv:", error);
  }

  const regionSales = parsedCsvData.filter(sale => sale.outcode === regionId);

  const quarterlyPrices: Record<string, { total: number, count: number }> = {};
  const currentFullYear = new Date().getFullYear();
  const fiveYearsAgo = currentFullYear - 5;

  regionSales.forEach(sale => {
    if (sale.sale_year >= fiveYearsAgo && sale.sale_year <= currentFullYear) { // ensure sale_year is within range
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
  for (let year = fiveYearsAgo; year <= currentFullYear; year++) {
    for (let q = 1; q <= 4; q++) {
      if (year === currentFullYear && q > getQuarter(new Date().getMonth() + 1)) {
        break; // Don't project future quarters of the current year
      }
      const key = `Q${q} ${year}`;
      if (quarterlyPrices[key] && quarterlyPrices[key].count > 0) {
        quarterlyPriceHistory.push({
          quarter: key,
          price: Math.round(quarterlyPrices[key].total / quarterlyPrices[key].count / 1000) * 1000,
        });
      } else {
         // Only fill if it's a past quarter or current quarter of a past year
         if (year < currentFullYear || (year === currentFullYear && q < getQuarter(new Date().getMonth() +1))) {
            const previousQuarterData = quarterlyPriceHistory.length > 0 ? quarterlyPriceHistory[quarterlyPriceHistory.length -1] : null;
            let estimatedPriceForMissingQuarter = regionDetails.avgPrice * (0.95 + Math.random() * 0.1); // Fallback to region average
            if(previousQuarterData) { // If there's previous data, base it on that with slight random fluctuation
                estimatedPriceForMissingQuarter = previousQuarterData.price * (0.995 + Math.random() * 0.01);
            }
            quarterlyPriceHistory.push({
                quarter: key,
                price: Math.round(estimatedPriceForMissingQuarter / 1000) * 1000
            });
         }
      }
    }
  }

  // Sort and limit to last 12 quarters
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

  // Recalculate average prices for all outcodes based on CSV data for ranking
  const outcodesWithCsvAvgPrice = londonOutcodes.map(oc => {
    const salesInOutcode = parsedCsvData.filter(s => s.outcode === oc.id);
    if (salesInOutcode.length > 0) {
      const avg = salesInOutcode.reduce((sum, s) => sum + s.price, 0) / salesInOutcode.length;
      return { ...oc, avgPrice: Math.round(avg / 1000) * 1000 };
    }
    return oc; // Keep original avgPrice if no sales in CSV
  }).filter(oc => oc.avgPrice > 0); // Filter out regions with no price info

  const sortedRegions = [...outcodesWithCsvAvgPrice].sort((a, b) => b.avgPrice - a.avgPrice);
  const rank = sortedRegions.findIndex(r => r.id === regionId) + 1;
  const totalRegions = sortedRegions.length;
  const priceRank = totalRegions > 0 && rank > 0 ? `Rank: ${rank} of ${totalRegions}` : "Rank: N/A";


  return {
    regionId: regionDetails.id,
    regionName: regionDetails.name,
    currentAveragePrice,
    quarterlyPriceHistory: limitedQuarterlyPriceHistory.length > 0 ? limitedQuarterlyPriceHistory : [{ quarter: `Avg. ${regionDetails.id}`, price: currentAveragePrice }],
    priceRank,
  };
};

