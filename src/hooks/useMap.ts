
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
        title: "Region Data Loaded",
        description: `Market data for ${data.regionName} (${data.regionId}) is now available.`,
      });
    },
    onError: (error, regionId) => {
      console.error(`Failed to fetch market data for ${regionId}:`, error);
      toast({
        title: "Error Loading Region Data",
        description: `Could not load market data for ${regionId}. Please try selecting it again.`,
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

