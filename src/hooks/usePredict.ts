
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
        title: "Prediction Successful",
        description: `Price predicted for property at ${variables.fullAddress.substring(0,30)}...`,
      });
    },
    onError: (error) => {
      console.error('Prediction failed:', error);
      toast({
        title: "Prediction Failed",
        description: "Could not retrieve prediction. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    predict: mutation.mutateAsync,
    isPredicting: mutation.isPending,
    predictionData: mutation.data,
    predictionError: mutation.error,
    resetPrediction: mutation.reset,
  };
}

