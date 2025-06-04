
"use client";

import { useMutation } from '@tanstack/react-query';
import axios from 'axios'; // Import axios
import type { PredictionInput, PredictionOutput } from '@/ai/flows/price-prediction';
import { useToast } from './use-toast';

export function usePredict() {
  const { toast } = useToast();

  const mutation = useMutation<PredictionOutput, Error, PredictionInput>({
    mutationFn: async (inputData: PredictionInput) => {
      // Use axios to POST to the new API endpoint
      const response = await axios.post<PredictionOutput>('/api/predict', inputData);
      return response.data; // Axios wraps the response in a 'data' property
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Prediction Generated",
        description: `The price prediction for the property has been calculated.`,
      });
    },
    onError: (error: any) => { // Use 'any' or a more specific axios error type
      console.error('Prediction failed:', error);
      const errorMessage = error.response?.data?.message || error.message || "Could not retrieve the price prediction. Please check your input and try again.";
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
