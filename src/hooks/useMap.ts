
"use client";

import { useMutation } from '@tanstack/react-query';
import { fetchFakeRegionMarketDataForHook } from '@/services/api';
import type { RegionMarketData } from '@/types';
import { useToast } from './use-toast';

export function useMap() {
  const { toast } = useToast();

  const mutation = useMutation<RegionMarketData, Error, string>({ // Input is regionId (string)
    mutationFn: fetchFakeRegionMarketDataForHook,
    onSuccess: (data) => {
      toast({
        title: `Market Data for ${data.regionId}`,
        description: "Successfully fetched market data for the region.",
      });
    },
    onError: (error, regionId) => {
      console.error(`Failed to fetch market data for ${regionId}:`, error);
      toast({
        title: `Error Fetching Market Data for ${regionId}`,
        description: "Could not load market data. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    fetchMarketData: mutation.mutateAsync,
    isFetchingMarketData: mutation.isPending,
    marketData: mutation.data,
    marketDataError: mutation.error,
    resetMarketData: mutation.reset,
  };
}
