// src/ai/flows/region-insights.ts
'use server';
/**
 * @fileOverview A flow that provides insights into property price forecasts for a specific London region.
 *
 * - getRegionPriceInsights - A function that retrieves the price insights for a given region.
 * - RegionPriceInsightsInput - The input type for the getRegionPriceInsights function.
 * - RegionPriceInsightsOutput - The return type for the getRegionPriceInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RegionPriceInsightsInputSchema = z.object({
  region: z.string().describe('The London region (outcode) to get price insights for, e.g., E1, SW1.'),
});
export type RegionPriceInsightsInput = z.infer<typeof RegionPriceInsightsInputSchema>;

const RegionPriceInsightsOutputSchema = z.object({
  summary: z.string().describe('A summary of the price forecast for the region, including potential opportunities and risks.'),
});
export type RegionPriceInsightsOutput = z.infer<typeof RegionPriceInsightsOutputSchema>;

export async function getRegionPriceInsights(input: RegionPriceInsightsInput): Promise<RegionPriceInsightsOutput> {
  return regionPriceInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'regionPriceInsightsPrompt',
  input: {schema: RegionPriceInsightsInputSchema},
  output: {schema: RegionPriceInsightsOutputSchema},
  prompt: `You are an expert real estate analyst specializing in the London property market.

You will provide a concise summary of the price forecast for the given region, highlighting potential opportunities and risks for potential buyers and investors.

Region: {{{region}}}
`,
});

const regionPriceInsightsFlow = ai.defineFlow(
  {
    name: 'regionPriceInsightsFlow',
    inputSchema: RegionPriceInsightsInputSchema,
    outputSchema: RegionPriceInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
