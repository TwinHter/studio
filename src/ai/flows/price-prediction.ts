// src/ai/flows/price-prediction.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for predicting house prices in London.
 *
 * - predictPrice - A function that takes property details as input and returns a price prediction.
 * - PredictionInput - The input type for the predictPrice function.
 * - PredictionOutput - The return type for the predictPrice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { PropertyType, EnergyRating, Tenure } from '@/lib/data/properties_data';

const propertyTypeValues: [PropertyType, ...PropertyType[]] = ['Flat', 'Detached', 'Terraced', 'Semi-detached', 'Bungalow', 'Maisonette'];
const energyRatingValues: [EnergyRating, ...EnergyRating[]] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const tenureValues: [Tenure, ...Tenure[]] = ['Freehold', 'Leasehold'];


const PredictionInputSchema = z.object({
  fullAddress: z.string().min(5, { message: 'Full address is required.' }).describe('The full address of the property.'),
  outcode: z.string().min(2, { message: 'Outcode is required.' }).describe('The outcode part of the postcode (e.g., SW1, E1).'),
  longitude: z.number().optional().describe('The longitude of the property (derived from address).'),
  latitude: z.number().optional().describe('The latitude of the property (derived from address).'),
  bedrooms: z.number().int().min(0, {message: 'Bedrooms cannot be negative.'}).max(10, { message: 'Cannot exceed 10 bedrooms.' }).describe('The number of bedrooms.'),
  bathrooms: z.number().int().min(0, {message: 'Bathrooms cannot be negative.'}).max(10, { message: 'Cannot exceed 10 bathrooms.' }).describe('The number of bathrooms.'),
  receptionRooms: z.number().int().min(0, {message: 'Reception rooms cannot be negative.'}).max(10, { message: 'Cannot exceed 10 reception rooms.' }).describe('The number of reception rooms (living rooms).'),
  area: z.number().positive({ message: 'Area must be a positive number.' }).describe('The area of the property in square meters.'),
  tenure: z.enum(tenureValues).describe('The tenure type of the property (e.g., Freehold, Leasehold).'),
  propertyType: z.enum(propertyTypeValues).describe('The type of property.'),
  currentEnergyRating: z.enum(energyRatingValues).describe('The current energy efficiency rating of the property.'),
  monthOfSale: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'Month of sale must be in YYYY-MM format.' }).describe('The month and year of sale (YYYY-MM).'),
});
export type PredictionInput = z.infer<typeof PredictionInputSchema>;

const PredictionOutputSchema = z.object({
  predictedPrice: z.number().describe('The predicted price of the property.'),
  priceTrend: z.enum(['increasing', 'decreasing', 'stable']).describe('The predicted price trend for the next 12 months.'),
  averageAreaPrice: z.number().describe('The average price for similar properties in the area.'),
  priceHistoryChartData: z.array(z.object({
    month: z.string(),
    price: z.number(),
  })).describe('The predicted price for the next 12 months.'),
});
export type PredictionOutput = z.infer<typeof PredictionOutputSchema>;

export async function predictPrice(input: PredictionInput): Promise<PredictionOutput> {
  return predictPriceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'pricePredictionPrompt',
  input: {schema: PredictionInputSchema},
  output: {schema: PredictionOutputSchema},
  prompt: `You are an AI real estate expert specializing in London property prices.

You will receive property details and must predict its price for the specified month of sale, along with an estimation of the price trend in the next 12 months. You must also provide the average price for similar properties in the same outcode.

Property Details:
Full Address: {{{fullAddress}}}
Outcode: {{{outcode}}}
Longitude: {{{longitude}}}
Latitude: {{{latitude}}}
Property Type: {{{propertyType}}}
Bedrooms: {{{bedrooms}}}
Bathrooms: {{{bathrooms}}}
Reception Rooms: {{{receptionRooms}}}
Area (sqm): {{{area}}}
Tenure: {{{tenure}}}
Current Energy Rating: {{{currentEnergyRating}}}
Month of Sale: {{{monthOfSale}}}

Consider factors such as historical price data (1991-2023), property type, location, size, condition (implied by energy rating), tenure and current market trends for the specified month of sale.

Output the predicted price, price trend (increasing, decreasing, or stable), average price for similar properties in the area, and the predicted price for the next 12 months from the month of sale.

Here's an example of the expected output format for the priceHistoryChartData:

[
  {
    "month": "Jan 2025",
    "price": 520000
  },
  {
    "month": "Feb 2025",
    "price": 525000
  },
  // ... remaining months
]

Ensure that the priceHistoryChartData includes predictions for each month of the next 12 months from the provided monthOfSale and that prices are realistic for the London property market.`,
});

const predictPriceFlow = ai.defineFlow(
  {
    name: 'predictPriceFlow',
    inputSchema: PredictionInputSchema,
    outputSchema: PredictionOutputSchema,
  },
  async (input: PredictionInput): Promise<PredictionOutput> => {
    // Fake data implementation based on new inputs
    let basePrice = 200000;
    basePrice += input.bedrooms * 70000;
    basePrice += input.bathrooms * 40000;
    basePrice += input.receptionRooms * 30000;
    basePrice += input.area * 1500;

    if (input.tenure === 'Freehold') basePrice *= 1.1;

    const energyRatingModifiers: Record<EnergyRating, number> = { 'A': 1.1, 'B': 1.05, 'C': 1.0, 'D': 0.95, 'E': 0.9, 'F': 0.85, 'G': 0.8 };
    basePrice *= energyRatingModifiers[input.currentEnergyRating];
    
    // Simulate some location effect based on outcode (very simplified)
    if (input.outcode.startsWith('SW') || input.outcode.startsWith('W') || input.outcode.startsWith('N')) {
      basePrice *= 1.2;
    } else if (input.outcode.startsWith('E') || input.outcode.startsWith('SE')) {
      basePrice *= 1.05;
    }


    const [saleYear, saleMonth] = input.monthOfSale.split('-').map(Number);
    const predictedPrice = Math.round(basePrice / 1000) * 1000;

    const priceHistoryChartData = [];
    let lastPrice = predictedPrice * 0.98; // Start 12 months of history slightly lower
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(saleYear, saleMonth -1 + i, 1); // month is 0-indexed
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      lastPrice = lastPrice * (1 + (Math.random() * 0.015 - 0.004)); // Slight random fluctuation
      priceHistoryChartData.push({
        month: `${month} ${year}`,
        price: Math.round(lastPrice / 1000) * 1000, // Round to nearest 1000
      });
    }
    
    const fakeOutput: PredictionOutput = {
      predictedPrice: predictedPrice,
      priceTrend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as 'increasing' | 'decreasing' | 'stable',
      averageAreaPrice: Math.round((predictedPrice * (0.8 + Math.random() * 0.3)) / 1000) * 1000, // Random average around predicted
      priceHistoryChartData: priceHistoryChartData,
    };
    
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    return fakeOutput;
  }
);
