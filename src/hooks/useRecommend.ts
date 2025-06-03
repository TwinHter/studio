
"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchFakePropertiesForHook, addFakePropertyForHook } from '@/services/api';
import type { Property } from '@/types';
import { useToast } from './use-toast';
import { PLACEHOLDER_HINTS } from '@/lib/constants';

// Type for the data passed to the addProperty mutation
export type NewPropertyData = Omit<Property, 'id' | 'image' | 'dataAiHint'> & { imageFile: FileList };


export function useRecommend() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { 
    data: properties = [], // Default to empty array
    isLoading: isLoadingProperties, 
    error: fetchPropertiesError 
  } = useQuery<Property[], Error>({
    queryKey: ['fakeProperties'],
    queryFn: fetchFakePropertiesForHook,
  });

  const addPropertyMutation = useMutation<Property, Error, NewPropertyData>({
    mutationFn: async (newPropertyData) => {
      // Convert FileList to data URL string before sending to the "API"
      const imageFile = newPropertyData.imageFile[0];
      const imageAsDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });
      
      const propertyToSave: Omit<Property, 'id'> & { image: string } = {
        name: newPropertyData.name,
        address: newPropertyData.address,
        price: newPropertyData.price,
        type: newPropertyData.type,
        bedrooms: newPropertyData.bedrooms,
        bathrooms: newPropertyData.bathrooms,
        receptionRooms: newPropertyData.receptionRooms,
        area: newPropertyData.area,
        energyRating: newPropertyData.energyRating,
        tenure: newPropertyData.tenure,
        region: newPropertyData.region,
        description: newPropertyData.description,
        image: imageAsDataUrl, // Pass the data URL
        dataAiHint: PLACEHOLDER_HINTS.uploadedProperty, // Add default hint
      };
      return addFakePropertyForHook(propertyToSave);
    },
    onSuccess: (newProperty) => {
      // Manually update the cache for 'fakeProperties'
      queryClient.setQueryData<Property[]>(['fakeProperties'], (oldProperties = []) => {
        return [newProperty, ...oldProperties];
      });
      toast({
        title: "Property Added (Hook)",
        description: `${newProperty.name} has been added to the list (simulated).`,
      });
    },
    onError: (error) => {
      console.error('Failed to add property (Hook):', error);
      toast({
        title: "Failed to Add Property (Hook)",
        description: "Could not add the property. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    properties,
    isLoadingProperties,
    fetchPropertiesError,
    addProperty: addPropertyMutation.mutateAsync,
    isAddingProperty: addPropertyMutation.isPending,
    addPropertyError: addPropertyMutation.error,
  };
}
