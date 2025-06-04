
'use server';

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


// --- START: In-memory representation of parsed CSV data ---
// In a real scenario, this would come from fetching and parsing public/data.csv
// For this simulation, we'll use a direct JS array.
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

const parsedCsvData: CsvRow[] = [
  { outcode: "E1", sale_year: 2023, sale_month: 1, price: 650000, propertyType: "Terrace Property", bedrooms: 3, bathrooms: 1, tenure: "Freehold", currentEnergyRating: "D", floorAreaSqM: 110, fullAddress: "10 Market St, E1", name: "Charming E1 Home", description: "A lovely home in E1.", image: "https://placehold.co/600x400.png", dataAiHint: "house exterior", longitude: -0.0722, latitude: 51.5154 },
  { outcode: "E1", sale_year: 2023, sale_month: 4, price: 680000, propertyType: "Terrace Property", bedrooms: 3, bathrooms: 2, tenure: "Freehold", currentEnergyRating: "C", floorAreaSqM: 120, fullAddress: "12 Market St, E1", name: "Renovated E1 Property", description: "Recently renovated.", image: "https://placehold.co/600x401.png", dataAiHint: "modern house", longitude: -0.0720, latitude: 51.5155 },
  { outcode: "E1", sale_year: 2023, sale_month: 7, price: 660000, propertyType: "Purpose Built Flat", bedrooms: 2, bathrooms: 1, tenure: "Leasehold", currentEnergyRating: "B", floorAreaSqM: 80, fullAddress: "Flat 5, E1 Towers, London", name: "E1 Flat with View", description: "Great city views.", image: "https://placehold.co/600x402.png", dataAiHint: "apartment building", longitude: -0.0710, latitude: 51.5160 },
  { outcode: "E1", sale_year: 2023, sale_month: 10, price: 700000, propertyType: "Terrace Property", bedrooms: 4, bathrooms: 2, tenure: "Freehold", currentEnergyRating: "D", floorAreaSqM: 130, fullAddress: "15 Market St, E1, London", name: "Spacious E1 Terrace", description: "Large family home.", image: "https://placehold.co/600x403.png", dataAiHint: "large house", longitude: -0.0700, latitude: 51.5165 },
  { outcode: "E1", sale_year: 2022, sale_month: 2, price: 600000, propertyType: "Converted Flat", bedrooms: 2, bathrooms: 1, tenure: "Leasehold", currentEnergyRating: "E", floorAreaSqM: 75, fullAddress: "1 Victorian Mews, London, E1", name: "Historic E1 Flat", description: "Character property.", image: "https://placehold.co/600x404.png", dataAiHint: "old building", longitude: -0.0750, latitude: 51.5140 },
  { outcode: "E1", sale_year: 2022, sale_month: 5, price: 620000, propertyType: "Terrace Property", bedrooms: 3, bathrooms: 1, tenure: "Freehold", currentEnergyRating: "D", floorAreaSqM: 100, fullAddress: "5 Garden Row, E1", name: "E1 House with Garden", description: "Nice garden space.", image: "https://placehold.co/600x405.png", dataAiHint: "house garden", longitude: -0.0740, latitude: 51.5145 },
  { outcode: "E1", sale_year: 2022, sale_month: 8, price: 610000, propertyType: "Purpose Built Flat", bedrooms: 2, bathrooms: 2, tenure: "Leasehold", currentEnergyRating: "C", floorAreaSqM: 85, fullAddress: "Apt 10, E1 Central, London", name: "Central E1 Apartment", description: "Convenient location.", image: "https://placehold.co/600x406.png", dataAiHint: "city apartment", longitude: -0.0730, latitude: 51.5150 },
  { outcode: "E1", sale_year: 2022, sale_month: 11, price: 630000, propertyType: "Terrace Property", bedrooms: 3, bathrooms: 1, tenure: "Freehold", currentEnergyRating: "D", floorAreaSqM: 105, fullAddress: "8 River View, E1", name: "E1 Riverside Home", description: "Close to the river.", image: "https://placehold.co/600x407.png", dataAiHint: "riverside house", longitude: -0.0725, latitude: 51.5152 },
  { outcode: "E1", sale_year: 2021, sale_month: 3, price: 550000, propertyType: "Semi-Detached House", bedrooms: 3, bathrooms: 1, tenure: "Freehold", currentEnergyRating: "E", floorAreaSqM: 95, fullAddress: "2 Park Side, E1, London", name: "E1 Semi-Detached", description: "Near the park.", image: "https://placehold.co/600x408.png", dataAiHint: "suburban house", longitude: -0.0780, latitude: 51.5130 },
  { outcode: "E1", sale_year: 2021, sale_month: 6, price: 570000, propertyType: "Terrace Property", bedrooms: 2, bathrooms: 1, tenure: "Freehold", currentEnergyRating: "D", floorAreaSqM: 90, fullAddress: "20 Old St, E1", name: "Quaint E1 Cottage", description: "Full of character.", image: "https://placehold.co/600x409.png", dataAiHint: "cottage exterior", longitude: -0.0770, latitude: 51.5135 },
  { outcode: "E1", sale_year: 2021, sale_month: 9, price: 560000, propertyType: "Converted Flat", bedrooms: 1, bathrooms: 1, tenure: "Leasehold", currentEnergyRating: "C", floorAreaSqM: 60, fullAddress: "The Loft, E1 Warehouse, London", name: "E1 Loft Style", description: "Industrial chic.", image: "https://placehold.co/600x410.png", dataAiHint: "loft apartment", longitude: -0.0760, latitude: 51.5138 },
  { outcode: "E1", sale_year: 2021, sale_month: 12, price: 580000, propertyType: "Terrace Property", bedrooms: 3, bathrooms: 2, tenure: "Freehold", currentEnergyRating: "D", floorAreaSqM: 115, fullAddress: "3 New Build, E1", name: "Modern E1 Build", description: "Newly constructed.", image: "https://placehold.co/600x411.png", dataAiHint: "new house", longitude: -0.0755, latitude: 51.5139 },
  { outcode: "SW1A", sale_year: 2023, sale_month: 1, price: 1750000, propertyType: "Purpose Built Flat", bedrooms: 2, bathrooms: 2, tenure: "Leasehold", currentEnergyRating: "B", floorAreaSqM: 90, fullAddress: "Royal Apt, St James's, SW1A", name: "Luxury SW1A Flat", description: "Prime location.", image: "https://placehold.co/600x412.png", dataAiHint: "luxury apartment", longitude: -0.1357, latitude: 51.4975 },
  { outcode: "SW1A", sale_year: 2023, sale_month: 5, price: 1850000, propertyType: "Detached House", bedrooms: 3, bathrooms: 3, tenure: "Freehold", currentEnergyRating: "C", floorAreaSqM: 150, fullAddress: "1 Palace View, Westminster, SW1A", name: "SW1A Detached Home", description: "Overlooking park.", image: "https://placehold.co/600x413.png", dataAiHint: "mansion", longitude: -0.1360, latitude: 51.4980 },
  { outcode: "SW1A", sale_year: 2022, sale_month: 6, price: 1700000, propertyType: "Purpose Built Flat", bedrooms: 2, bathrooms: 2, tenure: "Leasehold", currentEnergyRating: "B", floorAreaSqM: 85, fullAddress: "The Westminster, SW1A, London", name: "Central SW1A Living", description: "Heart of Westminster.", image: "https://placehold.co/600x414.png", dataAiHint: "historic building", longitude: -0.1350, latitude: 51.4970 },
  { outcode: "SW1A", sale_year: 2021, sale_month: 7, price: 1600000, propertyType: "Terrace Property", bedrooms: 3, bathrooms: 2, tenure: "Leasehold", currentEnergyRating: "C", floorAreaSqM: 120, fullAddress: "1 Government Mews, SW1A", name: "SW1A Townhouse", description: "Elegant townhouse.", image: "https://placehold.co/600x415.png", dataAiHint: "townhouse exterior", longitude: -0.1340, latitude: 51.4960 },
  { outcode: "N1", sale_year: 2023, sale_month: 2, price: 1100000, propertyType: "Detached House", bedrooms: 4, bathrooms: 2, tenure: "Freehold", currentEnergyRating: "C", floorAreaSqM: 170, fullAddress: "Islington Villa, Barnsbury, N1", name: "Spacious N1 Villa", description: "Large family villa.", image: "https://placehold.co/600x416.png", dataAiHint: "villa", longitude: -0.1062, latitude: 51.5348 },
  { outcode: "N1", sale_year: 2022, sale_month: 8, price: 1050000, propertyType: "Terrace Property", bedrooms: 3, bathrooms: 2, tenure: "Freehold", currentEnergyRating: "D", floorAreaSqM: 140, fullAddress: "Angel Terrace, Islington, N1, London", name: "N1 Period Terrace", description: "Classic period home.", image: "https://placehold.co/600x417.png", dataAiHint: "period house", longitude: -0.1050, latitude: 51.5340 },
  { outcode: "N1", sale_year: 2021, sale_month: 10, price: 950000, propertyType: "Converted Flat", bedrooms: 2, bathrooms: 1, tenure: "Leasehold", currentEnergyRating: "C", floorAreaSqM: 100, fullAddress: "Regents Canal Apt, N1", name: "N1 Canal Flat", description: "Waterside living.", image: "https://placehold.co/600x418.png", dataAiHint: "canal apartment", longitude: -0.1040, latitude: 51.5330 },
  { outcode: "E10", sale_year: 2023, sale_month: 3, price: 470000, propertyType: "Semi-Detached House", bedrooms: 3, bathrooms: 1, tenure: "Freehold", currentEnergyRating: "D", floorAreaSqM: 90, fullAddress: "Leyton Green, Leyton, E10", name: "E10 Family House", description: "Ideal for families.", image: "https://placehold.co/600x419.png", dataAiHint: "family house", longitude: 0.0030, latitude: 51.5680 },
  { outcode: "E10", sale_year: 2022, sale_month: 9, price: 450000, propertyType: "Terrace Property", bedrooms: 2, bathrooms: 1, tenure: "Freehold", currentEnergyRating: "E", floorAreaSqM: 80, fullAddress: "Orient Way, E10, London", name: "E10 Starter Home", description: "Great first buy.", image: "https://placehold.co/600x420.png", dataAiHint: "small house", longitude: 0.0020, latitude: 51.5670 },
  { outcode: "E11", sale_year: 2023, sale_month: 6, price: 530000, propertyType: "Mid Terrace House", bedrooms: 3, bathrooms: 1, tenure: "Freehold", currentEnergyRating: "C", floorAreaSqM: 95, fullAddress: "Wanstead Flats View, E11", name: "E11 Home with View", description: "Overlooks Wanstead Flats.", image: "https://placehold.co/600x421.png", dataAiHint: "suburban street", longitude: 0.0090, latitude: 51.5700 },
  { outcode: "E11", sale_year: 2022, sale_month: 12, price: 510000, propertyType: "Purpose Built Flat", bedrooms: 2, bathrooms: 1, tenure: "Leasehold", currentEnergyRating: "B", floorAreaSqM: 70, fullAddress: "Station Approach, Leytonstone, E11", name: "E11 Commuter Flat", description: "Near the station.", image: "https://placehold.co/600x422.png", dataAiHint: "modern block", longitude: 0.0080, latitude: 51.5690 },
  { outcode: "E17", sale_year: 2023, sale_month: 3, price: 540000, propertyType: "Terrace Property", bedrooms: 3, bathrooms: 1, tenure: "Freehold", currentEnergyRating: "D", floorAreaSqM: 100, fullAddress: "Walthamstow Village, E17", name: "Village Charm Home", description: "Sought-after village.", image: "https://placehold.co/600x444.png", dataAiHint: "village charm", longitude: 0.0000, latitude: 51.5800 },
  { outcode: "E17", sale_year: 2023, sale_month: 11, price: 550000, propertyType: "Terrace Property", bedrooms: 3, bathrooms: 1, tenure: "Freehold", currentEnergyRating: "C", floorAreaSqM: 105, fullAddress: "Forest Road, Walthamstow, E17", name: "Forest Road House", description: "Good transport links.", image: "https://placehold.co/600x447.png", dataAiHint: "forest road", longitude: -0.0150, latitude: 51.5850 },
  { outcode: "E17", sale_year: 2022, sale_month: 5, price: 525000, propertyType: "Purpose Built Flat", bedrooms: 2, bathrooms: 2, tenure: "Leasehold", currentEnergyRating: "B", floorAreaSqM: 85, fullAddress: "Blackhorse Lane, Walthamstow, E17", name: "Blackhorse Development", description: "Modern development.", image: "https://placehold.co/600x448.png", dataAiHint: "blackhorse lane", longitude: -0.0300, latitude: 51.5870 },
  { outcode: "E17", sale_year: 2022, sale_month: 7, price: 520000, propertyType: "Semi-Detached House", bedrooms: 2, bathrooms: 1, tenure: "Freehold", currentEnergyRating: "C", floorAreaSqM: 90, fullAddress: "Lloyd Park Side, E17, London", name: "Near Lloyd Park", description: "Family-friendly.", image: "https://placehold.co/600x445.png", dataAiHint: "lloyd park", longitude: -0.0050, latitude: 51.5820 },
  { outcode: "E17", sale_year: 2021, sale_month: 9, price: 490000, propertyType: "End Terrace House", bedrooms: 2, bathrooms: 1, tenure: "Freehold", currentEnergyRating: "D", floorAreaSqM: 95, fullAddress: "Markhouse Road, Walthamstow, E17", name: "Markhouse Property", description: "Conveniently located.", image: "https://placehold.co/600x449.png", dataAiHint: "markhouse road", longitude: -0.0200, latitude: 51.5750 },
  { outcode: "E17", sale_year: 2021, sale_month: 12, price: 500000, propertyType: "Converted Flat", bedrooms: 2, bathrooms: 1, tenure: "Leasehold", currentEnergyRating: "B", floorAreaSqM: 80, fullAddress: "Hoe Street Hub, E17", name: "Central Walthamstow", description: "Vibrant location.", image: "https://placehold.co/600x446.png", dataAiHint: "hoe street", longitude: -0.0100, latitude: 51.5780 },
];
// --- END: In-memory representation of parsed CSV data ---


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

  const regionSales = parsedCsvData.filter(sale => sale.outcode === regionId);

  const quarterlyPrices: Record<string, { total: number, count: number }> = {};
  const currentFullYear = new Date().getFullYear();
  const threeYearsAgo = currentFullYear - 3; // Data for last 3 full years + current year up to last quarter

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
       // Stop if we are in the current year and past the current quarter
      if (year === currentFullYear && q > getQuarter(new Date().getMonth() +1) ) {
        break;
      }
      const key = `Q${q} ${year}`;
      if (quarterlyPrices[key] && quarterlyPrices[key].count > 0) {
        quarterlyPriceHistory.push({
          quarter: key,
          price: Math.round(quarterlyPrices[key].total / quarterlyPrices[key].count / 1000) * 1000,
        });
      } else {
         // If no data for a past quarter, try to carry forward or estimate, or omit
         // For simplicity, let's add it with a placeholder if it's missing but expected
         // A more robust solution might interpolate or fetch more granular data
         if (year < currentFullYear || (year === currentFullYear && q < getQuarter(new Date().getMonth() +1))) {
            const previousQuarter = quarterlyPriceHistory.length > 0 ? quarterlyPriceHistory[quarterlyPriceHistory.length -1] : null;
            quarterlyPriceHistory.push({
                quarter: key,
                price: previousQuarter ? previousQuarter.price : regionDetails.avgPrice * (0.95 + Math.random() * 0.1) // Fallback to randomized initial outcode avgPrice
            });
         }
      }
    }
  }
   // Sort by year then quarter
  quarterlyPriceHistory.sort((a, b) => {
    const [aQ, aY] = a.quarter.split(" ");
    const [bQ, bY] = b.quarter.split(" ");
    if (aY !== bY) return parseInt(aY) - parseInt(bY);
    return parseInt(aQ.substring(1)) - parseInt(bQ.substring(1));
  });
  
  // Limit to last 12 quarters (3 years)
  const limitedQuarterlyPriceHistory = quarterlyPriceHistory.slice(-12);


  let currentAveragePrice = regionDetails.avgPrice; // Fallback
  const allRegionSalesPrices = regionSales.map(s => s.price);
  if (allRegionSalesPrices.length > 0) {
    currentAveragePrice = Math.round(allRegionSalesPrices.reduce((sum, p) => sum + p, 0) / allRegionSalesPrices.length / 1000) * 1000;
  }
  
  // Update the avgPrice in londonOutcodes for ranking to be based on CSV data if available
  const outcodesWithCsvAvgPrice = londonOutcodes.map(oc => {
    const salesInOutcode = parsedCsvData.filter(s => s.outcode === oc.id);
    if (salesInOutcode.length > 0) {
      const avg = salesInOutcode.reduce((sum, s) => sum + s.price, 0) / salesInOutcode.length;
      return { ...oc, avgPrice: Math.round(avg / 1000) * 1000 };
    }
    return oc; // Keep original avgPrice if no sales in CSV
  });


  const sortedRegions = [...outcodesWithCsvAvgPrice].sort((a, b) => b.avgPrice - a.avgPrice);
  const rank = sortedRegions.findIndex(r => r.id === regionId) + 1;
  const totalRegions = sortedRegions.length;
  const priceRank = `Rank: ${rank} of ${totalRegions}`;

  return {
    regionId: regionDetails.id,
    regionName: regionDetails.name,
    currentAveragePrice,
    quarterlyPriceHistory: limitedQuarterlyPriceHistory.length > 0 ? limitedQuarterlyPriceHistory : [{ quarter: "N/A", price: currentAveragePrice }], // Ensure there's always some data for the chart
    priceRank,
  };
};

