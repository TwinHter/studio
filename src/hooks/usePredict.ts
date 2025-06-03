
"use client";

import { useMutation } from '@tanstack/react-query';
import { fetchFakePredictionForHook } from '@/services/api';
import type { PredictionInput, PredictionOutput } from '@/ai/flows/price-prediction';
import { useToast } from './use-toast';

export function usePredict() {
  const { toast } = useToast();

  const mutation = useMutation<PredictionOutput, Error, PredictionInput>({
    mutationFn: fetchFakePredictionForHook,
    onSuccess: (data, variables) => {
      toast({
        title: "Fake Prediction Successful (Hook)",
        description: `Price predicted for property at ${variables.fullAddress.substring(0,30)}... using fake data.`,
      });
    },
    onError: (error) => {
      console.error('Fake Prediction failed (Hook):', error);
      toast({
        title: "Fake Prediction Failed (Hook)",
        description: "Could not retrieve fake prediction. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    predict: mutation.mutateAsync, // Expose mutateAsync for promise-based handling if needed
    isPredicting: mutation.isPending,
    predictionData: mutation.data,
    predictionError: mutation.error,
    resetPrediction: mutation.reset,
  };
}
