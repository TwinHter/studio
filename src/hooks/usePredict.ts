
"use client";

import { useMutation } from '@tanstack/react-query';
import type { PredictionInput, PredictionOutput } from '@/ai/flows/price-prediction';
import { predictPrice } from '@/ai/flows/price-prediction'; // Import the Genkit flow directly
import { useToast } from './use-toast';

// const fastapiBaseUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000'; // No longer needed

export function usePredict() {
  const { toast } = useToast();

  const mutation = useMutation<PredictionOutput, Error, PredictionInput>({
    mutationFn: async (inputData: PredictionInput) => {
      // Directly call the Genkit AI flow (which is currently mocked)
      return predictPrice(inputData);
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Prediction Generated",
        description: `The price prediction for the property has been calculated.`,
      });
    },
    onError: (error: any) => { 
      console.error('Prediction failed:', error);
      let errorMessage = "Could not retrieve the price prediction. Please check your input and try again.";
      if (error.message) {
        errorMessage = error.message;
      }
      toast({
        title: "Prediction Failed",
        description: errorMessage,
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
