
"use client";

import { useMutation } from '@tanstack/react-query';
import { fetchFakeRegionInsightsForHook } from '@/services/api';
import type { RegionPriceInsightsInput, RegionPriceInsightsOutput } from '@/ai/flows/region-insights';
import { useToast } from './use-toast';

export function useMap() {
  const { toast } = useToast();

  const mutation = useMutation<RegionPriceInsightsOutput, Error, RegionPriceInsightsInput>({
    mutationFn: fetchFakeRegionInsightsForHook,
    onSuccess: (data, variables) => {
      toast({
        title: `Fake Insights for ${variables.region} (Hook)`,
        description: "Successfully fetched simulated insights for the region.",
      });
    },
    onError: (error, variables) => {
      console.error(`Failed to fetch fake insights for ${variables.region} (Hook):`, error);
      toast({
        title: `Error Fetching Insights for ${variables.region} (Hook)`,
        description: "Could not load fake insights. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    getInsights: mutation.mutateAsync,
    isFetchingInsights: mutation.isPending,
    insightsData: mutation.data,
    insightsError: mutation.error,
    resetInsights: mutation.reset,
  };
}
