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

const PredictionInputSchema = z.object({
  location: z.string().describe('The postcode or area of the property.'),
  propertyType: z.enum(['Flat', 'Detached', 'Terraced', 'Semi-detached']).describe('The type of property.'),
  bedrooms: z.number().int().positive().describe('The number of bedrooms in the property.'),
  area: z.number().positive().optional().describe('The area of the property in square meters (optional).'),
  year: z.number().int().min(2024).describe('The year for which the price should be predicted.'),
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

You will receive property details and must predict its price for the specified year, along with an estimation of the price trend in the next 12 months. You must also provide the average price for similar properties in the same area.

Property Details:
Location: {{{location}}}
Property Type: {{{propertyType}}}
Bedrooms: {{{bedrooms}}}
Area: {{{area}}}
Year: {{{year}}}

Consider factors such as historical price data (1991-2023), property type, location, and current market trends.

Output the predicted price, price trend (increasing, decreasing, or stable), average price for similar properties in the area, and the predicted price for the next 12 months.

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

Ensure that the priceHistoryChartData includes predictions for each month of the next 12 months from now and that prices are realistic for the London property market.`,
});

const predictPriceFlow = ai.defineFlow(
  {
    name: 'predictPriceFlow',
    inputSchema: PredictionInputSchema,
    outputSchema: PredictionOutputSchema,
  },
  async (input: PredictionInput): Promise<PredictionOutput> => {
    // Fake data implementation
    const basePrice = 500000 + (input.bedrooms * 50000) + (input.area ? input.area * 1000 : 0);
    const currentYear = new Date().getFullYear();
    const yearDifference = input.year - currentYear;
    const predictedPrice = basePrice * (1 + (yearDifference * 0.05)); // 5% increase per year

    const priceHistoryChartData = [];
    let lastPrice = predictedPrice * 0.95; // Start 12 months ago price a bit lower
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      lastPrice = lastPrice * (1 + (Math.random() * 0.02 - 0.005)); // Slight random fluctuation
      priceHistoryChartData.push({
        month: `${month} ${year}`,
        price: Math.round(lastPrice / 1000) * 1000, // Round to nearest 1000
      });
    }
    
    const fakeOutput: PredictionOutput = {
      predictedPrice: Math.round(predictedPrice / 1000) * 1000,
      priceTrend: 'increasing',
      averageAreaPrice: Math.round((basePrice * 0.9) / 1000) * 1000,
      priceHistoryChartData: priceHistoryChartData,
    };
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    return fakeOutput;
  }
);

